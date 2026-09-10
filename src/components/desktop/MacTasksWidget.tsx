import { useState, useMemo } from 'react'
import type { Task, NewTask, Priority } from '../../types'

interface MacTasksWidgetProps {
    tasks: Task[]
    doneTasks: Task[]
    completionRate: number
    onAdd: (task: NewTask) => Promise<Task>
    onToggle: (id: number) => Promise<void | Task | undefined>
    onDelete: (id: number) => Promise<void>
    onTickAll?: () => Promise<void>
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
    onTickAll,
    onFocusTask,
    onClose,
    className = '',
}: MacTasksWidgetProps) {
    const [filter, setFilter] = useState<'All' | 'To Do' | 'Done' | 'Urgent' | string>('All')
    const [newTitle, setNewTitle] = useState('')
    const [newPriority, setNewPriority] = useState<Priority>('medium')
    const [newCategory, setNewCategory] = useState('Coding')
    const [newEst, setNewEst] = useState(25)
    const [showOptions, setShowOptions] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isTickingAll, setIsTickingAll] = useState(false)

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
        let list: Task[] = []
        if (filter === 'Done' || filter === 'Completed') {
            list = doneTasks
        } else if (filter === 'To Do' || filter === 'Todo') {
            list = todoTasks
        } else if (filter === 'Urgent') {
            list = tasks.filter((t) => t.priority === 'high')
        } else if (filter === 'All') {
            list = tasks
        } else {
            list = tasks.filter((t) => t.category.toLowerCase() === filter.toLowerCase())
        }

        // Sort: pending tasks first (ordered high -> medium -> low priority, then newest), then completed tasks
        return [...list].sort((a, b) => {
            if (a.status !== b.status) return a.status === 'todo' ? -1 : 1
            const pRank = (p: string) => (p === 'high' ? 1 : p === 'medium' ? 2 : 3)
            return pRank(a.priority) - pRank(b.priority)
        })
    }, [filter, tasks, todoTasks, doneTasks])

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
            setNewPriority('medium')
            setNewCategory('Coding')
            setNewEst(25)
            setShowOptions(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleTickAll = async () => {
        if (isTickingAll) return
        setIsTickingAll(true)
        try {
            if (onTickAll) {
                await onTickAll()
            } else {
                for (const t of todoTasks) {
                    await onToggle(t.id)
                }
            }
        } finally {
            setIsTickingAll(false)
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
            className={`mac-widget-tile p-3.5 w-[320px] max-w-[320px] select-none relative group transition-all duration-200 flex flex-col gap-2 rounded-[22px] overflow-hidden bg-gradient-to-b from-[#141724]/95 via-[#0e1017]/95 to-[#0a0b10]/95 border border-white/[0.12] shadow-2xl ${className}`}
        >
            {/* Top Container */}
            <div className="flex flex-col gap-2">
                {/* Header */}
                <div className="flex items-center justify-between mb-1.5 shrink-0">
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

                    <div className="flex items-center gap-1.5">
                        {remainingMinutes > 0 && (
                            <span
                                className="text-[10px] font-mono text-blue-400/90 bg-blue-500/10 px-1.5 py-0.5 rounded-full border border-blue-500/20"
                                title="Total estimated time remaining"
                            >
                                ⏱ {formatRemaining(remainingMinutes)}
                            </span>
                        )}
                        <span className="text-[10px] font-bold text-emerald-400 font-mono px-1.5 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                            {completionRate}%
                        </span>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="w-5 h-5 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95 ml-1"
                                title="Close Tasks Widget"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden mb-2.5 shrink-0">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(completionRate, tasks.length === 0 ? 0 : 4)}%` }}
                    />
                </div>

                {/* Quick Add Bar with Tick All button */}
                <div className="mb-2 shrink-0 space-y-1.5">
                    <form onSubmit={handleQuickAdd} className="relative flex items-center gap-1.5">
                        <div className="relative flex-1 flex items-center">
                            <input
                                type="text"
                                placeholder="Add a task... (Press Enter)"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                onFocus={() => setShowOptions(true)}
                                className="w-full pl-3 pr-16 py-1.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-white/40 outline-none focus:border-blue-400/80 transition-all font-sans shadow-inner"
                            />
                            <div className="absolute right-1 flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setShowOptions(!showOptions)}
                                    className={`text-[10px] px-1 py-0.5 rounded-md transition-colors cursor-pointer ${
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
                                    className="px-2 py-0.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-bold text-[10px] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                >
                                    + Add
                                </button>
                            </div>
                        </div>

                        {/* Quick Action: Tick All Done */}
                        {todoTasks.length > 0 && (
                            <button
                                type="button"
                                onClick={handleTickAll}
                                disabled={isTickingAll}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap active:scale-95 shadow-sm"
                                title="Tick all pending tasks as completed"
                            >
                                <span>✓</span>
                                <span>Tick All</span>
                            </button>
                        )}
                    </form>

                    {/* Expandable Options Drawer */}
                    {showOptions && (
                        <div className="p-2 rounded-xl bg-black/70 border border-white/10 animate-fade-in space-y-2">
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
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-1.5 scrollbar-hide text-[10px] shrink-0">
                    <button
                        onClick={() => setFilter('All')}
                        className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                            filter === 'All'
                                ? 'bg-white/20 text-white font-semibold shadow-sm'
                                : 'text-white/40 hover:text-white/80 hover:bg-white/[0.06]'
                        }`}
                    >
                        All ({tasks.length})
                    </button>

                    <button
                        onClick={() => setFilter('To Do')}
                        className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                            filter === 'To Do'
                                ? 'bg-blue-500/30 text-blue-300 font-semibold border border-blue-500/40'
                                : 'text-white/40 hover:text-white/80 hover:bg-white/[0.06]'
                        }`}
                    >
                        To Do ({todoTasks.length})
                    </button>

                    <button
                        onClick={() => setFilter('Done')}
                        className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                            filter === 'Done'
                                ? 'bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/40'
                                : 'text-emerald-400/60 hover:text-emerald-300 hover:bg-emerald-500/10'
                        }`}
                    >
                        ✓ Done ({doneTasks.length})
                    </button>

                    {urgentCount > 0 && (
                        <button
                            onClick={() => setFilter('Urgent')}
                            className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
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
                </div>

                {/* Tasks List - with instant tick & comfortable clickable row */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 space-y-1.5 pr-0.5 min-h-0">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-6 text-xs text-white/40 font-mono">
                            {tasks.length === 0 ? (
                                <div>
                                    <div className="text-base mb-1">🚀</div>
                                    <div>No tasks yet for today</div>
                                    <div className="text-[10px] text-white/30 mt-0.5">Type above and press Enter</div>
                                </div>
                            ) : filter === 'Done' ? (
                                <div>No completed tasks yet — tick one off!</div>
                            ) : filter === 'To Do' ? (
                                <div>
                                    <div className="text-emerald-400 text-sm mb-1">🎉</div>
                                    <div className="text-emerald-300 font-bold">All caught up!</div>
                                    <div className="text-[10px] text-white/30 mt-0.5">Every task has been completed</div>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-emerald-400 text-sm mb-1">✓</div>
                                    <div>All clear in this filter!</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        filteredTasks.map((task) => {
                            const isDone = task.status === 'done'
                            return (
                                <div
                                    key={task.id}
                                    onClick={() => onToggle(task.id)}
                                    className={`group flex items-center justify-between px-2.5 py-2 rounded-xl border transition-all cursor-pointer select-none ${
                                        isDone
                                            ? 'bg-emerald-500/[0.04] border-emerald-500/20 hover:bg-emerald-500/[0.08]'
                                            : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] hover:border-white/20 shadow-sm'
                                    }`}
                                >
                                    {/* Checkbox & Title */}
                                    <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onToggle(task.id)
                                            }}
                                            className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-150 shadow-sm ${
                                                isDone
                                                    ? 'bg-emerald-500 border-emerald-400 text-black font-extrabold text-xs scale-100 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                                    : 'border-white/30 bg-white/[0.03] hover:border-emerald-400 hover:bg-emerald-500/20 active:scale-90'
                                            }`}
                                            title={isDone ? 'Click to untick (mark todo)' : 'Click to tick (mark done)'}
                                        >
                                            {isDone ? '✓' : ''}
                                        </button>

                                        {/* Priority Indicator */}
                                        {!isDone && (
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                                    task.priority === 'high'
                                                        ? 'bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse'
                                                        : task.priority === 'medium'
                                                        ? 'bg-amber-400'
                                                        : 'bg-emerald-400'
                                                }`}
                                            />
                                        )}

                                        <span
                                            className={`text-xs truncate font-medium transition-all ${
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
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onFocusTask(task.id, task.est_minutes || 25)
                                                }}
                                                className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-300 hover:text-white px-2 py-0.5 rounded-md bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 transition-all cursor-pointer flex items-center gap-1"
                                                title="Start focus timer for this task"
                                            >
                                                <span>▶</span>
                                                <span>Focus</span>
                                            </button>
                                        )}

                                        {/* Delete Button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onDelete(task.id)
                                            }}
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
            </div>

            {/* Footer Summary Bar */}
            <div className="mt-2 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-white/50 shrink-0">
                <div className="flex items-center gap-2">
                    <span>
                        {todoTasks.length === 0 && tasks.length > 0
                            ? '🎉 All Done Today!'
                            : `${todoTasks.length} To Do`}
                    </span>
                    {doneTasks.length > 0 && (
                        <button
                            onClick={handleClearCompleted}
                            className="text-[9px] text-white/40 hover:text-rose-300 underline cursor-pointer transition-colors"
                            title="Remove all completed tasks"
                        >
                            Clear Done ({doneTasks.length})
                        </button>
                    )}
                </div>
                <span className="text-emerald-400 font-semibold">{completionRate}% Completed</span>
            </div>
        </div>
    )
}
