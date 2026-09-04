interface ProgressBarProps {
    value: number // 0-100
    max?: number
    color?: string
    height?: string
    showLabel?: boolean
    animate?: boolean
}

export function ProgressBar({
    value,
    max = 100,
    color = 'bg-accent',
    height = 'h-1.5',
    showLabel = false,
    animate = true,
}: ProgressBarProps) {
    const pct = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
        <div className="flex items-center gap-2">
            <div className={`flex-1 bg-surface-border rounded-full overflow-hidden ${height}`}>
                <div
                    className={`${height} ${color} rounded-full ${animate ? 'transition-all duration-700 ease-out' : ''}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {showLabel && (
                <span className="text-xs font-mono text-text-secondary w-8 text-right">
                    {Math.round(pct)}%
                </span>
            )}
        </div>
    )
}
