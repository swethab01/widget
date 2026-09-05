import { useState, useEffect } from 'react'
import type { DailyScore } from '../../types'

interface MacScoreWidgetProps {
    className?: string
}

export function MacScoreWidget({ className = '' }: MacScoreWidgetProps) {
    const [score, setScore] = useState<DailyScore>({
        date: '',
        score: 88,
        tasks_pts: 24,
        focus_pts: 28,
        coding_pts: 26,
        distraction_pts: 0,
        momentum_pts: 10,
    })

    useEffect(() => {
        window.electronAPI.score.getToday().then((s) => {
            if (s) setScore(s)
        })
    }, [])

    // Concentric ring radii
    // Outer: Tasks (Red)
    const r1 = 34
    const c1 = 2 * Math.PI * r1
    const p1 = Math.min((score.tasks_pts / 30), 1)
    const offset1 = c1 - p1 * c1

    // Middle: Focus (Green)
    const r2 = 25
    const c2 = 2 * Math.PI * r2
    const p2 = Math.min((score.focus_pts / 35), 1)
    const offset2 = c2 - p2 * c2

    // Inner: Coding (Cyan)
    const r3 = 16
    const c3 = 2 * Math.PI * r3
    const p3 = Math.min((score.coding_pts / 35), 1)
    const offset3 = c3 - p3 * c3

    return (
        <div
            className={`mac-widget-tile p-4 flex flex-col justify-between select-none ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-white/50 mb-1">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mac-pulse-dot" />
                    <span className="font-semibold text-white/80">ACTIVITY RINGS</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">
                    {score.score}/100 PTS
                </span>
            </div>

            {/* Concentric Rings Center */}
            <div className="flex items-center justify-around py-1">
                {/* 3 Rings SVG */}
                <div className="relative flex items-center justify-center">
                    <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 84 84">
                        {/* Background track rings */}
                        <circle cx="42" cy="42" r={r1} fill="none" stroke="rgba(255, 45, 85, 0.15)" strokeWidth="5.5" />
                        <circle cx="42" cy="42" r={r2} fill="none" stroke="rgba(48, 209, 88, 0.15)" strokeWidth="5.5" />
                        <circle cx="42" cy="42" r={r3} fill="none" stroke="rgba(10, 132, 255, 0.15)" strokeWidth="5.5" />

                        {/* Outer: Tasks (Rose) */}
                        <circle
                            cx="42"
                            cy="42"
                            r={r1}
                            fill="none"
                            stroke="#ff2d55"
                            strokeWidth="5.5"
                            strokeLinecap="round"
                            strokeDasharray={c1}
                            strokeDashoffset={offset1}
                            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                        />

                        {/* Middle: Focus (Green) */}
                        <circle
                            cx="42"
                            cy="42"
                            r={r2}
                            fill="none"
                            stroke="#30d158"
                            strokeWidth="5.5"
                            strokeLinecap="round"
                            strokeDasharray={c2}
                            strokeDashoffset={offset2}
                            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                        />

                        {/* Inner: Coding (Cyan) */}
                        <circle
                            cx="42"
                            cy="42"
                            r={r3}
                            fill="none"
                            stroke="#00f0ff"
                            strokeWidth="5.5"
                            strokeLinecap="round"
                            strokeDasharray={c3}
                            strokeDashoffset={offset3}
                            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-mono font-extrabold text-white leading-none">
                            {score.score}
                        </span>
                        <span className="text-[8px] font-mono text-white/40 mt-0.5">DEV PULSE</span>
                    </div>
                </div>

                {/* Ring legend */}
                <div className="flex flex-col gap-1.5 pl-2 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff2d55] flex-shrink-0" />
                        <span className="text-white/70 text-[11px]">Tasks</span>
                        <span className="text-white/40 font-mono text-[10px] ml-auto">
                            {score.tasks_pts}p
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#30d158] flex-shrink-0" />
                        <span className="text-white/70 text-[11px]">Focus</span>
                        <span className="text-white/40 font-mono text-[10px] ml-auto">
                            {score.focus_pts}p
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] flex-shrink-0" />
                        <span className="text-white/70 text-[11px]">Coding</span>
                        <span className="text-white/40 font-mono text-[10px] ml-auto">
                            {score.coding_pts}p
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-1 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-white/50">
                <span>Momentum: +{score.momentum_pts ?? 10} pts</span>
                <span className="text-emerald-400 font-semibold">In The Zone</span>
            </div>
        </div>
    )
}
