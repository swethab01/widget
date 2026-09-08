import { useState, useEffect } from 'react'
import type { Goal } from '../../types'

interface MacGoalsWidgetProps {
    className?: string
    onClose?: () => void
}

interface Habit {
    id: string
    title: string
    icon: string
    streak: number
    completedToday: boolean
    weekDays: boolean[] // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    category: string
}

const DEFAULT_HABITS: Habit[] = [
    {
        id: 'h-leetcode',
        title: 'Daily LeetCode Problem',
        icon: '⚡',
        streak: 7,
        completedToday: false,
        weekDays: [true, true, true, true, true, false, false],
        category: 'LeetCode',
    },
    {
        id: 'h-github',
        title: 'Git Commit to Main / Branch',
        icon: '🐙',
        streak: 14,
        completedToday: true,
        weekDays: [true, true, true, true, true, true, true],
        category: 'Coding',
    },
    {
        id: 'h-focus',
        title: 'Deep Focus Sprint (45m+)',
        icon: '🎯',
        streak: 5,
        completedToday: false,
        weekDays: [true, true, true, true, false, false, false],
        category: 'Productivity',
    },
    {
        id: 'h-docs',
        title: 'Read Documentation / Articles',
        icon: '📚',
        streak: 3,
        completedToday: false,
        weekDays: [false, true, true, true, false, false, false],
        category: 'Study',
    },
    {
        id: 'h-health',
        title: 'Hydrate & Posture Break',
        icon: '💧',
        streak: 9,
        completedToday: true,
        weekDays: [true, true, true, true, true, true, false],
        category: 'Health',
    },
]

const HABIT_EMOJIS = ['⚡', '🐙', '🎯', '📚', '💧', '💻', '🧠', '🏃', '✅', '🔥']
const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function MacGoalsWidget({ className = '', onClose }: MacGoalsWidgetProps) {
    const [viewMode, setViewMode] = useState<'habits' | 'metrics'>('habits')
    const [habits, setHabits] = useState<Habit[]>(() => {
        const saved = localStorage.getItem('devpulse_habits_data')
        if (saved) {
            try {
                return JSON.parse(saved)
            } catch {}
        }
        return DEFAULT_HABITS
    })

    const [goals, setGoals] = useState<Goal[]>([])
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editTarget, setEditTarget] = useState('')

    // Add Habit state
    const [showAddModal, setShowAddModal] = useState(false)
    const [newHabitTitle, setNewHabitTitle] = useState('')
    const [newHabitIcon, setNewHabitIcon] = useState('⚡')

    // Today's day of week (0 = Mon, 6 = Sun)
    const todayIndex = (new Date().getDay() + 6) % 7

    useEffect(() => {
        if (window.electronAPI?.goals?.getAll) {
            window.electronAPI.goals.getAll().then(setGoals)
        }
    }, [])

    // Sync with LeetCode solved status for today
    useEffect(() => {
        const todayStr = new Date().toISOString().slice(0, 10)
        const lcSolved = localStorage.getItem(`devpulse_leetcode_solved_${todayStr}`) === 'true'
        if (lcSolved) {
            setHabits((prev) =>
                prev.map((h) => {
                    if (h.id === 'h-leetcode' && !h.completedToday) {
                        const newWeek = [...h.weekDays]
                        newWeek[todayIndex] = true
                        return { ...h, completedToday: true, streak: h.streak + 1, weekDays: newWeek }
                    }
                    return h
                })
            )
        }
    }, [todayIndex])

    // Save habits to localStorage
    const saveHabits = (updated: Habit[]) => {
        setHabits(updated)
        localStorage.setItem('devpulse_habits_data', JSON.stringify(updated))
    }

    const toggleHabitToday = (id: string) => {
        const updated = habits.map((h) => {
            if (h.id === id) {
                const nextDone = !h.completedToday
                const newWeek = [...h.weekDays]
                newWeek[todayIndex] = nextDone
                return {
                    ...h,
                    completedToday: nextDone,
                    streak: nextDone ? h.streak + 1 : Math.max(0, h.streak - 1),
                    weekDays: newWeek,
                }
            }
            return h
        })
        saveHabits(updated)
    }

    const handleAddHabit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newHabitTitle.trim()) return

        const newH: Habit = {
            id: `h-${Date.now()}`,
            title: newHabitTitle.trim(),
            icon: newHabitIcon,
            streak: 1,
            completedToday: true,
            weekDays: [false, false, false, false, false, false, false].map((_, i) => i === todayIndex),
            category: 'Custom',
        }

        saveHabits([newH, ...habits])
        setNewHabitTitle('')
        setShowAddModal(false)
    }

    const handleDeleteHabit = (id: string) => {
        saveHabits(habits.filter((h) => h.id !== id))
    }

    const handleSaveTarget = async (goal: Goal) => {
        const target = parseInt(editTarget)
        if (!isNaN(target) && target > 0) {
            await window.electronAPI.goals.set(goal.type, target)
            setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, target } : g)))
        }
        setEditingId(null)
    }

    const handleQuickIncrement = async (goal: Goal, delta: number) => {
        const nextCurrent = Math.max(0, goal.current + delta)
        setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, current: nextCurrent } : g)))
        await window.electronAPI.goals.set(goal.type, goal.target)
    }

    const completedHabitsCount = habits.filter((h) => h.completedToday).length
    const habitCompletionPct = habits.length > 0 ? Math.round((completedHabitsCount / habits.length) * 100) : 0

    return (
        <div
            className={`mac-widget-tile p-4 h-full flex flex-col justify-between select-none relative group transition-all duration-200 overflow-hidden ${className}`}
        >
            {/* Close button if provided */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shadow-md cursor-pointer z-30 transition-transform hover:scale-110 active:scale-95"
                    title="Close Habits Widget"
                >
                    ✕
                </button>
            )}

            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[11px] text-amber-400 font-bold shadow-sm">
                            🎯
                        </div>
                        <span className="text-[11px] font-bold tracking-wider uppercase text-white/90 font-mono">
                            HABITS & GOALS
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.08] text-white/70">
                            {completedHabitsCount}/{habits.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 pr-6">
                        {/* Tab Switcher: Habits vs Metric Goals */}
                        <div className="flex items-center bg-white/[0.06] p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
                            <button
                                onClick={() => setViewMode('habits')}
                                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                                    viewMode === 'habits'
                                        ? 'bg-amber-500/30 text-amber-300 font-bold'
                                        : 'text-white/40 hover:text-white'
                                }`}
                            >
                                Habits
                            </button>
                            <button
                                onClick={() => setViewMode('metrics')}
                                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                                    viewMode === 'metrics'
                                        ? 'bg-amber-500/30 text-amber-300 font-bold'
                                        : 'text-white/40 hover:text-white'
                                }`}
                            >
                                Metrics
                            </button>
                        </div>

                        {/* Add Habit button */}
                        <button
                            onClick={() => setShowAddModal(!showAddModal)}
                            className="text-xs p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                            title="Add Custom Habit"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden mb-3">
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(habitCompletionPct, 4)}%` }}
                    />
                </div>

                {/* Inline Add Habit Modal */}
                {showAddModal && (
                    <form
                        onSubmit={handleAddHabit}
                        className="mb-3 p-3 rounded-xl bg-black/80 border border-amber-500/30 animate-fade-in text-xs"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-white">Add New Daily Habit</span>
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="text-white/40 hover:text-white text-xs cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex items-center gap-1.5 mb-2 overflow-x-auto scrollbar-hide py-1">
                            {HABIT_EMOJIS.map((em) => (
                                <button
                                    key={em}
                                    type="button"
                                    onClick={() => setNewHabitIcon(em)}
                                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-transform cursor-pointer ${
                                        newHabitIcon === em
                                            ? 'bg-amber-500/30 border border-amber-400 scale-110'
                                            : 'bg-white/[0.05] hover:bg-white/10'
                                    }`}
                                >
                                    {em}
                                </button>
                            ))}
                        </div>

                        <input
                            type="text"
                            autoFocus
                            placeholder="e.g. Read 10 pages, Drink 2L water..."
                            value={newHabitTitle}
                            onChange={(e) => setNewHabitTitle(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs placeholder-white/30 outline-none focus:border-amber-400 mb-2"
                        />

                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="px-2.5 py-1 text-white/50 hover:text-white text-xs cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg cursor-pointer"
                            >
                                Create Habit
                            </button>
                        </div>
                    </form>
                )}

                {/* View Mode: Daily Habits */}
                {viewMode === 'habits' && (
                    <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide pr-0.5">
                        {habits.map((h) => {
                            return (
                                <div
                                    key={h.id}
                                    className={`group p-2.5 rounded-xl border transition-all ${
                                        h.completedToday
                                            ? 'bg-emerald-500/[0.06] border-emerald-500/25'
                                            : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.05] hover:border-white/15'
                                    }`}
                                >
                                    {/* Habit Row */}
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div
                                            onClick={() => toggleHabitToday(h.id)}
                                            className="flex items-center gap-2 flex-1 cursor-pointer truncate mr-2"
                                        >
                                            {/* Check Circle Button */}
                                            <div
                                                className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                                                    h.completedToday
                                                        ? 'bg-emerald-500 border-emerald-400 text-black'
                                                        : 'border-white/30 group-hover:border-emerald-400 bg-white/[0.04]'
                                                }`}
                                            >
                                                {h.completedToday ? '✓' : h.icon}
                                            </div>

                                            <span
                                                className={`text-xs font-medium truncate ${
                                                    h.completedToday
                                                        ? 'text-emerald-300 font-semibold'
                                                        : 'text-white/90 group-hover:text-white'
                                                }`}
                                            >
                                                {h.title}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            {/* Streak Flame */}
                                            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 font-bold flex items-center gap-0.5">
                                                <span>🔥</span>
                                                <span>{h.streak}d</span>
                                            </span>

                                            {/* Delete */}
                                            <button
                                                onClick={() => handleDeleteHabit(h.id)}
                                                className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-rose-400 text-xs px-1 transition-colors cursor-pointer"
                                                title="Delete habit"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>

                                    {/* 7-Day Mini Heatmap Row */}
                                    <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[9px] font-mono">
                                        <span className="text-white/40">Past 7 Days:</span>
                                        <div className="flex items-center gap-1">
                                            {h.weekDays.map((isDone, idx) => {
                                                const isToday = idx === todayIndex
                                                return (
                                                    <div
                                                        key={idx}
                                                        onClick={() => {
                                                            if (isToday) toggleHabitToday(h.id)
                                                        }}
                                                        className={`w-4 h-4 rounded flex items-center justify-center text-[8px] transition-all ${
                                                            isToday
                                                                ? isDone
                                                                    ? 'bg-emerald-500 text-black font-bold ring-1 ring-emerald-300 cursor-pointer'
                                                                    : 'bg-white/10 text-white border border-amber-400/80 cursor-pointer animate-pulse'
                                                                : isDone
                                                                ? 'bg-emerald-500/30 text-emerald-300'
                                                                : 'bg-white/[0.04] text-white/30'
                                                        }`}
                                                        title={`${DAYS_OF_WEEK[idx]}: ${isDone ? 'Completed' : 'Pending'}${
                                                            isToday ? ' (Today)' : ''
                                                        }`}
                                                    >
                                                        {DAYS_OF_WEEK[idx]}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* View Mode: Metrics & Goals */}
                {viewMode === 'metrics' && (
                    <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide pr-0.5">
                        {goals.map((goal) => {
                            const isDone = goal.target > 0 && goal.current >= goal.target
                            const pct = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0
                            const isEditing = editingId === goal.id

                            return (
                                <div
                                    key={goal.id}
                                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-all"
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-white/90">
                                                {goal.label}
                                            </span>
                                            {isDone && (
                                                <span className="text-[9px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                                                    ✓ Met
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleQuickIncrement(goal, -1)}
                                                className="w-4 h-4 rounded-md bg-white/[0.08] hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                                                title="Decrease 1"
                                            >
                                                -
                                            </button>
                                            <button
                                                onClick={() => handleQuickIncrement(goal, 1)}
                                                className="px-2 h-4 rounded-md bg-white/15 hover:bg-white/25 text-white flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer"
                                                title="Increment +1"
                                            >
                                                +1
                                            </button>

                                            {isEditing ? (
                                                <div className="flex items-center gap-1 ml-1">
                                                    <input
                                                        autoFocus
                                                        type="number"
                                                        value={editTarget}
                                                        onChange={(e) => setEditTarget(e.target.value)}
                                                        className="w-10 bg-black/50 border border-blue-500 text-white text-[10px] rounded px-1 py-0.5 outline-none font-mono"
                                                    />
                                                    <button
                                                        onClick={() => handleSaveTarget(goal)}
                                                        className="text-[10px] text-emerald-400 font-bold"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="text-[10px] text-white/40"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingId(goal.id)
                                                        setEditTarget(String(goal.target))
                                                    }}
                                                    className="text-[10px] text-white/60 hover:text-white font-mono ml-1 cursor-pointer"
                                                    title="Click to edit target"
                                                >
                                                    {goal.current}/{goal.target} {goal.unit}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                                        <div
                                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Footer Summary Bar */}
            <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-white/50">
                <span>
                    {completedHabitsCount === habits.length && habits.length > 0
                        ? '🔥 All Habits Completed Today!'
                        : `${completedHabitsCount} of ${habits.length} Habits Done`}
                </span>
                <span className="text-amber-400 font-semibold">{habitCompletionPct}% Day Score</span>
            </div>
        </div>
    )
}
