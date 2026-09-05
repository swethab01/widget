import { useState, useEffect } from 'react'

interface KevClockWidgetProps {
    className?: string
}

export function KevClockWidget({ className = '' }: KevClockWidgetProps) {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')

    // Generate 60 small tick marks around the perimeter
    const ticks = Array.from({ length: 48 })

    return (
        <div
            className={`w-36 h-36 bg-white text-neutral-900 rounded-[24px] p-3 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center select-none ${className}`}
        >
            {/* Outer Perimeter Tick Marks */}
            <div className="absolute inset-1.5 border border-neutral-200/80 rounded-[20px] pointer-events-none">
                {ticks.map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-0.5 h-1.5 bg-neutral-300 rounded-full"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: `rotate(${i * 7.5}deg) translateY(-60px)`,
                            transformOrigin: 'center center',
                            opacity: i % 4 === 0 ? 0.9 : 0.4,
                        }}
                    />
                ))}
            </div>

            {/* Time Display */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold tracking-tight font-sans text-black leading-none">
                    {hours}:{minutes}
                </span>
            </div>
        </div>
    )
}
