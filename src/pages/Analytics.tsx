import { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { formatSecondsShort } from '../utils/time'
import type { DailyScore } from '../types'

export function Analytics() {
    const [history, setHistory] = useState<DailyScore[]>([])
    const [screenHistory, setScreenHistory] = useState<{ date: string; totalSeconds: number; codingSeconds: number }[]>([])

    useEffect(() => {
        // Fetch 35 days for heatmap, 7 days for bar charts
        window.electronAPI.score.getHistory(35).then((h) => setHistory(h || []))
        window.electronAPI.screenTime.getSummary().then((h) => setScreenHistory(h || []))
    }, [])

    const recent7 = history.slice(-7)

    const avgScore = history.length > 0
        ? Math.round(history.reduce((s, d) => s + d.score, 0) / history.length)
        : 0

    const totalCodingSeconds = screenHistory.reduce((s, d) => s + d.codingSeconds, 0)
    const totalScreenSeconds = screenHistory.reduce((s, d) => s + d.totalSeconds, 0)
    const overallDevRate = totalScreenSeconds > 0 ? Math.round((totalCodingSeconds / totalScreenSeconds) * 100) : 0

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const getDay = (dateStr: string) => {
        const d = new Date(dateStr)
        return days[d.getDay() === 0 ? 6 : d.getDay() - 1]
    }

    const maxScore = Math.max(...recent7.map((h) => h.score), 1)

    // Heatmap cell color helper
    const getHeatmapColor = (score: number) => {
        if (!score || score <= 0) return 'bg-white/[0.04] border-white/[0.06]'
        if (score < 40) return 'bg-emerald-950/70 border-emerald-800/40 text-emerald-300'
        if (score < 70) return 'bg-emerald-700/80 border-emerald-600/50 text-white'
        if (score < 85) return 'bg-emerald-500 border-emerald-400 text-white'
        return 'bg-emerald-400 border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.4)] text-black'
    }

    return (
        <div className="flex-1 h-full overflow-y-auto p-3 space-y-3 scrollbar-hide animate-fade-in max-w-2xl mx-auto">
            {/* macOS KPI Metric Tiles */}
            <div className="grid grid-cols-3 gap-2">
                <MacStatCard label="Average Score" value={`${avgScore}`} unit="/100" color="text-blue-400" />
                <MacStatCard label="Coding Time" value={formatSecondsShort(totalCodingSeconds)} color="text-emerald-400" />
                <MacStatCard label="Dev Ratio" value={`${overallDevRate}%`} color="text-purple-400" />
            </div>

            {/* 35-Day (5-Week) GitHub-style Contribution Heatmap */}
            <Card className="relative overflow-hidden">
                <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold text-white/90 tracking-tight uppercase">
                        35-Day Activity Heatmap
                    </span>
                    <div className="flex items-center gap-1.5 text-[9px] text-white/40 font-mono">
                        <span>Less</span>
                        <span className="w-2 h-2 rounded-xs bg-white/[0.04]" />
                        <span className="w-2 h-2 rounded-xs bg-emerald-900" />
                        <span className="w-2 h-2 rounded-xs bg-emerald-700" />
                        <span className="w-2 h-2 rounded-xs bg-emerald-500" />
                        <span className="w-2 h-2 rounded-xs bg-emerald-400" />
                        <span>More</span>
                    </div>
                </div>

                {/* Heatmap Grid (5 rows of 7 days) */}
                <div className="grid grid-cols-7 gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    {history.map((day, idx) => (
                        <div
                            key={idx}
                            className={`h-7 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 hover:z-10 ${getHeatmapColor(
                                day.score
                            )}`}
                            title={`${day.date}: Score ${day.score}`}
                        >
                            <span className="text-[8px] font-mono font-bold leading-none opacity-80">
                                {day.score > 0 ? day.score : ''}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="text-[9px] text-white/40 font-mono text-center mt-2">
                    Daily developer consistency and momentum index
                </div>
            </Card>

            {/* 7-Day Score Pillar Chart (Apple style) */}
            <Card className="relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-white/90 tracking-tight uppercase">
                        7-Day Performance
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">Scores</span>
                </div>

                {recent7.length > 0 ? (
                    <div className="flex items-end justify-between gap-2 h-24 px-2">
                        {recent7.map((d, i) => {
                            const pct = (d.score / maxScore) * 100
                            const color =
                                d.score >= 80 ? 'bg-emerald-400' : d.score >= 60 ? 'bg-blue-500' : 'bg-amber-400'
                            return (
                                <div key={i} className="flex flex-col items-center gap-1.5 flex-1 group cursor-pointer">
                                    <span className="text-[10px] text-white/60 font-mono font-bold group-hover:text-white transition-colors">
                                        {d.score || 0}
                                    </span>
                                    <div className="w-full flex items-end justify-center" style={{ height: '56px' }}>
                                        <div
                                            className={`w-full max-w-[28px] rounded-t-lg ${color} transition-all duration-500 group-hover:brightness-125 shadow-sm`}
                                            style={{ height: `${Math.max(pct, 6)}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-white/40 font-medium">{getDay(d.date)}</span>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-xs text-white/40 text-center py-6 font-mono">
                        Data will record after your first active day
                    </div>
                )}
            </Card>

            {/* Score Components breakdown */}
            <Card className="relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-white/90 tracking-tight uppercase">
                        Score Breakdown (Past 7 Days)
                    </span>
                </div>

                {recent7.length > 0 ? (
                    <div className="space-y-2.5">
                        {[
                            { label: 'Task Completion', key: 'tasks_pts' as keyof DailyScore, max: 25, color: 'bg-blue-500' },
                            { label: 'Focus Blocks', key: 'focus_pts' as keyof DailyScore, max: 20, color: 'bg-purple-500' },
                            { label: 'Coding Sessions', key: 'coding_pts' as keyof DailyScore, max: 20, color: 'bg-emerald-500' },
                            { label: 'Low Distraction Control', key: 'distraction_pts' as keyof DailyScore, max: 15, color: 'bg-amber-500' },
                        ].map((c) => {
                            const avgPts = Math.round(
                                recent7.reduce((s, d) => s + ((d[c.key] as number) || 0), 0) / Math.max(recent7.length, 1)
                            )
                            return (
                                <div key={c.key} className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-white/80">{c.label}</span>
                                        <span className="text-[10px] text-white/50 font-mono">avg {avgPts}/{c.max} pts</span>
                                    </div>
                                    <ProgressBar value={avgPts} max={c.max} color={c.color} height="h-1.5" />
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-xs text-white/40 text-center py-4 font-mono">
                        Complete focus sessions and tasks to populate breakdown
                    </div>
                )}
            </Card>
        </div>
    )
}

function MacStatCard({ label, value, unit, color }: { label: string; value: string; unit?: string; color: string }) {
    return (
        <Card className="!p-2.5">
            <div className="text-[10px] text-white/50 font-medium uppercase tracking-tight mb-1 truncate">{label}</div>
            <div className={`text-xl font-mono font-bold ${color} tracking-tight`}>
                {value}
                {unit && <span className="text-xs text-white/40 font-normal font-sans ml-0.5">{unit}</span>}
            </div>
        </Card>
    )
}
