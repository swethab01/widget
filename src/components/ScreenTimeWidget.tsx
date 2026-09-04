import { Card } from './ui/Card'
import { formatSecondsShort } from '../utils/time'
import type { ScreenTimeSummary } from '../types'

const CATEGORY_ICON: Record<string, string> = {
    Development: '💻',
    Browser: '🌐',
    Entertainment: '🎬',
    Communication: '💬',
    Productivity: '📋',
    Study: '📚',
    System: '⚙️',
    Other: '📦',
}

const CATEGORY_COLOR: Record<string, string> = {
    Development: 'text-accent-green',
    Browser: 'text-blue-400',
    Entertainment: 'text-red-400',
    Communication: 'text-yellow-400',
    Productivity: 'text-accent-purple',
    Study: 'text-cyan-400',
    Other: 'text-text-muted',
}

interface ScreenTimeWidgetProps {
    summary: ScreenTimeSummary
    loading: boolean
}

export function ScreenTimeWidget({ summary, loading }: ScreenTimeWidgetProps) {
    const productivePct =
        summary.totalSeconds > 0
            ? Math.round((summary.productiveSeconds / summary.totalSeconds) * 100)
            : 0

    const entertainPct =
        summary.totalSeconds > 0
            ? Math.round((summary.entertainmentSeconds / summary.totalSeconds) * 100)
            : 0

    if (loading) {
        return (
            <Card className="animate-pulse">
                <div className="h-4 bg-surface-border rounded mb-2 w-24" />
                <div className="h-8 bg-surface-border rounded w-16" />
            </Card>
        )
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm">⏱</span>
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Screen Time</span>
                </div>
                {summary.totalSeconds === 0 && (
                    <span className="text-[10px] text-text-muted">tracking…</span>
                )}
            </div>

            {/* Total + Productive row */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <StatBlock
                    label="Total"
                    value={formatSecondsShort(summary.totalSeconds)}
                    color="text-text-primary"
                />
                <StatBlock
                    label="Coding"
                    value={formatSecondsShort(summary.codingSeconds)}
                    color="text-accent-green"
                />
                <StatBlock
                    label="Productive"
                    value={`${productivePct}%`}
                    color="text-accent"
                />
                <StatBlock
                    label="Entertainment"
                    value={`${entertainPct}%`}
                    color={entertainPct > 30 ? 'text-red-400' : 'text-text-secondary'}
                />
            </div>

            {/* Top apps */}
            {summary.apps.length > 0 && (
                <div>
                    <div className="text-[10px] text-text-muted mb-1.5 uppercase tracking-wider">Top Apps</div>
                    <div className="space-y-1">
                        {summary.apps.slice(0, 5).map((app, i) => {
                            const name = app.appName || app.app_name || 'Unknown'
                            const secs = app.durationSeconds || app.duration_seconds || 0
                            const pct = summary.totalSeconds > 0 ? (secs / summary.totalSeconds) * 100 : 0
                            const cat = app.category

                            return (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-[10px] w-3">{CATEGORY_ICON[cat] || '📦'}</span>
                                    <span className={`text-[10px] flex-1 truncate ${CATEGORY_COLOR[cat] || 'text-text-secondary'}`}>
                                        {name}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-12 h-1 bg-surface-border rounded-full overflow-hidden">
                                            <div
                                                className={`h-1 rounded-full ${CATEGORY_COLOR[cat] ? 'bg-current' : 'bg-text-muted'}`}
                                                style={{ width: `${Math.min(pct, 100)}%`, color: undefined }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-text-muted font-mono w-10 text-right">
                                            {formatSecondsShort(secs)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {summary.totalSeconds === 0 && (
                <div className="text-[11px] text-text-muted text-center py-2">
                    Tracking started — data will appear shortly
                </div>
            )}
        </Card>
    )
}

function StatBlock({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="bg-surface-hover rounded-lg px-2 py-1.5">
            <div className="text-[10px] text-text-muted">{label}</div>
            <div className={`text-sm font-mono font-semibold ${color}`}>{value}</div>
        </div>
    )
}
