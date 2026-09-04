import { useState } from 'react'
import { Card } from './ui/Card'
import { ProgressBar } from './ui/ProgressBar'
import { Badge } from './ui/Badge'
import { getPriorityDot } from '../utils/time'
import type { Task, NewTask, Priority } from '../types'

interface TaskWidgetProps {
    tasks: Task[]
    doneTasks: Task[]
    completionRate: number
    onAdd: (task: NewTask) => Promise<Task>
    onToggle: (id: number) => Promise<void | Task | undefined>
    onDelete: (id: number) => Promise<void>
    onUpdate: (id: number, patch: Partial<Task>) => Promise<Task | null>
    showQuickAdd?: boolean
}

export function TaskWidget({
    tasks,
    doneTasks,
    completionRate,
    onAdd,
    onToggle,
    onDelete,
    showQuickAdd = false,
}: TaskWidgetProps) {
    const [showAddForm, setShowAddForm] = useState(showQuickAdd)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [newTitle, setNewTitle] = useState('')
    const [newPriority, setNewPriority] = useState<Priority>('medium')
    const [newCategory, setNewCategory] = useState('General')
    const [newEst, setNewEst] = useState(25)

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTitle.trim()) return
        await onAdd({
            title: newTitle.trim(),
            priority: newPriority,
            category: newCategory,
            est_minutes: newEst,
        })
        setNewTitle('')
        setNewPriority('medium')
        setNewCategory('General')
        setNewEst(25)
        setShowAddForm(false)
    }

    const priorityBadge = (p: Priority) => {
        const map: Record<Priority, 'red' | 'yellow' | 'green'> = {
            high: 'red',
            medium: 'yellow',
            low: 'green',
        }
        return map[p]
    }

    const todoTasks = tasks.filter((t) => t.status === 'todo')
    const completedTasks = tasks.filter((t) => t.status === 'done')

    return (
        <Card className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm">🎯</span>
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Today's Tasks</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary font-mono">
                        {doneTasks.length}/{tasks.length}
                    </span>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="w-5 h-5 rounded-md bg-accent/20 text-accent hover:bg-accent/30 transition-colors flex items-center justify-center text-xs font-bold"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
                <ProgressBar
                    value={completionRate}
                    color={completionRate >= 80 ? 'bg-accent-green' : completionRate >= 50 ? 'bg-accent' : 'bg-yellow-500'}
                    height="h-1"
                    showLabel
                />
            </div>

            {/* Add form */}
            {showAddForm && (
                <form onSubmit={handleAdd} className="mb-3 p-2 bg-surface-hover rounded-lg border border-surface-border animate-slide-up">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Task title..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-transparent text-xs text-text-primary placeholder-text-muted outline-none mb-2"
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                        <select
                            value={newPriority}
                            onChange={(e) => setNewPriority(e.target.value as Priority)}
                            className="bg-surface-border text-text-secondary text-xs rounded px-1.5 py-0.5 outline-none"
                        >
                            <option value="high">🔴 High</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="low">🟢 Low</option>
                        </select>
                        <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="bg-surface-border text-text-secondary text-xs rounded px-1.5 py-0.5 outline-none"
                        >
                            {['General', 'Coding', 'Study', 'LeetCode', 'GitHub', 'Work', 'Personal'].map((c) => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-text-muted">⏱</span>
                            <input
                                type="number"
                                min={5}
                                max={480}
                                value={newEst}
                                onChange={(e) => setNewEst(Number(e.target.value))}
                                className="w-12 bg-surface-border text-text-secondary text-xs rounded px-1 py-0.5 outline-none"
                            />
                            <span className="text-[10px] text-text-muted">min</span>
                        </div>
                        <div className="flex gap-1 ml-auto">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-2 py-0.5 text-[10px] text-text-muted hover:text-text-secondary rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-2 py-0.5 text-[10px] bg-accent rounded text-white hover:bg-blue-500 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Task list */}
            <div className="space-y-0.5 max-h-60 overflow-y-auto scrollbar-hide">
                {/* Todo tasks */}
                {todoTasks.map((task) => (
                    <TaskRow
                        key={task.id}
                        task={task}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        isEditing={editingId === task.id}
                        onEdit={() => setEditingId(task.id)}
                        onCancelEdit={() => setEditingId(null)}
                        priorityBadge={priorityBadge}
                    />
                ))}

                {/* Completed tasks (collapsed) */}
                {completedTasks.length > 0 && (
                    <div className="pt-1">
                        <div className="text-[10px] text-text-muted mb-0.5">Completed ({completedTasks.length})</div>
                        {completedTasks.map((task) => (
                            <TaskRow
                                key={task.id}
                                task={task}
                                onToggle={onToggle}
                                onDelete={onDelete}
                                isEditing={false}
                                onEdit={() => { }}
                                onCancelEdit={() => { }}
                                priorityBadge={priorityBadge}
                            />
                        ))}
                    </div>
                )}

                {tasks.length === 0 && (
                    <div className="text-[11px] text-text-muted text-center py-4">
                        No tasks yet — add one above ✨
                    </div>
                )}
            </div>
        </Card>
    )
}

interface TaskRowProps {
    task: Task
    onToggle: (id: number) => Promise<void | Task | undefined>
    onDelete: (id: number) => Promise<void>
    isEditing: boolean
    onEdit: () => void
    onCancelEdit: () => void
    priorityBadge: (p: Priority) => 'red' | 'yellow' | 'green'
}

function TaskRow({ task, onToggle, onDelete, priorityBadge }: TaskRowProps) {
    const isDone = task.status === 'done'

    return (
        <div className={`group flex items-center gap-2 px-1.5 py-1.5 rounded-md hover:bg-surface-hover transition-colors ${isDone ? 'opacity-50' : ''}`}>
            {/* Checkbox */}
            <button
                onClick={() => onToggle(task.id)}
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${isDone
                        ? 'bg-accent-green border-accent-green text-white'
                        : 'border-surface-border hover:border-accent'
                    }`}
            >
                {isDone && <span className="text-[8px]">✓</span>}
            </button>

            {/* Priority dot */}
            <span className="text-[10px] flex-shrink-0">{getPriorityDot(task.priority)}</span>

            {/* Title */}
            <span className={`flex-1 text-xs truncate ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                {task.title}
            </span>

            {/* Category badge */}
            <Badge variant={priorityBadge(task.priority)} size="xs">
                {task.category}
            </Badge>

            {/* Est time */}
            <span className="text-[10px] text-text-muted font-mono flex-shrink-0">{task.est_minutes}m</span>

            {/* Delete button (hover) */}
            <button
                onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 text-xs transition-opacity flex-shrink-0"
            >
                ✕
            </button>
        </div>
    )
}
