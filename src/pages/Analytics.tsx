import { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { formatSecondsShort } from '../utils/time'
import type { DailyScore } from '../types'

export function Analytics() {
    const [history, setHistory] = useState<DailyScore[]>([])
    const [screenHistory, setScreenHistory] = useState<{ date: string; totalSeconds: number; codingSeconds: number }[]>([])

    useEffect(() => {
        window.electronAPI.score.getHistory(7).then((h) => setHistory(h || []))
        window.electronAPI.screenTime.getSummary().then((h) => setScreenHistory(h || []))
    }, [])

    const avgScore = history.length > 0
        ? Math.round(history.reduce((s, d) => s + d.score, 0) / history.length)
        : 0

    const totalCodingSeconds = screenHistory.reduce((s, d) => s + d.codingSeconds, 0)

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const getDay = (dateStr: string) => {
        const d = new Date(dateStr)
        return days[d.getDay() === 0 ? 6 : d.getDay() - 1]
    }

    const maxScore = Math.max(...history.map((h) => h.score), 1)

    return (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide animate-fade-in">
            {/* Weekly summary */}
            <div className="grid grid-cols-2 gap-2">
                <Stat label="Avg Score" value={`${avgScore}/100`} color="text-accent" />
                <Stat label="Coding Time" value={formatSecondsShort(totalCodingSeconds)} color="text-accent-green" />
            </div>

            {/* Score history chart */}
            <Card>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm">📊</span>
                        <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">7-Day Score</span>
                    </div>
                </div>

                {history.length > 0 ? (
                    <div className="flex items-end justify-between gap-1 h-20">
                        {history.map((d, i) => {
                            const pct = (d.score / maxScore) * 100
                            const color = d.score >= 80 ? 'bg-accent-green' : d.score >= 60 ? 'bg-accent' : 'bg-yellow-500'
                            return (
                                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                    <span className="text-[9px] text-text-muted font-mono">{d.score || ''}</span>
                                    <div className="w-full flex items-end" style={{ height: '52px' }}>
                                        <div
                                            className={`w-full rounded-t ${color} transition-all duration-700`}
                                            style={{ height: `${Math.max(pct, 4)}%` }}
                                        />
                                    </div>
                                    <span className="text-[9px] text-text-muted">{getDay(d.date)}</span>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-[11px] text-text-muted text-center py-6">
                        Data will appear after your first active day
                    </div>
                )}
            </Card>

            {/* Score breakdown this week */}
            <Card>
                <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-sm">⚡</span>
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Score Components</span>
                </div>

                {history.length > 0 ? (
                    <div className="space-y-2">
                        {[
                            { label: 'Task Completion', key: 'tasks_pts' as keyof DailyScore, max: 25, color: 'bg-accent' },
                            { label: 'Focus Sessions', key: 'focus_pts' as keyof DailyScore, max: 20, color: 'bg-accent-purple' },
                            { label: 'Coding Time', key: 'coding_pts' as keyof DailyScore, max: 20, color: 'bg-accent-green' },
                            { label: 'Low Distraction', key: 'distraction_pts' as keyof DailyScore, max: 15, color: 'bg-yellow-500' },
                        ].map((c) => {
                            const avgPts = Math.round(
                                history.reduce((s, d) => s + ((d[c.key] as number) || 0), 0) / Math.max(history.length, 1)
                            )
                            return (
                                <div key={c.key}>
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-[11px] text-text-secondary">{c.label}</span>
                                        <span className="text-[10px] text-text-muted font-mono">avg {avgPts}/{c.max}</span>
                                    </div>
                                    <ProgressBar value={avgPts} max={c.max} color={c.color} height="h-1.5" />
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-[11px] text-text-muted text-center py-4">Complete tasks to see analytics</div>
                )}
            </Card>

            {/* Screen time history */}
            <Card>
                <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-sm">⏱</span>
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Screen Time (7 Days)</span>
                </div>
                {screenHistory.length > 0 ? (
                    <div className="space-y-1.5">
                        {screenHistory.slice(-7).map((d, i) => {
                            const codingPct = d.totalSeconds > 0 ? (d.codingSeconds / d.totalSeconds) * 100 : 0
                            return (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-[10px] text-text-muted w-8">{getDay(d.date)}</span>
                                    <div className="flex-1">
                                        <ProgressBar value={d.totalSeconds} max={8 * 3600} color="bg-surface-hover" height="h-1.5" />
                                    </div>
                                    <div className="flex-1">
                                        <ProgressBar value={codingPct} max={100} color="bg-accent-green" height="h-1.5" />
                                    </div>
                                    <span className="text-[10px] text-text-muted font-mono w-12 text-right">
                                        {formatSecondsShort(d.totalSeconds)}
                                    </span>
                                </div>
                            )
                        })}
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-1 bg-surface-hover rounded" />
                                <span className="text-[9px] text-text-muted">Total</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-1 bg-accent-green rounded" />
                                <span className="text-[9px] text-text-muted">Coding %</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-[11px] text-text-muted text-center py-4">Screen time data will appear here</div>
                )}
            </Card>
        </div>
    )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="bg-surface-card border border-surface-border rounded-xl px-3 py-2.5">
            <div className="text-[10px] text-text-muted mb-0.5">{label}</div>
            <div className={`text-lg font-mono font-bold ${color}`}>{value}</div>
        </div>
    )
}
