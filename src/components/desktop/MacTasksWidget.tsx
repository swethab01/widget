import { useState, useMemo } from 'react'
import type { Task, NewTask, Priority } from '../../types'

interface MacTasksWidgetProps {
    tasks: Task[]
    doneTasks: Task[]
    completionRate: number
    onAdd: (task: NewTask) => Promise<Task>
    onToggle: (id: number) => Promise<void | Task | undefined>
    onDelete: (id: number) => Promise<void>
    onFocusTask?: (taskId: number, minutes: number) => void
    onClose?: () => void
    className?: string
}

const CATEGORIES = ['Coding', 'LeetCode', 'GitHub', 'Bugfix', 'Study', 'General']
const EST_TIMES = [15, 25, 45, 60]

export function MacTasksWidget({
    tasks,
    doneTasks,
    completionRate,
    onAdd,
    onToggle,
    onDelete,
    onFocusTask,
    onClose,
    className = '',
}: MacTasksWidgetProps) {
    const [filter, setFilter] = useState('All')
    const [newTitle, setNewTitle] = useState('')
    const [newPriority, setNewPriority] = useState<Priority>('medium')
    const [newCategory, setNewCategory] = useState('Coding')
    const [newEst, setNewEst] = useState(25)
    const [showOptions, setShowOptions] = useState(false)
    const [showDoneList, setShowDoneList] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const todoTasks = useMemo(() => tasks.filter((t) => t.status === 'todo'), [tasks])

    // Total estimated time remaining for todo tasks
    const remainingMinutes = useMemo(
        () => todoTasks.reduce((acc, t) => acc + (t.est_minutes || 25), 0),
        [todoTasks]
    )

    const urgentCount = useMemo(
        () => todoTasks.filter((t) => t.priority === 'high').length,
        [todoTasks]
    )

    const filteredTasks = useMemo(() => {
        if (filter === 'Completed') return doneTasks
        return todoTasks.filter((t) => {
            if (filter === 'All') return true
            if (filter === 'Urgent') return t.priority === 'high'
            return t.category.toLowerCase() === filter.toLowerCase()
        })
    }, [filter, todoTasks, doneTasks])

    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        const title = newTitle.trim()
        if (!title || isSubmitting) return

        setIsSubmitting(true)
        try {
            await onAdd({
                title,
                priority: newPriority,
                category: newCategory,
                est_minutes: newEst,
            })
            setNewTitle('')
            // Reset to defaults
            setNewPriority('medium')
            setNewCategory('Coding')
            setNewEst(25)
            setShowOptions(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClearCompleted = async () => {
        for (const task of doneTasks) {
            await onDelete(task.id)
        }
    }

    const formatRemaining = (mins: number) => {
        if (mins < 60) return `${mins}m`
        const h = Math.floor(mins / 60)
        const m = mins % 60
        return m > 0 ? `${h}h ${m}m` : `${h}h`
    }

    return (
        <div
            className={`mac-widget-tile p-4 h-full flex flex-col justify-between select-none relative group transition-all duration-200 overflow-hidden ${className}`}
        >
            {/* Close button if provided */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shadow-md cursor-pointer z-30 transition-transform hover:scale-110 active:scale-95"
                    title="Close Tasks Widget"
                >
                    ✕
                </button>
            )}

            {/* Top Container */}
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[11px] text-blue-400 font-bold shadow-sm">
                            📋
                        </div>
                        <span className="text-[11px] font-bold tracking-wider uppercase text-white/90 font-mono">
                            TODAY'S TASKS
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.08] text-white/70">
                            {doneTasks.length}/{tasks.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 pr-6">
                        {remainingMinutes > 0 && (
                            <span
                                className="text-[10px] font-mono text-blue-400/90 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20"
                                title="Total estimated time remaining"
                            >
                                ⏱ {formatRemaining(remainingMinutes)}
                            </span>
                        )}
                        <span className="text-[10px] font-bold text-emerald-400 font-mono">
                            {completionRate}%
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden mb-3">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(completionRate, 4)}%` }}
                    />
                </div>

                {/* Quick Add Bar */}
                <form onSubmit={handleQuickAdd} className="mb-3">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            placeholder="Add a task for today... (Press Enter)"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onFocus={() => setShowOptions(true)}
                            className="w-full pl-3 pr-20 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-white/40 outline-none focus:border-blue-400/80 transition-all font-sans shadow-inner"
                        />
                        <div className="absolute right-1.5 flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setShowOptions(!showOptions)}
                                className={`text-[10px] px-1.5 py-1 rounded-md transition-colors cursor-pointer ${
                                    showOptions
                                        ? 'bg-blue-500/20 text-blue-300'
                                        : 'text-white/40 hover:text-white'
                                }`}
                                title="Configure priority & category"
                            >
                                ⚙
                            </button>
                            <button
                                type="submit"
                                disabled={!newTitle.trim() || isSubmitting}
                                className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-bold text-[10px] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                            >
                                + Add
                            </button>
                        </div>
                    </div>

                    {/* Expandable Options Drawer */}
                    {showOptions && (
                        <div className="mt-2 p-2.5 rounded-xl bg-black/70 border border-white/10 animate-fade-in space-y-2">
                            {/* Priority Selector */}
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-white/50 font-mono">Priority:</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setNewPriority('high')}
                                        className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                                            newPriority === 'high'
                                                ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                                                : 'bg-white/[0.04] text-white/50 hover:text-white'
                                        }`}
                                    >
                                        🔴 High
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewPriority('medium')}
                                        className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                                            newPriority === 'medium'
                                                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                                : 'bg-white/[0.04] text-white/50 hover:text-white'
                                        }`}
                                    >
                                        🟡 Med
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewPriority('low')}
                                        className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                                            newPriority === 'low'
                                                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                                                : 'bg-white/[0.04] text-white/50 hover:text-white'
                                        }`}
                                    >
                                        🟢 Low
                                    </button>
                                </div>
                            </div>

                            {/* Category Selector Chips */}
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-white/50 font-mono">Category:</span>
                                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setNewCategory(cat)}
                                            className={`px-2 py-0.5 rounded-md text-[9px] whitespace-nowrap transition-colors cursor-pointer ${
                                                newCategory === cat
                                                    ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40'
                                                    : 'bg-white/[0.04] text-white/50 hover:text-white'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Est Time Selector */}
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-white/50 font-mono">Estimate:</span>
                                <div className="flex items-center gap-1.5">
                                    {EST_TIMES.map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setNewEst(m)}
                                            className={`px-2 py-0.5 rounded-md text-[9px] font-mono transition-colors cursor-pointer ${
                                                newEst === m
                                                    ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40'
                                                    : 'bg-white/[0.04] text-white/50 hover:text-white'
                                            }`}
                                        >
                                            {m}m
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </form>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 scrollbar-hide text-[10px]">
                    <button
                        onClick={() => setFilter('All')}
                        className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                            filter === 'All'
                                ? 'bg-white/20 text-white font-semibold shadow-sm'
                                : 'text-white/40 hover:text-white/80 hover:bg-white/[0.06]'
                        }`}
                    >
                        All ({todoTasks.length})
                    </button>

                    {urgentCount > 0 && (
                        <button
                            onClick={() => setFilter('Urgent')}
                            className={`px-2 py-0.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                                filter === 'Urgent'
                                    ? 'bg-rose-500/30 text-rose-300 font-semibold border border-rose-500/40'
                                    : 'text-rose-400/70 hover:text-rose-300 bg-rose-500/10'
                            }`}
                        >
                            🔥 Urgent ({urgentCount})
                        </button>
                    )}

                    {['Coding', 'LeetCode', 'GitHub'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                                filter === cat
                                    ? 'bg-white/20 text-white font-semibold shadow-sm'
                                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.06]'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}

                    {doneTasks.length > 0 && (
                        <button
                            onClick={() => setFilter('Completed')}
                            className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                                filter === 'Completed'
                                    ? 'bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/40'
                                    : 'text-emerald-400/70 hover:text-emerald-300 bg-emerald-500/10'
                            }`}
                        >
                            ✓ Done ({doneTasks.length})
                        </button>
                    )}
                </div>

                {/* Tasks List */}
                <div className="space-y-1.5 max-h-52 overflow-y-auto scrollbar-hide pr-0.5">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-8 text-xs text-white/40 font-mono">
                            {tasks.length === 0 ? (
                                <div>
                                    <div className="text-base mb-1">🚀</div>
                                    <div>No tasks yet for today</div>
                                    <div className="text-[10px] text-white/30 mt-0.5">Type above and press Enter</div>
                                </div>
                            ) : filter === 'Completed' ? (
                                <div>No completed tasks yet — check one off!</div>
                            ) : (
                                <div>
                                    <div className="text-emerald-400 text-sm mb-1">✓</div>
                                    <div>All clear in this category!</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        filteredTasks.map((task) => {
                            const isDone = task.status === 'done'
                            return (
                                <div
                                    key={task.id}
                                    className={`group flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
                                        isDone
                                            ? 'bg-white/[0.02] border-white/[0.03] opacity-65'
                                            : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] hover:border-white/20'
                                    }`}
                                >
                                    {/* Checkbox & Title */}
                                    <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
                                        <button
                                            onClick={() => onToggle(task.id)}
                                            className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${
                                                isDone
                                                    ? 'bg-emerald-500 border-emerald-400 text-black font-bold text-[10px]'
                                                    : 'border-white/30 hover:border-emerald-400 hover:bg-emerald-500/20'
                                            }`}
                                            title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                                        >
                                            {isDone && '✓'}
                                        </button>

                                        {/* Priority Indicator */}
                                        {!isDone && (
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                                    task.priority === 'high'
                                                        ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                                                        : task.priority === 'medium'
                                                        ? 'bg-amber-400'
                                                        : 'bg-emerald-400'
                                                }`}
                                            />
                                        )}

                                        <span
                                            className={`text-xs truncate font-medium ${
                                                isDone
                                                    ? 'line-through text-white/40'
                                                    : 'text-white/90 group-hover:text-white'
                                            }`}
                                            title={task.title}
                                        >
                                            {task.title}
                                        </span>
                                    </div>

                                    {/* Right Badges & Actions */}
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <span className="text-[9px] text-white/50 px-1.5 py-0.5 rounded-md bg-white/[0.05] font-mono">
                                            {task.category}
                                        </span>
                                        <span className="text-[9px] text-white/40 font-mono">
                                            {task.est_minutes}m
                                        </span>

                                        {/* Focus Pomodoro Launcher */}
                                        {!isDone && onFocusTask && (
                                            <button
                                                onClick={() => onFocusTask(task.id, task.est_minutes || 25)}
                                                className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-300 hover:text-white px-2 py-0.5 rounded-md bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 transition-all cursor-pointer flex items-center gap-1"
                                                title="Start focus timer for this task"
                                            >
                                                <span>▶</span>
                                                <span>Focus</span>
                                            </button>
                                        )}

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => onDelete(task.id)}
                                            className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-rose-400 text-xs transition-colors cursor-pointer px-1"
                                            title="Delete task"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Collapsible Completed Section (when viewing All / categories) */}
                {filter !== 'Completed' && doneTasks.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/[0.06]">
                        <button
                            onClick={() => setShowDoneList(!showDoneList)}
                            className="w-full flex items-center justify-between text-[10px] text-emerald-400/80 hover:text-emerald-300 py-1 font-mono cursor-pointer transition-colors"
                        >
                            <span>✓ Completed Today ({doneTasks.length})</span>
                            <span>{showDoneList ? '▲ Hide' : '▼ View'}</span>
                        </button>

                        {showDoneList && (
                            <div className="space-y-1 mt-1 max-h-28 overflow-y-auto scrollbar-hide">
                                {doneTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] text-white/50"
                                    >
                                        <div className="flex items-center gap-2 truncate flex-1">
                                            <button
                                                onClick={() => onToggle(task.id)}
                                                className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] flex items-center justify-center cursor-pointer"
                                                title="Uncheck to restore"
                                            >
                                                ✓
                                            </button>
                                            <span className="line-through truncate">{task.title}</span>
                                        </div>
                                        <button
                                            onClick={() => onDelete(task.id)}
                                            className="text-white/30 hover:text-rose-400 text-xs px-1 cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Summary Bar */}
            <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-white/50">
                <div className="flex items-center gap-2">
                    <span>
                        {todoTasks.length === 0 && tasks.length > 0
                            ? '🎉 All Done Today!'
                            : `${todoTasks.length} Pending`}
                    </span>
                    {doneTasks.length > 0 && (
                        <button
                            onClick={handleClearCompleted}
                            className="text-[9px] text-white/30 hover:text-rose-300 underline cursor-pointer"
                            title="Remove all completed tasks"
                        >
                            Clear Done
                        </button>
                    )}
                </div>
                <span className="text-blue-400 font-semibold">{completionRate}% Completed</span>
            </div>
        </div>
    )
}
