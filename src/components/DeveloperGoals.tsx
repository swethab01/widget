import { useState, useEffect } from 'react'
import { Card } from './ui/Card'
import { ProgressBar } from './ui/ProgressBar'
import type { Goal } from '../types'

export function DeveloperGoals() {
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
            setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, target } : g))
        }
        setEditingId(null)
    }

    const GOAL_ICONS: Record<string, string> = {
        leetcode: '🧩',
        github: '🐙',
        focus: '🎯',
        tasks: '✅',
        reading: '📚',
    }

    const GOAL_COLORS: Record<string, string> = {
        leetcode: 'bg-yellow-500',
        github: 'bg-accent-purple',
        focus: 'bg-accent',
        tasks: 'bg-accent-green',
        reading: 'bg-cyan-500',
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm">🚀</span>
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Weekly Goals</span>
                </div>
                <span className="text-[10px] text-text-muted">This week</span>
            </div>

            <div className="space-y-3">
                {goals.map((goal) => {
                    const pct = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0
                    const isEditing = editingId === goal.id

                    return (
                        <div key={goal.id}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs">{GOAL_ICONS[goal.type] || '🎯'}</span>
                                    <span className="text-xs text-text-secondary">{goal.label}</span>
                                </div>
                                {isEditing ? (
                                    <div className="flex items-center gap-1">
                                        <input
                                            autoFocus
                                            type="number"
                                            value={editTarget}
                                            onChange={(e) => setEditTarget(e.target.value)}
                                            className="w-12 bg-surface-hover border border-accent text-text-primary text-xs rounded px-1 py-0.5 outline-none font-mono"
                                        />
                                        <button onClick={() => handleSaveTarget(goal)} className="text-[10px] text-accent-green">✓</button>
                                        <button onClick={() => setEditingId(null)} className="text-[10px] text-text-muted">✕</button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { setEditingId(goal.id); setEditTarget(String(goal.target)) }}
                                        className="text-[10px] text-text-muted hover:text-text-secondary font-mono"
                                    >
                                        {goal.current} / {goal.target} {goal.unit}
                                    </button>
                                )}
                            </div>
                            <ProgressBar
                                value={goal.current}
                                max={goal.target}
                                color={GOAL_COLORS[goal.type] || 'bg-accent'}
                                height="h-1"
                            />
                        </div>
                    )
                })}
            </div>

            <div className="mt-2 text-[10px] text-text-muted text-center">
                Tap numbers to edit targets
            </div>
        </Card>
    )
}
