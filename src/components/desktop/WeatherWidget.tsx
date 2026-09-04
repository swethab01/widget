import { useState } from 'react'

interface WeatherWidgetProps {
    className?: string
}

interface CityWeather {
    city: string
    temp: number
    condition: string
    high: number
    low: number
    hourly: { time: string; temp: number; icon: 'clear' | 'cloud' | 'rain' }[]
}

const CITIES: CityWeather[] = [
    {
        city: 'Doha',
        temp: 23,
        condition: 'Mostly Clear',
        high: 28,
        low: 21,
        hourly: [
            { time: '12 AM', temp: 23, icon: 'clear' },
            { time: '1 AM', temp: 23, icon: 'clear' },
            { time: '2 AM', temp: 23, icon: 'clear' },
            { time: '3 AM', temp: 23, icon: 'cloud' },
            { time: '4 AM', temp: 22, icon: 'cloud' },
            { time: '5 AM', temp: 22, icon: 'clear' },
        ],
    },
    {
        city: 'Cupertino',
        temp: 18,
        condition: 'Sunny',
        high: 22,
        low: 14,
        hourly: [
            { time: '12 PM', temp: 18, icon: 'clear' },
            { time: '1 PM', temp: 20, icon: 'clear' },
            { time: '2 PM', temp: 22, icon: 'clear' },
            { time: '3 PM', temp: 21, icon: 'cloud' },
            { time: '4 PM', temp: 19, icon: 'clear' },
            { time: '5 PM', temp: 17, icon: 'clear' },
        ],
    },
    {
        city: 'Tokyo',
        temp: 16,
        condition: 'Light Rain',
        high: 19,
        low: 12,
        hourly: [
            { time: '9 AM', temp: 15, icon: 'rain' },
            { time: '10 AM', temp: 16, icon: 'rain' },
            { time: '11 AM', temp: 17, icon: 'cloud' },
            { time: '12 PM', temp: 18, icon: 'cloud' },
            { time: '1 PM', temp: 17, icon: 'rain' },
            { time: '2 PM', temp: 16, icon: 'rain' },
        ],
    },
]

export function WeatherWidget({ className = '' }: WeatherWidgetProps) {
    const [cityIndex, setCityIndex] = useState(0)
    const current = CITIES[cityIndex]

    const handleNextCity = () => {
        setCityIndex((prev) => (prev + 1) % CITIES.length)
    }

    return (
        <div
            onClick={handleNextCity}
            className={`mac-widget-tile p-4 cursor-pointer hover:border-white/20 transition-all select-none flex flex-col justify-between bg-gradient-to-br from-blue-950/60 via-[#10192e]/60 to-[#0c101d]/80 ${className}`}
            title="Click to toggle city"
        >
            {/* City & Temp Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-1">
                        <span className="font-semibold text-white/90 text-sm tracking-tight">{current.city}</span>
                        <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                    </div>
                    <span className="text-3xl font-extrabold text-white tracking-tighter">
                        {current.temp}°
                    </span>
                </div>

                <div className="text-right">
                    <span className="text-[11px] font-medium text-white/70 block">{current.condition}</span>
                    <span className="text-[10px] font-mono text-white/40">
                        H:{current.high}° L:{current.low}°
                    </span>
                </div>
            </div>

            {/* Hourly Forecast Bar */}
            <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between gap-1 text-center">
                {current.hourly.map((h, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <span className="text-[9px] font-mono text-white/40 mb-1">{h.time}</span>
                        {h.icon === 'clear' ? (
                            <span className="text-[12px] text-amber-300">🌙</span>
                        ) : h.icon === 'rain' ? (
                            <span className="text-[12px] text-blue-400">🌧️</span>
                        ) : (
                            <span className="text-[12px] text-slate-300">☁️</span>
                        )}
                        <span className="text-[10px] font-bold text-white/80 mt-1">{h.temp}°</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
