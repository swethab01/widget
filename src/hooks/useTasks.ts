import { useState, useEffect, useCallback } from 'react'
import type { Task, NewTask } from '../types'

const LOCAL_STORAGE_KEY = 'devpulse_tasks_backup'

const DEFAULT_SAMPLE_TASKS: Task[] = [
    { id: 1, title: 'Solve LeetCode Daily Problem', priority: 'high', category: 'LeetCode', status: 'todo', due_time: null, est_minutes: 25, actual_minutes: 0, created_at: new Date().toISOString(), completed_at: null },
    { id: 2, title: 'Review GitHub Pull Requests', priority: 'medium', category: 'GitHub', status: 'todo', due_time: null, est_minutes: 20, actual_minutes: 0, created_at: new Date().toISOString(), completed_at: null },
    { id: 3, title: 'Build and test desktop widgets', priority: 'high', category: 'Coding', status: 'todo', due_time: null, est_minutes: 45, actual_minutes: 0, created_at: new Date().toISOString(), completed_at: null },
]

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
            if (saved) return JSON.parse(saved)
        } catch {}
        return DEFAULT_SAMPLE_TASKS
    })
    const [loading, setLoading] = useState(true)

    const saveToLocalStorage = (list: Task[]) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
        } catch {}
    }

    const fetchTasks = useCallback(async () => {
        try {
            if (window.electronAPI?.tasks?.getToday) {
                const data = await window.electronAPI.tasks.getToday()
                if (Array.isArray(data)) {
                    setTasks(data)
                    saveToLocalStorage(data)
                }
            }
        } catch (e) {
            console.error('Failed to fetch tasks', e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTasks()

        const handleTasksChanged = () => {
            fetchTasks()
        }

        if (window.electronAPI?.on) {
            window.electronAPI.on('tasks:changed', handleTasksChanged)
        }

        return () => {
            if (window.electronAPI?.off) {
                window.electronAPI.off('tasks:changed', handleTasksChanged)
            }
        }
    }, [fetchTasks])

    const addTask = async (task: NewTask) => {
        const tempId = Date.now()
        const optimisticTask: Task = {
            id: tempId,
            title: task.title,
            priority: task.priority || 'medium',
            category: task.category || 'General',
            status: 'todo',
            due_time: task.due_time || null,
            est_minutes: task.est_minutes || 25,
            actual_minutes: 0,
            created_at: new Date().toISOString(),
            completed_at: null,
        }

        // Optimistic instant add
        setTasks((prev) => {
            const next = [optimisticTask, ...prev]
            saveToLocalStorage(next)
            return next
        })

        if (window.electronAPI?.tasks?.add) {
            try {
                const created = await window.electronAPI.tasks.add(task)
                if (created) {
                    setTasks((prev) => {
                        const next = prev.map((t) => (t.id === tempId ? created : t))
                        saveToLocalStorage(next)
                        return next
                    })
                    return created
                }
            } catch (err) {
                console.error('Failed to add task via IPC:', err)
            }
        }

        return optimisticTask
    }

    const updateTask = async (id: number, patch: Partial<Task>) => {
        setTasks((prev) => {
            const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
            saveToLocalStorage(next)
            return next
        })

        if (window.electronAPI?.tasks?.update) {
            try {
                const updated = await window.electronAPI.tasks.update(id, patch)
                if (updated) {
                    setTasks((prev) => {
                        const next = prev.map((t) => (t.id === id ? updated : t))
                        saveToLocalStorage(next)
                        return next
                    })
                    return updated
                }
            } catch (err) {
                console.error('Failed to update task via IPC:', err)
            }
        }
        return null
    }

    const deleteTask = async (id: number) => {
        setTasks((prev) => {
            const next = prev.filter((t) => t.id !== id)
            saveToLocalStorage(next)
            return next
        })

        if (window.electronAPI?.tasks?.delete) {
            try {
                await window.electronAPI.tasks.delete(id)
            } catch (err) {
                console.error('Failed to delete task via IPC:', err)
            }
        }
    }

    const completeTask = async (id: number) => {
        const now = new Date().toISOString()
        setTasks((prev) => {
            const next = prev.map((t) => (t.id === id ? { ...t, status: 'done' as const, completed_at: now } : t))
            saveToLocalStorage(next)
            return next
        })

        if (window.electronAPI?.tasks?.complete) {
            try {
                const updated = await window.electronAPI.tasks.complete(id)
                if (updated) {
                    setTasks((prev) => {
                        const next = prev.map((t) => (t.id === id ? updated : t))
                        saveToLocalStorage(next)
                        return next
                    })
                    return updated
                }
            } catch (err) {
                console.error('Failed to complete task via IPC:', err)
            }
        }
        return null
    }

    const toggleTask = async (id: number) => {
        const task = tasks.find((t) => t.id === id)
        if (!task) return

        const isCurrentlyDone = task.status === 'done'
        const nextStatus = isCurrentlyDone ? 'todo' : 'done'
        const nextCompletedAt = isCurrentlyDone ? null : new Date().toISOString()

        // 0ms instant optimistic update
        setTasks((prev) => {
            const next = prev.map((t) =>
                t.id === id ? { ...t, status: nextStatus, completed_at: nextCompletedAt } : t
            )
            saveToLocalStorage(next)
            return next
        })

        try {
            if (window.electronAPI?.tasks) {
                if (!isCurrentlyDone) {
                    const updated = await window.electronAPI.tasks.complete(id)
                    if (updated) {
                        setTasks((prev) => {
                            const next = prev.map((t) => (t.id === id ? updated : t))
                            saveToLocalStorage(next)
                            return next
                        })
                    }
                } else {
                    const updated = await window.electronAPI.tasks.update(id, {
                        status: 'todo',
                        completed_at: null,
                    })
                    if (updated) {
                        setTasks((prev) => {
                            const next = prev.map((t) => (t.id === id ? updated : t))
                            saveToLocalStorage(next)
                            return next
                        })
                    }
                }
            }
        } catch (err) {
            console.error('Failed to toggle task via IPC:', err)
            fetchTasks()
        }
    }

    const tickAllTasks = async () => {
        const pending = tasks.filter((t) => t.status === 'todo')
        if (pending.length === 0) return

        const now = new Date().toISOString()
        setTasks((prev) => {
            const next = prev.map((t) => ({ ...t, status: 'done' as const, completed_at: now }))
            saveToLocalStorage(next)
            return next
        })

        for (const t of pending) {
            if (window.electronAPI?.tasks?.complete) {
                try {
                    await window.electronAPI.tasks.complete(t.id)
                } catch {}
            }
        }
    }

    const doneTasks = tasks.filter((t) => t.status === 'done')
    const todoTasks = tasks.filter((t) => t.status === 'todo')
    const completionRate = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0

    return {
        tasks,
        doneTasks,
        todoTasks,
        loading,
        completionRate,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        toggleTask,
        tickAllTasks,
        refresh: fetchTasks,
    }
}
