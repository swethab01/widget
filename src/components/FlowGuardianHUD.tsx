import { useState, useEffect, useCallback } from 'react'
import type { PulseInsight } from '../types'

interface FlowGuardianHUDProps {
    onStartFocus?: (taskId: number | null, minutes: number) => void
    onAddTask?: () => void
    refreshTrigger?: unknown
}

const MODE_CONFIG = {
    flow: {
        badge: 'FLOW STATE',
        icon: '🌊',
        glow: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
        accentBtn: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white',
        dot: 'bg-cyan-400 animate-ping',
    },
    drift: {
        badge: 'ATTENTION DRIFT',
        icon: '⚠️',
        glow: 'border-amber-500/50 bg-amber-950/25 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.2)]',
        accentBtn: 'bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white',
        dot: 'bg-amber-400 animate-pulse',
    },
    deep: {
        badge: 'DEEP WORK',
        icon: '⚡',
        glow: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
        accentBtn: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white',
        dot: 'bg-emerald-400',
    },
    recovery: {
        badge: 'RECOVERY',
        icon: '🌙',
        glow: 'border-purple-500/40 bg-purple-950/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
        accentBtn: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white',
        dot: 'bg-purple-400',
    },
    idle: {
        badge: 'PULSE READY',
        icon: '🎯',
        glow: 'border-surface-border bg-surface-card text-text-secondary',
        accentBtn: 'bg-accent hover:bg-blue-500 text-white',
        dot: 'bg-accent',
    },
}

export function FlowGuardianHUD({ onStartFocus, onAddTask, refreshTrigger }: FlowGuardianHUDProps) {
    const [insight, setInsight] = useState<PulseInsight | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchInsight = useCallback(async () => {
        try {
            if (window.electronAPI?.pulse) {
                const res = await window.electronAPI.pulse.getInsight()
                setInsight(res)
            }
        } catch {
            // fallback
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchInsight()
        const interval = setInterval(fetchInsight, 30000)
        return () => clearInterval(interval)
    }, [fetchInsight, refreshTrigger])

    if (loading || !insight) {
        return null
    }

    const cfg = MODE_CONFIG[insight.mode] || MODE_CONFIG.idle

    const handleAction = () => {
        if (insight.action === 'add-task') {
            onAddTask?.()
        } else if (onStartFocus) {
            onStartFocus(insight.nextTaskId, insight.suggestedMinutes)
        }
    }

    return (
        <div className={`p-3 rounded-2xl border transition-all duration-300 backdrop-blur-md ${cfg.glow}`}>
            {/* Header row */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dot}`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
                    </span>
                    <span className="text-[10px] font-bold tracking-wider uppercase font-mono flex items-center gap-1">
                        <span>{cfg.icon}</span>
                        <span>{cfg.badge}</span>
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {insight.streakDays > 0 && (
                        <span className="text-[10px] font-mono font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                            🔥 {insight.streakDays}d streak
                        </span>
                    )}
                    <span className="text-[10px] text-text-muted font-mono">
                        {Math.round(insight.focusCompletionRate * 100)}% lock-in
                    </span>
                </div>
            </div>

            {/* Headline & reason */}
            <div className="mb-2.5">
                <h4 className="text-xs font-semibold text-text-primary leading-tight mb-0.5">
                    {insight.headline}
                </h4>
                <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">
                    {insight.reason}
                </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                {insight.nextTaskTitle && (
                    <div className="flex-1 text-[10px] text-text-muted truncate">
                        Target: <span className="text-text-secondary font-medium">{insight.nextTaskTitle}</span>
                    </div>
                )}

                <button
                    onClick={handleAction}
                    className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-1.5 ${cfg.accentBtn}`}
                >
                    {insight.action === 'add-task' ? (
                        <>+ Add Target Task</>
                    ) : insight.action === 'take-break' ? (
                        <>☕ Take Rest</>
                    ) : (
                        <>▶ {insight.mode === 'drift' ? 'Snap Back to Focus' : 'Start Focus'} ({insight.suggestedMinutes}m)</>
                    )}
                </button>
            </div>
        </div>
    )
}
