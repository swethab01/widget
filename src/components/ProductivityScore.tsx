import { Card } from './ui/Card'
import { ProgressBar } from './ui/ProgressBar'
import type { DailyScore } from '../types'

interface ProductivityScoreProps {
    score: DailyScore
}

export function ProductivityScore({ score }: ProductivityScoreProps) {
    const { score: total, tasks_pts, focus_pts, coding_pts, distraction_pts } = score

    const scoreColor =
        total >= 80 ? 'text-accent-green' : total >= 60 ? 'text-yellow-400' : total >= 40 ? 'text-accent' : 'text-red-400'

    const scoreBgColor =
        total >= 80 ? '#2dd4a0' : total >= 60 ? '#f59e0b' : total >= 40 ? '#4f8ef7' : '#ef4444'

    const components = [
        { label: 'Task Completion', pts: tasks_pts, max: 25, color: 'bg-accent' },
        { label: 'Focus Sessions', pts: focus_pts, max: 20, color: 'bg-accent-purple' },
        { label: 'Coding Time', pts: coding_pts, max: 20, color: 'bg-accent-green' },
        { label: 'Low Distraction', pts: distraction_pts, max: 15, color: 'bg-yellow-500' },
    ]

    return (
        <Card>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm">⚡</span>
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Productivity Score</span>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
                {/* Circular score */}
                <div className="relative flex-shrink-0">
                    <svg width="72" height="72" viewBox="0 0 72 72">
                        {/* Background ring */}
                        <circle cx="36" cy="36" r="30" fill="none" stroke="#252d3d" strokeWidth="6" />
                        {/* Score arc */}
                        <circle
                            cx="36"
                            cy="36"
                            r="30"
                            fill="none"
                            stroke={scoreBgColor}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${(total / 100) * 188.5} 188.5`}
                            transform="rotate(-90 36 36)"
                            style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-xl font-bold font-mono ${scoreColor}`}>{total}</span>
                        <span className="text-[9px] text-text-muted">/ 100</span>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="flex-1 space-y-1.5">
                    {components.map((c) => (
                        <div key={c.label}>
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[10px] text-text-secondary">{c.label}</span>
                                <span className="text-[10px] font-mono text-text-muted">+{c.pts}</span>
                            </div>
                            <ProgressBar value={c.pts} max={c.max} color={c.color} height="h-1" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Insight message */}
            <div className="bg-surface-hover border border-surface-border rounded-lg px-3 py-2">
                <div className="text-[10px] text-text-secondary leading-relaxed">
                    {total >= 80
                        ? '🔥 Excellent day! You\'re in top form.'
                        : total >= 60
                            ? '💪 Good progress. Push a bit more on focus sessions.'
                            : total >= 40
                                ? '📈 Decent start. Complete more tasks to boost your score.'
                                : '💡 Start a focus session and complete a task to get going!'}
                </div>
            </div>
        </Card>
    )
}
