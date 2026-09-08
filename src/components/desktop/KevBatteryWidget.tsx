import { useState, useEffect } from 'react'

interface KevBatteryWidgetProps {
    className?: string
}

export function KevBatteryWidget({ className = '' }: KevBatteryWidgetProps) {
    const [percentage, setPercentage] = useState(94)
    const [isCharging, setIsCharging] = useState(false)

    useEffect(() => {
        let batteryObj: any = null
        if ('getBattery' in navigator) {
            ;(navigator as any).getBattery().then((battery: any) => {
                batteryObj = battery
                const update = () => {
                    setPercentage(Math.round(battery.level * 100))
                    setIsCharging(battery.charging)
                }
                update()
                battery.addEventListener('levelchange', update)
                battery.addEventListener('chargingchange', update)
            }).catch(() => {})
        }
        return () => {
            if (batteryObj) {
                try {
                    batteryObj.removeEventListener('levelchange', () => {})
                    batteryObj.removeEventListener('chargingchange', () => {})
                } catch {}
            }
        }
    }, [])

    const radius = 24
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference
    const batteryColor = percentage <= 20 && !isCharging ? '#ff453a' : isCharging ? '#30d158' : '#30d158'

    const accessories = [
        {
            label: 'AirPods',
            color: '#3b82f6',
            bg: 'rgba(59,130,246,0.15)',
            border: 'rgba(59,130,246,0.35)',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
                </svg>
            ),
        },
        {
            label: 'Watch',
            color: '#a78bfa',
            bg: 'rgba(167,139,250,0.15)',
            border: 'rgba(167,139,250,0.35)',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect x="6" y="7" width="12" height="10" rx="3" />
                    <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                    <path d="M9 17v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3" />
                </svg>
            ),
        },
        {
            label: 'iPhone',
            color: '#34d399',
            bg: 'rgba(52,211,153,0.15)',
            border: 'rgba(52,211,153,0.35)',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-5">
                    <rect x="5" y="2" width="14" height="20" rx="3" />
                    <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
                </svg>
            ),
        },
    ]

    return (
        <div
            className={`w-40 rounded-[28px] p-4 flex flex-col items-center gap-4 select-none ${className}`}
            style={{
                background: 'rgba(28,29,34,0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08) inset',
                minHeight: '340px',
            }}
        >
            {/* Top glow line */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/15 rounded-t-[28px] pointer-events-none" />

            {/* Slot 1 — Main Laptop Battery with ring */}
            <div className="flex flex-col items-center gap-1 w-full">
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-16 h-16 -rotate-90 transform absolute" viewBox="0 0 60 60">
                        {/* Track */}
                        <circle cx="30" cy="30" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                        {/* Progress */}
                        <circle
                            cx="30" cy="30" r={radius} fill="none"
                            stroke={batteryColor}
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{ transition: 'stroke-dashoffset 0.6s ease-out', filter: `drop-shadow(0 0 4px ${batteryColor})` }}
                        />
                    </svg>
                    {/* Battery icon center */}
                    <div className="relative z-10 flex flex-col items-center">
                        <span className="text-sm font-black text-white leading-none">{percentage}%</span>
                        {isCharging && <span className="text-[9px] text-emerald-400 font-bold">⚡</span>}
                    </div>
                </div>
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">MacBook</span>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/10" />

            {/* Accessory Slots */}
            {accessories.map((acc) => (
                <div key={acc.label} className="flex flex-col items-center gap-1">
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                        style={{
                            background: acc.bg,
                            border: `1.5px solid ${acc.border}`,
                            color: acc.color,
                            boxShadow: `0 0 12px ${acc.bg}`,
                        }}
                    >
                        {acc.icon}
                    </div>
                    <span className="text-[8px] font-mono text-white/35 uppercase tracking-widest">{acc.label}</span>
                </div>
            ))}
        </div>
    )
}
