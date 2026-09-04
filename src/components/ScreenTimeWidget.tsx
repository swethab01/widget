import { Card } from './ui/Card'
import { formatSecondsShort } from '../utils/time'
import type { ScreenTimeSummary } from '../types'

const CATEGORY_COLORS: Record<string, { bar: string; text: string; dot: string }> = {
    Development: { bar: 'bg-[#30d158]', text: 'text-[#30d158]', dot: '#30d158' },
    Browser: { bar: 'bg-[#0a84ff]', text: 'text-[#0a84ff]', dot: '#0a84ff' },
    Entertainment: { bar: 'bg-[#ff453a]', text: 'text-[#ff453a]', dot: '#ff453a' },
    Communication: { bar: 'bg-[#ffd60a]', text: 'text-[#ffd60a]', dot: '#ffd60a' },
    Productivity: { bar: 'bg-[#bf5af2]', text: 'text-[#bf5af2]', dot: '#bf5af2' },
    Study: { bar: 'bg-[#64d2ff]', text: 'text-[#64d2ff]', dot: '#64d2ff' },
    Other: { bar: 'bg-[#8e8e93]', text: 'text-[#8e8e93]', dot: '#8e8e93' },
}

interface ScreenTimeWidgetProps {
    summary: ScreenTimeSummary
    loading: boolean
    className?: string
}

export function ScreenTimeWidget({ summary, loading, className = '' }: ScreenTimeWidgetProps) {
    if (loading) {
        return (
            <Card className="animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-2 w-24" />
                <div className="h-8 bg-white/10 rounded w-16" />
            </Card>
        )
    }

    const total = summary.totalSeconds || 1
    const codingPct = (summary.codingSeconds / total) * 100
    const entertainPct = (summary.entertainmentSeconds / total) * 100
    const commPct = (summary.communicationSeconds / total) * 100
    const otherPct = Math.max(0, 100 - codingPct - entertainPct - commPct)

    return (
        <Card className={`relative overflow-hidden ${className}`}>
            {/* macOS Screen Time Header */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white/90 tracking-tight uppercase">
                    Screen Time
                </span>
                <span className="text-[10px] text-white/40 font-mono">
                    {summary.totalSeconds > 0 ? 'Live Local' : 'Tracking…'}
                </span>
            </div>

            {/* Total time hero */}
            <div className="flex items-baseline justify-between mb-3">
                <div className="text-2xl font-bold font-mono text-white tracking-tight">
                    {formatSecondsShort(summary.totalSeconds)}
                </div>
                <div className="text-[11px] font-medium text-emerald-400 font-mono">
                    {Math.round(codingPct)}% Dev Focus
                </div>
            </div>

            {/* macOS Proportional Stacked Bar */}
            <div className="w-full h-3 rounded-full bg-white/[0.06] overflow-hidden flex mb-3 p-0.5 border border-white/[0.08]">
                {summary.totalSeconds > 0 ? (
                    <>
                        <div
                            className="h-full bg-[#30d158] first:rounded-l-full last:rounded-r-full transition-all duration-700"
                            style={{ width: `${codingPct}%` }}
                            title={`Coding: ${formatSecondsShort(summary.codingSeconds)}`}
                        />
                        <div
                            className="h-full bg-[#0a84ff] transition-all duration-700"
                            style={{ width: `${otherPct}%` }}
                            title="Browser / Productivity"
                        />
                        <div
                            className="h-full bg-[#ffd60a] transition-all duration-700"
                            style={{ width: `${commPct}%` }}
                            title={`Communication: ${formatSecondsShort(summary.communicationSeconds)}`}
                        />
                        <div
                            className="h-full bg-[#ff453a] first:rounded-l-full last:rounded-r-full transition-all duration-700"
                            style={{ width: `${entertainPct}%` }}
                            title={`Entertainment: ${formatSecondsShort(summary.entertainmentSeconds)}`}
                        />
                    </>
                ) : (
                    <div className="w-full h-full bg-white/10 rounded-full" />
                )}
            </div>

            {/* Top Apps List */}
            {summary.apps.length > 0 ? (
                <div className="space-y-1.5 pt-1 border-t border-white/[0.05]">
                    {summary.apps.slice(0, 4).map((app, i) => {
                        const name = app.appName || app.app_name || 'App'
                        const secs = app.durationSeconds || app.duration_seconds || 0
                        const cat = app.category || 'Other'
                        const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other

                        return (
                            <div key={i} className="flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-1.5 truncate flex-1 mr-2">
                                    <span
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: colors.dot }}
                                    />
                                    <span className="text-white/80 truncate font-medium">{name}</span>
                                </div>
                                <span className="text-white/40 font-mono text-[10px] whitespace-nowrap">
                                    {formatSecondsShort(secs)}
                                </span>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-[10px] text-white/40 text-center py-2 font-mono">
                    Foreground tracking active
                </div>
            )}
        </Card>
    )
}
