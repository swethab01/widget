import { useState, useEffect } from 'react'

interface RetroFlipClockWidgetProps {
    className?: string
}

export function RetroFlipClockWidget({ className = '' }: RetroFlipClockWidgetProps) {
    const [now, setNow] = useState(new Date())
    const [showSeconds, setShowSeconds] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')

    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
    const monthName = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    const dayNum = now.getDate()

    return (
        <div
            onClick={() => setShowSeconds((prev) => !prev)}
            className={`mac-widget-tile p-4 cursor-pointer hover:border-white/20 transition-all group select-none flex flex-col justify-between ${className}`}
            title="Click to toggle seconds"
        >
            {/* Top Bar: Live indicator and day badge */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-white/50 mb-2">
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mac-pulse-dot" />
                    <span className="font-semibold text-white/70">CLOCK</span>
                </div>
                <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">
                    {showSeconds ? 'HMS' : 'HM'}
                </span>
            </div>

            {/* Split-Flap Clock Display */}
            <div className="flex items-center justify-center gap-1.5 py-1">
                {/* Hours Card */}
                <div className="relative bg-black/40 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-center shadow-inner overflow-hidden min-w-[62px]">
                    <span className="flip-number text-3xl sm:text-4xl text-white font-extrabold">
                        {hours}
                    </span>
                    <div className="flip-divider" />
                </div>

                {/* Blinking Colon */}
                <span className="text-2xl font-bold text-white/40 pb-1 animate-pulse">:</span>

                {/* Minutes Card */}
                <div className="relative bg-black/40 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-center shadow-inner overflow-hidden min-w-[62px]">
                    <span className="flip-number text-3xl sm:text-4xl text-white font-extrabold">
                        {minutes}
                    </span>
                    <div className="flip-divider" />
                </div>

                {/* Optional Seconds Card */}
                {showSeconds && (
                    <>
                        <span className="text-xl font-bold text-white/40 pb-1 animate-pulse">:</span>
                        <div className="relative bg-black/40 border border-white/10 rounded-xl px-2.5 py-2 flex items-center justify-center shadow-inner overflow-hidden min-w-[48px]">
                            <span className="flip-number text-2xl sm:text-3xl text-amber-400 font-bold">
                                {seconds}
                            </span>
                            <div className="flip-divider" />
                        </div>
                    </>
                )}
            </div>

            {/* Date Footer */}
            <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
                <span className="font-bold tracking-tight text-white/80">{dayName}</span>
                <span className="font-mono text-white/40">{monthName} {dayNum}</span>
            </div>
        </div>
    )
}
