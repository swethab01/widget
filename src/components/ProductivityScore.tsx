import { Card } from './ui/Card'
import type { DailyScore } from '../types'

interface ProductivityScoreProps {
    score: DailyScore
}

export function ProductivityScore({ score }: ProductivityScoreProps) {
    const { score: total, tasks_pts, focus_pts, coding_pts, distraction_pts, momentum_pts = 0 } = score

    const taskPct = Math.min(100, Math.max(0, (tasks_pts / 25) * 100))
    const codingPct = Math.min(100, Math.max(0, (coding_pts / 20) * 100))
    const focusPct = Math.min(100, Math.max(0, (focus_pts / 20) * 100))

    // Circumferences for concentric rings
    // Outer: r = 40 => 2 * pi * 40 = 251.3
    // Middle: r = 29 => 2 * pi * 29 = 182.2
    // Inner: r = 18 => 2 * pi * 18 = 113.1
    const cOuter = 251.3
    const cMid = 182.2
    const cInner = 113.1

    const scoreColor =
        total >= 80 ? 'text-emerald-400' : total >= 60 ? 'text-amber-400' : total >= 40 ? 'text-blue-400' : 'text-rose-400'

    const metrics = [
        { label: 'Tasks', pts: tasks_pts, max: 25, color: '#ff2d55', bg: 'bg-[#ff2d55]/10', text: 'text-[#ff2d55]' },
        { label: 'Coding', pts: coding_pts, max: 20, color: '#30d158', bg: 'bg-[#30d158]/10', text: 'text-[#30d158]' },
        { label: 'Focus', pts: focus_pts, max: 20, color: '#00c7be', bg: 'bg-[#00c7be]/10', text: 'text-[#00c7be]' },
        { label: 'Attention', pts: distraction_pts, max: 15, color: '#ffd60a', bg: 'bg-[#ffd60a]/10', text: 'text-[#ffd60a]' },
    ]

    return (
        <Card className="relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/90 tracking-tight uppercase">
                        Activity Rings
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-white/50 font-mono">Today</span>
                </div>
            </div>

            {/* Apple Activity Rings Visual */}
            <div className="flex items-center gap-4 mb-3">
                {/* Triple Concentric Rings SVG */}
                <div className="relative flex-shrink-0 w-24 h-24 flex items-center justify-center">
                    <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 96 96">
                        {/* Background Tracks */}
                        <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255, 45, 85, 0.15)" strokeWidth="6.5" />
                        <circle cx="48" cy="48" r="29" fill="none" stroke="rgba(48, 209, 88, 0.15)" strokeWidth="6.5" />
                        <circle cx="48" cy="48" r="18" fill="none" stroke="rgba(0, 199, 190, 0.15)" strokeWidth="6.5" />

                        {/* Outer Ring: Tasks (Pink/Red) */}
                        <circle
                            cx="48"
                            cy="48"
                            r="40"
                            fill="none"
                            stroke="#ff2d55"
                            strokeWidth="6.5"
                            strokeLinecap="round"
                            strokeDasharray={`${(taskPct / 100) * cOuter} ${cOuter}`}
                            style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        />

                        {/* Middle Ring: Coding (Green) */}
                        <circle
                            cx="48"
                            cy="48"
                            r="29"
                            fill="none"
                            stroke="#30d158"
                            strokeWidth="6.5"
                            strokeLinecap="round"
                            strokeDasharray={`${(codingPct / 100) * cMid} ${cMid}`}
                            style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        />

                        {/* Inner Ring: Focus (Cyan/Teal) */}
                        <circle
                            cx="48"
                            cy="48"
                            r="18"
                            fill="none"
                            stroke="#00c7be"
                            strokeWidth="6.5"
                            strokeLinecap="round"
                            strokeDasharray={`${(focusPct / 100) * cInner} ${cInner}`}
                            style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        />
                    </svg>

                    {/* Center Core Number */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className={`text-base font-mono font-bold leading-none ${scoreColor}`}>
                            {total}
                        </span>
                        <span className="text-[8px] text-white/40 font-mono leading-tight">SCORE</span>
                    </div>
                </div>

                {/* Ring legend breakdown */}
                <div className="flex-1 grid grid-cols-2 gap-1.5">
                    {metrics.map((m) => (
                        <div key={m.label} className="p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                                <span className="text-[10px] text-white/60 truncate">{m.label}</span>
                            </div>
                            <div className="text-xs font-mono font-semibold text-white/90">
                                {m.pts}<span className="text-[9px] text-white/40 font-normal">/{m.max}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Apple Activity summary pill */}
            <div className="px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-[10px]">
                <span className="text-white/60">
                    {total >= 80 ? '🔥 Rings closed! Peak developer form.' : total >= 60 ? '⚡ Strong pace. Close your focus ring.' : '✦ Close rings to hit today’s goal.'}
                </span>
                {momentum_pts > 0 && (
                    <span className="font-mono text-emerald-400">+{momentum_pts} streak</span>
                )}
            </div>
        </Card>
    )
}
