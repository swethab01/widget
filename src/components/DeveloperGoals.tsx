import { useState, useEffect } from 'react'
import { Card } from './ui/Card'
import type { Goal } from '../types'

export function DeveloperGoals() {
    const [goals, setGoals] = useState<Goal[]>([])
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editTarget, setEditTarget] = useState('')

    useEffect(() => {
        window.electronAPI?.goals?.getAll?.().then((data) => {
            if (Array.isArray(data)) setGoals(data)
        })
    }, [])

    const handleSaveTarget = async (goal: Goal) => {
        const target = parseInt(editTarget)
        if (!isNaN(target) && target > 0) {
            await window.electronAPI?.goals?.set?.(goal.type, target)
            setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, target } : g)))
        }
        setEditingId(null)
    }

    const handleQuickIncrement = async (goal: Goal, delta: number) => {
        const nextCurrent = Math.max(0, goal.current + delta)
        // Direct local state update
        setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, current: nextCurrent } : g)))
    }

    const GOAL_ICONS: Record<string, string> = {
        leetcode: '🧩',
        github: '🐙',
        focus: '🎯',
        tasks: '✅',
        reading: '📚',
    }

    const GOAL_ACCENTS: Record<string, { bar: string; glow: string }> = {
        leetcode: { bar: 'bg-[#ff9f0a]', glow: 'text-[#ff9f0a]' },
        github: { bar: 'bg-[#bf5af2]', glow: 'text-[#bf5af2]' },
        focus: { bar: 'bg-[#0a84ff]', glow: 'text-[#0a84ff]' },
        tasks: { bar: 'bg-[#30d158]', glow: 'text-[#30d158]' },
        reading: { bar: 'bg-[#64d2ff]', glow: 'text-[#64d2ff]' },
    }

    return (
        <Card className="relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/90 tracking-tight uppercase">
                        Weekly Goals
                    </span>
                </div>
                <span className="text-[10px] text-white/40 font-mono">Habits</span>
            </div>

            <div className="space-y-2.5">
                {goals.map((goal) => {
                    const isDone = goal.target > 0 && goal.current >= goal.target
                    const pct = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0
                    const isEditing = editingId === goal.id
                    const colors = GOAL_ACCENTS[goal.type] || { bar: 'bg-blue-500', glow: 'text-blue-400' }

                    return (
                        <div key={goal.id} className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs">{GOAL_ICONS[goal.type] || '🎯'}</span>
                                    <span className="text-xs font-medium text-white/90">{goal.label}</span>
                                    {isDone && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                                            ✓ Met
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                    {/* Increment controls */}
                                    <button
                                        onClick={() => handleQuickIncrement(goal, -1)}
                                        className="w-4 h-4 rounded-md bg-white/[0.06] hover:bg-white/[0.14] text-white/60 hover:text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                                        title="Decrease 1"
                                    >
                                        -
                                    </button>
                                    <button
                                        onClick={() => handleQuickIncrement(goal, 1)}
                                        className="px-1.5 h-4 rounded-md bg-white/[0.08] hover:bg-white/[0.16] text-white/90 hover:text-white flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer"
                                        title="Increment +1"
                                    >
                                        +1
                                    </button>

                                    {/* Target editor */}
                                    {isEditing ? (
                                        <div className="flex items-center gap-1 ml-1">
                                            <input
                                                autoFocus
                                                type="number"
                                                value={editTarget}
                                                onChange={(e) => setEditTarget(e.target.value)}
                                                className="w-10 bg-white/10 border border-blue-500 text-white text-[10px] rounded px-1 py-0.5 outline-none font-mono"
                                            />
                                            <button onClick={() => handleSaveTarget(goal)} className="text-[10px] text-emerald-400 font-bold">✓</button>
                                            <button onClick={() => setEditingId(null)} className="text-[10px] text-white/40">✕</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditingId(goal.id)
                                                setEditTarget(String(goal.target))
                                            }}
                                            className="text-[10px] text-white/50 hover:text-white font-mono ml-1 cursor-pointer"
                                            title="Click to edit target"
                                        >
                                            {goal.current}/{goal.target} {goal.unit}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Progress bar capsule */}
                            <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                <div
                                    className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}
