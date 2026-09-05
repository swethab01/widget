import { useState } from 'react'
import type { Task, NewTask, Priority } from '../../types'

interface MacTasksWidgetProps {
    tasks: Task[]
    doneTasks: Task[]
    completionRate: number
    onAdd: (task: NewTask) => Promise<Task>
    onToggle: (id: number) => Promise<void | Task | undefined>
    onDelete: (id: number) => Promise<void>
    onFocusTask?: (taskId: number, minutes: number) => void
    className?: string
}

export function MacTasksWidget({
    tasks,
    doneTasks,
    completionRate,
    onAdd,
    onToggle,
    onDelete,
    onFocusTask,
    className = '',
}: MacTasksWidgetProps) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [filter, setFilter] = useState('All')
    const [newTitle, setNewTitle] = useState('')
    const [newPriority, setNewPriority] = useState<Priority>('medium')
    const [newCategory, setNewCategory] = useState('Coding')
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
        setNewCategory('Coding')
        setNewEst(25)
        setShowAddForm(false)
    }

    const todoTasks = tasks.filter((t) => t.status === 'todo')
    const filteredTasks = todoTasks.filter((t) => {
        if (filter === 'All') return true
        if (filter === 'Urgent') return t.priority === 'high'
        return t.category.toLowerCase() === filter.toLowerCase()
    })

    return (
        <div
            className={`mac-widget-tile p-4 flex flex-col justify-between select-none col-span-1 md:col-span-2 ${className}`}
        >
            {/* Header: Title, Completed Count, + Add Button */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400 mac-pulse-dot" />
                        <span className="text-[11px] font-bold tracking-wider uppercase text-white/90 font-mono">
                            TODAY'S TASKS
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.08] text-white/60">
                            {doneTasks.length}/{tasks.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setShowAddForm((prev) => !prev)}
                            className="px-2.5 py-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-white text-[10px] font-semibold border border-blue-500/30 transition-all cursor-pointer flex items-center gap-1"
                        >
                            <span>{showAddForm ? '✕ Cancel' : '+ Add Task'}</span>
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden mb-2.5">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(completionRate, 4)}%` }}
                    />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-2 scrollbar-hide text-[10px]">
                    {['All', 'Urgent', 'Coding', 'GitHub', 'LeetCode'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                                filter === cat
                                    ? 'bg-white/20 text-white font-semibold shadow-sm'
                                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.06]'
                            }`}
                        >
                            {cat === 'Urgent' ? '🔥 Urgent' : cat}
                        </button>
                    ))}
                </div>

                {/* Inline Quick Add Form */}
                {showAddForm && (
                    <form
                        onSubmit={handleAdd}
                        className="mb-3 p-2.5 rounded-xl bg-black/40 border border-white/15 animate-fade-in"
                    >
                        <input
                            autoFocus
                            type="text"
                            placeholder="What do you want to accomplish?"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full bg-transparent text-xs text-white placeholder-white/40 outline-none mb-2 font-medium"
                        />
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                            <select
                                value={newPriority}
                                onChange={(e) => setNewPriority(e.target.value as Priority)}
                                className="bg-white/10 text-white text-[10px] rounded-lg px-2 py-1 outline-none border border-white/10"
                            >
                                <option value="high" className="bg-[#1a1d26]">🔴 High Priority</option>
                                <option value="medium" className="bg-[#1a1d26]">🟡 Medium</option>
                                <option value="low" className="bg-[#1a1d26]">🟢 Low</option>
                            </select>

                            <select
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="bg-white/10 text-white text-[10px] rounded-lg px-2 py-1 outline-none border border-white/10"
                            >
                                {['Coding', 'GitHub', 'LeetCode', 'Study', 'General'].map((c) => (
                                    <option key={c} value={c} className="bg-[#1a1d26]">
                                        {c}
                                    </option>
                                ))}
                            </select>

                            <div className="flex items-center gap-1 font-mono text-[10px] text-white/50">
                                <span>⏱</span>
                                <input
                                    type="number"
                                    min={5}
                                    max={180}
                                    value={newEst}
                                    onChange={(e) => setNewEst(Number(e.target.value))}
                                    className="w-9 bg-white/10 text-white text-[10px] rounded px-1 py-0.5 outline-none border border-white/10 text-center"
                                />
                                <span>m</span>
                            </div>

                            <button
                                type="submit"
                                className="ml-auto px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold text-[10px] shadow transition-all cursor-pointer"
                            >
                                Add
                            </button>
                        </div>
                    </form>
                )}

                {/* Task items list */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-hide pr-0.5">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-6 text-xs text-white/40 font-mono">
                            {tasks.length === 0 ? 'No tasks yet — click + Add Task above' : 'All clear in this category!'}
                        </div>
                    ) : (
                        filteredTasks.map((task) => (
                            <div
                                key={task.id}
                                className="group flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.04] hover:border-white/15 transition-all"
                            >
                                {/* Checkbox & Title */}
                                <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
                                    <button
                                        onClick={() => onToggle(task.id)}
                                        className="w-4 h-4 rounded-full border border-white/30 hover:border-emerald-400 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors"
                                    />
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                            task.priority === 'high'
                                                ? 'bg-rose-500'
                                                : task.priority === 'medium'
                                                ? 'bg-amber-400'
                                                : 'bg-emerald-400'
                                        }`}
                                    />
                                    <span className="text-xs text-white/90 truncate font-medium">
                                        {task.title}
                                    </span>
                                </div>

                                {/* Right Badges & Focus */}
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <span className="text-[9px] text-white/50 px-1.5 py-0.5 rounded-md bg-white/[0.05] font-mono">
                                        {task.category}
                                    </span>
                                    <span className="text-[9px] text-white/40 font-mono">
                                        {task.est_minutes}m
                                    </span>

                                    {onFocusTask && (
                                        <button
                                            onClick={() => onFocusTask(task.id, task.est_minutes || 25)}
                                            className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-300 hover:text-white px-2 py-0.5 rounded-md bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 transition-all cursor-pointer flex items-center gap-1"
                                            title="Start focus timer for this task"
                                        >
                                            <span>▶</span>
                                            <span>Focus</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => onDelete(task.id)}
                                        className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-rose-400 text-xs transition-colors cursor-pointer px-1"
                                        title="Delete task"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Footer summary */}
            <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-white/50">
                <span>
                    {doneTasks.length > 0 ? `${doneTasks.length} Completed Today ✓` : 'Focus Sprint Ready'}
                </span>
                <span className="text-blue-400 font-semibold">{completionRate}% Completion</span>
            </div>
        </div>
    )
}
