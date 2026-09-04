import { useState } from 'react'
import { Card } from './ui/Card'
import { ProgressBar } from './ui/ProgressBar'
import { getPriorityDot } from '../utils/time'
import type { Task, NewTask, Priority } from '../types'

interface TaskWidgetProps {
    tasks: Task[]
    doneTasks: Task[]
    completionRate: number
    onAdd: (task: NewTask) => Promise<Task>
    onToggle: (id: number) => Promise<void | Task | undefined>
    onDelete: (id: number) => Promise<void>
    onUpdate?: (id: number, patch: Partial<Task>) => Promise<Task | null>
    showQuickAdd?: boolean
    onFocusTask?: (taskId: number, minutes: number) => void
}

export function TaskWidget({
    tasks,
    doneTasks,
    completionRate,
    onAdd,
    onToggle,
    onDelete,
    showQuickAdd = false,
    onFocusTask,
}: TaskWidgetProps) {
    const [showAddForm, setShowAddForm] = useState(showQuickAdd)
    const [filter, setFilter] = useState('All')
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

    const todoTasks = tasks.filter((t) => t.status === 'todo')
    const completedTasks = tasks.filter((t) => t.status === 'done')

    const filteredTodo = todoTasks.filter((t) => {
        if (filter === 'All') return true
        if (filter === 'High') return t.priority === 'high'
        return t.category.toLowerCase() === filter.toLowerCase()
    })

    return (
        <Card className="animate-fade-in relative overflow-hidden">
            {/* macOS Widget Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/90 tracking-tight uppercase">
                        Today's Tasks
                    </span>
                    <span className="text-[10px] font-mono text-white/40">
                        {doneTasks.length}/{tasks.length}
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-[10px] font-semibold transition-all cursor-pointer"
                    >
                        + Add
                    </button>
                </div>
            </div>

            {/* Progress Capsule */}
            <div className="mb-2.5">
                <ProgressBar
                    value={completionRate}
                    color={completionRate >= 80 ? 'bg-emerald-500' : completionRate >= 50 ? 'bg-blue-500' : 'bg-amber-500'}
                    height="h-1"
                />
            </div>

            {/* macOS Segmented Category Filters */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-2 scrollbar-hide">
                {['All', 'High', 'Coding', 'Study', 'General'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                            filter === cat
                                ? 'bg-white/15 text-white font-semibold'
                                : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                        }`}
                    >
                        {cat === 'High' ? '🔥 Urgent' : cat}
                    </button>
                ))}
            </div>

            {/* Add Task Quick Form */}
            {showAddForm && (
                <form onSubmit={handleAdd} className="mb-2.5 p-2 rounded-xl bg-white/[0.05] border border-white/10 animate-slide-up">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Task title..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-transparent text-xs text-white placeholder-white/30 outline-none mb-2 font-medium"
                    />
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                        <select
                            value={newPriority}
                            onChange={(e) => setNewPriority(e.target.value as Priority)}
                            className="bg-white/10 text-white/80 rounded-lg px-2 py-0.5 outline-none border border-white/10"
                        >
                            <option value="high" className="bg-[#1a1d26]">🔴 High</option>
                            <option value="medium" className="bg-[#1a1d26]">🟡 Medium</option>
                            <option value="low" className="bg-[#1a1d26]">🟢 Low</option>
                        </select>

                        <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="bg-white/10 text-white/80 rounded-lg px-2 py-0.5 outline-none border border-white/10"
                        >
                            {['General', 'Coding', 'Study', 'LeetCode', 'GitHub', 'Work'].map((c) => (
                                <option key={c} value={c} className="bg-[#1a1d26]">{c}</option>
                            ))}
                        </select>

                        <div className="flex items-center gap-1 font-mono text-[10px] text-white/50">
                            <span>⏱</span>
                            <input
                                type="number"
                                min={5}
                                max={480}
                                value={newEst}
                                onChange={(e) => setNewEst(Number(e.target.value))}
                                className="w-10 bg-white/10 text-white rounded px-1 py-0.5 outline-none border border-white/10 text-right"
                            />
                            <span>m</span>
                        </div>

                        <div className="flex items-center gap-1.5 ml-auto">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-2 py-0.5 text-[10px] text-white/40 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-2.5 py-0.5 text-[10px] bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold shadow-sm"
                            >
                                Add Task
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Task list */}
            <div className="space-y-1 max-h-56 overflow-y-auto scrollbar-hide">
                {filteredTodo.map((task) => (
                    <div
                        key={task.id}
                        className="group flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] hover:border-white/[0.08] transition-all"
                    >
                        {/* Checkbox & title */}
                        <div className="flex items-center gap-2 truncate flex-1 mr-2">
                            <button
                                onClick={() => onToggle(task.id)}
                                className="w-4 h-4 rounded-md border border-white/20 hover:border-blue-400 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors"
                            />
                            <span className="text-[10px] flex-shrink-0">{getPriorityDot(task.priority)}</span>
                            <span className="text-xs text-white/90 truncate font-medium">{task.title}</span>
                        </div>

                        {/* Actions right */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[9px] text-white/40 px-1.5 py-0.2 rounded-md bg-white/[0.04] font-mono">
                                {task.category}
                            </span>
                            <span className="text-[9px] text-white/30 font-mono">
                                {task.est_minutes}m
                            </span>

                            {/* 1-Click Focus Button */}
                            {onFocusTask && (
                                <button
                                    onClick={() => onFocusTask(task.id, task.est_minutes || 25)}
                                    className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-400 hover:text-blue-300 px-1.5 py-0.5 rounded bg-blue-500/15 transition-opacity cursor-pointer flex items-center gap-0.5"
                                    title="Launch Focus Session for this task"
                                >
                                    <span>▶</span>
                                    <span>Focus</span>
                                </button>
                            )}

                            {/* Delete */}
                            <button
                                onClick={() => onDelete(task.id)}
                                className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-rose-400 text-xs transition-opacity cursor-pointer ml-0.5"
                                title="Delete task"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}

                {/* Completed Tasks section */}
                {completedTasks.length > 0 && (
                    <div className="pt-2">
                        <div className="text-[9px] text-white/30 uppercase tracking-wider font-mono mb-1">
                            Completed ({completedTasks.length})
                        </div>
                        {completedTasks.slice(0, 3).map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center justify-between px-2.5 py-1 rounded-xl opacity-40 hover:opacity-75 transition-opacity text-xs"
                            >
                                <div className="flex items-center gap-2 truncate flex-1">
                                    <span className="text-emerald-400 text-xs">✓</span>
                                    <span className="line-through text-white/60 truncate">{task.title}</span>
                                </div>
                                <button
                                    onClick={() => onDelete(task.id)}
                                    className="text-white/30 hover:text-rose-400 text-[10px]"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {tasks.length === 0 && (
                    <div className="text-xs text-white/40 text-center py-4 font-mono">
                        No tasks yet — hit + Add above
                    </div>
                )}
            </div>
        </Card>
    )
}
