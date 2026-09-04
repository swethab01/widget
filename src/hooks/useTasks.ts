import { useState, useEffect, useCallback } from 'react'
import type { Task, NewTask } from '../types'

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    const fetchTasks = useCallback(async () => {
        try {
            const data = await window.electronAPI.tasks.getToday()
            setTasks(data)
        } catch (e) {
            console.error('Failed to fetch tasks', e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const addTask = async (task: NewTask) => {
        const created = await window.electronAPI.tasks.add(task)
        setTasks((prev) => [created, ...prev])
        return created
    }

    const updateTask = async (id: number, patch: Partial<Task>) => {
        const updated = await window.electronAPI.tasks.update(id, patch)
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
        return updated
    }

    const deleteTask = async (id: number) => {
        await window.electronAPI.tasks.delete(id)
        setTasks((prev) => prev.filter((t) => t.id !== id))
    }

    const completeTask = async (id: number) => {
        const updated = await window.electronAPI.tasks.complete(id)
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
        return updated
    }

    const toggleTask = async (id: number) => {
        const task = tasks.find((t) => t.id === id)
        if (!task) return
        if (task.status === 'done') {
            return updateTask(id, { status: 'todo', completed_at: null } as Partial<Task>)
        } else {
            return completeTask(id)
        }
    }

    const todayTasks = tasks
    const doneTasks = tasks.filter((t) => t.status === 'done')
    const todoTasks = tasks.filter((t) => t.status === 'todo')
    const completionRate = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0

    return {
        tasks: todayTasks,
        doneTasks,
        todoTasks,
        loading,
        completionRate,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        toggleTask,
        refresh: fetchTasks,
    }
}
