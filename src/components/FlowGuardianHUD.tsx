import { useState, useEffect, useCallback } from 'react'
import type { PulseInsight } from '../types'

interface FlowGuardianHUDProps {
    onStartFocus?: (taskId: number | null, minutes: number) => void
    onAddTask?: () => void
    refreshTrigger?: unknown
}

const MODE_CONFIG = {
    flow: {
        badge: 'Flow State Active',
        icon: '🌊',
        glow: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300 shadow-[0_4px_24px_rgba(6,182,212,0.15)]',
        accentBtn: 'bg-cyan-500 hover:bg-cyan-400 text-black font-semibold',
        dot: 'bg-cyan-400',
    },
    drift: {
        badge: 'Attention Drift Detected',
        icon: '⚠️',
        glow: 'border-amber-500/40 bg-amber-950/25 text-amber-200 shadow-[0_4px_24px_rgba(245,158,11,0.2)]',
        accentBtn: 'bg-amber-500 hover:bg-amber-400 text-black font-semibold',
        dot: 'bg-amber-400',
    },
    deep: {
        badge: 'Deep Work Momentum',
        icon: '⚡',
        glow: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300 shadow-[0_4px_24px_rgba(16,185,129,0.15)]',
        accentBtn: 'bg-emerald-500 hover:bg-emerald-400 text-black font-semibold',
        dot: 'bg-emerald-400',
    },
    recovery: {
        badge: 'Recovery Mode',
        icon: '🌙',
        glow: 'border-purple-500/30 bg-purple-950/20 text-purple-300 shadow-[0_4px_24px_rgba(168,85,247,0.15)]',
        accentBtn: 'bg-purple-500 hover:bg-purple-400 text-white font-semibold',
        dot: 'bg-purple-400',
    },
    idle: {
        badge: 'Pulse Ready',
        icon: '✦',
        glow: 'border-white/[0.08] bg-white/[0.03] text-white/70',
        accentBtn: 'bg-white/15 hover:bg-white/25 text-white font-medium',
        dot: 'bg-blue-400',
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
        <div className={`relative p-3 rounded-[22px] border backdrop-blur-3xl transition-all duration-300 ${cfg.glow}`}>
            {/* Top glass reflection */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            {/* Header row */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full mac-pulse-dot ${cfg.dot}`} />
                    <span className="text-[10px] font-semibold tracking-wider uppercase font-mono flex items-center gap-1.5 text-white/90">
                        <span>{cfg.icon}</span>
                        <span>{cfg.badge}</span>
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {insight.streakDays > 0 && (
                        <span className="text-[10px] font-mono font-medium text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/25">
                            🔥 {insight.streakDays}d streak
                        </span>
                    )}
                    <span className="text-[10px] text-white/40 font-mono">
                        {Math.round(insight.focusCompletionRate * 100)}% focus lock
                    </span>
                </div>
            </div>

            {/* Headline & reason */}
            <div className="mb-2.5">
                <h4 className="text-xs font-semibold text-white leading-snug mb-0.5 tracking-tight">
                    {insight.headline}
                </h4>
                <p className="text-[11px] text-white/60 leading-relaxed line-clamp-2">
                    {insight.reason}
                </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.06]">
                {insight.nextTaskTitle && (
                    <div className="flex-1 text-[10px] text-white/50 truncate">
                        Aim: <span className="text-white/80 font-medium">{insight.nextTaskTitle}</span>
                    </div>
                )}

                <button
                    onClick={handleAction}
                    className={`ml-auto px-3 py-1.5 rounded-xl text-xs shadow-sm transition-all duration-150 active:scale-[0.97] flex items-center gap-1.5 cursor-pointer ${cfg.accentBtn}`}
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
