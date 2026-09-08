import { useState, useEffect } from 'react'

interface BatteryRingsWidgetProps {
    className?: string
}

export function BatteryRingsWidget({ className = '' }: BatteryRingsWidgetProps) {
    const [batteryLevel, setBatteryLevel] = useState(94)
    const [isCharging, setIsCharging] = useState(false)
    const [cpuLoad] = useState(38)
    const [ramUsage] = useState(62)
    const [focusProgress] = useState(85)

    useEffect(() => {
        let batteryObj: any = null
        if ('getBattery' in navigator) {
            ;(navigator as any).getBattery().then((battery: any) => {
                batteryObj = battery
                const update = () => {
                    setBatteryLevel(Math.round(battery.level * 100))
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

    // Helper for SVG circular progress
    const radius = 22
    const circumference = 2 * Math.PI * radius

    const getOffset = (val: number) => {
        return circumference - (Math.min(val, 100) / 100) * circumference
    }

    return (
        <div className={`mac-widget-tile p-4 flex flex-col justify-between select-none ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-white/50 mb-2">
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mac-pulse-dot" />
                    <span className="font-semibold text-white/70">BATTERY & SYSTEM</span>
                </div>
                <div className="flex items-center gap-1">
                    {isCharging && <span className="text-[10px] text-lime-400 animate-pulse">⚡</span>}
                    <span className="text-[10px] text-emerald-400 font-bold">{batteryLevel}%</span>
                </div>
            </div>

            {/* 4 Apple Circles Grid */}
            <div className="grid grid-cols-4 gap-2 py-1 items-center justify-items-center">
                {/* 1. MacBook Battery */}
                <div className="flex flex-col items-center group relative cursor-pointer">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 54 54">
                            <circle
                                cx="27"
                                cy="27"
                                r={radius}
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.08)"
                                strokeWidth="4.5"
                            />
                            <circle
                                cx="27"
                                cy="27"
                                r={radius}
                                fill="none"
                                stroke="#30d158"
                                strokeWidth="4.5"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={getOffset(batteryLevel)}
                                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <span className="text-[9px] font-mono text-white/60 mt-1">Mac 94%</span>
                </div>

                {/* 2. CPU Flow */}
                <div className="flex flex-col items-center group relative cursor-pointer">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 54 54">
                            <circle
                                cx="27"
                                cy="27"
                                r={radius}
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.08)"
                                strokeWidth="4.5"
                            />
                            <circle
                                cx="27"
                                cy="27"
                                r={radius}
                                fill="none"
                                stroke="#0a84ff"
                                strokeWidth="4.5"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={getOffset(cpuLoad)}
                                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-mono text-[10px] font-bold text-blue-400">
                            {cpuLoad}%
                        </div>
                    </div>
                    <span className="text-[9px] font-mono text-white/60 mt-1">CPU Load</span>
                </div>

                {/* 3. Memory RAM */}
                <div className="flex flex-col items-center group relative cursor-pointer">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 54 54">
                            <circle
                                cx="27"
                                cy="27"
                                r={radius}
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.08)"
                                strokeWidth="4.5"
                            />
                            <circle
                                cx="27"
                                cy="27"
                                r={radius}
                                fill="none"
                                stroke="#bf5af2"
                                strokeWidth="4.5"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={getOffset(ramUsage)}
                                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-mono text-[10px] font-bold text-purple-400">
                            {ramUsage}%
                        </div>
                    </div>
                    <span className="text-[9px] font-mono text-white/60 mt-1">RAM</span>
                </div>

                {/* 4. Focus Goal */}
                <div className="flex flex-col items-center group relative cursor-pointer">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 54 54">
                            <circle
                                cx="27"
                                cy="27"
                                r={radius}
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.08)"
                                strokeWidth="4.5"
                            />
                            <circle
                                cx="27"
                                cy="27"
                                r={radius}
                                fill="none"
                                stroke="#ff9f0a"
                                strokeWidth="4.5"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={getOffset(focusProgress)}
                                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <span className="text-[9px] font-mono text-white/60 mt-1">Focus</span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-white/40">
                <span>Power Source: Battery</span>
                <span className="text-emerald-400">Condition: Normal</span>
            </div>
        </div>
    )
}
