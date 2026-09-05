import { useState, useEffect } from 'react'
import type { Goal } from '../../types'

interface MacGoalsWidgetProps {
    className?: string
}

const GOAL_ICONS: Record<string, string> = {
    leetcode: '🧩',
    github: '🐙',
    focus: '🎯',
    tasks: '✅',
    reading: '📚',
}

const GOAL_ACCENTS: Record<string, { bar: string; glow: string; text: string }> = {
    leetcode: { bar: 'bg-[#ff9f0a]', glow: 'shadow-[#ff9f0a]/20', text: 'text-[#ff9f0a]' },
    github: { bar: 'bg-[#bf5af2]', glow: 'shadow-[#bf5af2]/20', text: 'text-[#bf5af2]' },
    focus: { bar: 'bg-[#0a84ff]', glow: 'shadow-[#0a84ff]/20', text: 'text-[#0a84ff]' },
    tasks: { bar: 'bg-[#30d158]', glow: 'shadow-[#30d158]/20', text: 'text-[#30d158]' },
    reading: { bar: 'bg-[#64d2ff]', glow: 'shadow-[#64d2ff]/20', text: 'text-[#64d2ff]' },
}

export function MacGoalsWidget({ className = '' }: MacGoalsWidgetProps) {
    const [goals, setGoals] = useState<Goal[]>([])
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editTarget, setEditTarget] = useState('')

    useEffect(() => {
        window.electronAPI.goals.getAll().then(setGoals)
    }, [])

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

    return (
        <div
            className={`mac-widget-tile p-4 flex flex-col justify-between select-none col-span-1 md:col-span-2 ${className}`}
        >
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 mac-pulse-dot" />
                        <span className="text-[11px] font-bold tracking-wider uppercase text-white/90 font-mono">
                            WEEKLY HABITS & GOALS
                        </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.08] text-white/60">
                        Sprint Track
                    </span>
                </div>

                {/* Goals List */}
                <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-hide pr-0.5">
                    {goals.map((goal) => {
                        const isDone = goal.target > 0 && goal.current >= goal.target
                        const pct = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0
                        const isEditing = editingId === goal.id
                        const colors = GOAL_ACCENTS[goal.type] || { bar: 'bg-blue-500', glow: 'shadow-blue-500/20', text: 'text-blue-400' }

                        return (
                            <div
                                key={goal.id}
                                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-all"
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{GOAL_ICONS[goal.type] || '🎯'}</span>
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
                                                title="Click to change target"
                                            >
                                                {goal.current}/{goal.target} {goal.unit}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                                    <div
                                        className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-white/50">
                <span>Streak Active</span>
                <span className="text-amber-400 font-semibold">Weekly Target</span>
            </div>
        </div>
    )
}
