import { useState, useEffect } from 'react'

interface KevClockWidgetProps {
    className?: string
}

export function KevClockWidget({ className = '' }: KevClockWidgetProps) {
    const [now, setNow] = useState(new Date())
    const [is24Hour, setIs24Hour] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    let hours: string
    if (is24Hour) {
        hours = String(now.getHours()).padStart(2, '0')
    } else {
        const h = now.getHours() % 12 || 12
        hours = String(h)
    }
    const minutes = String(now.getMinutes()).padStart(2, '0')

    // 48 precise Apple Watch perimeter tick marks
    const ticks = Array.from({ length: 48 })

    return (
        <div
            onClick={() => setIs24Hour((prev) => !prev)}
            title="Click to toggle 12h / 24h format"
            className={`w-40 h-40 rounded-[28px] relative overflow-hidden flex flex-col items-center justify-center select-none cursor-pointer transition-transform hover:scale-[1.01] ${className}`}
            style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.6) inset',
            }}
        >
            {/* Subtle top shine */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/80 pointer-events-none" />

            {/* Outer Perimeter Tick Track */}
            <div className="absolute inset-2 rounded-[22px] pointer-events-none">
                {ticks.map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-[1.5px] rounded-full"
                        style={{
                            height: i % 4 === 0 ? '6px' : '3.5px',
                            backgroundColor: i % 4 === 0 ? '#6b7280' : '#d1d5db',
                            top: '50%',
                            left: '50%',
                            transform: `rotate(${i * 7.5}deg) translateY(-67px)`,
                            transformOrigin: 'center center',
                            opacity: i % 4 === 0 ? 0.9 : 0.5,
                        }}
                    />
                ))}
            </div>

            {/* Time Display — bold, dark, highly visible */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <span
                    className="text-[46px] font-black tracking-tighter leading-none select-none"
                    style={{ color: '#111827', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                    {hours}:{minutes}
                </span>
                {/* AM/PM indicator */}
                <span className="text-[10px] font-bold text-gray-400 tracking-widest mt-0.5">
                    {now.getHours() >= 12 ? 'PM' : 'AM'}
                </span>
            </div>
        </div>
    )
}
