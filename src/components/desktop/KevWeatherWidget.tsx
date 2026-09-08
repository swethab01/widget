import { useState } from 'react'

interface KevWeatherWidgetProps {
    className?: string
}

const CITIES = [
    {
        city: 'Doha',
        temp: '23°',
        condition: 'Mostly Clear',
        high: '28°',
        low: '21°',
        hourly: [
            { time: '12 AM', icon: '🌙', temp: '23°' },
            { time: '1 AM', icon: '🌙', temp: '23°' },
            { time: '2 AM', icon: '🌙', temp: '23°' },
            { time: '3 AM', icon: '☁️', temp: '23°' },
            { time: '4 AM', icon: '☁️', temp: '22°' },
            { time: '5 AM', icon: '🌙', temp: '22°' },
        ],
    },
    {
        city: 'Cupertino',
        temp: '18°',
        condition: 'Sunny',
        high: '22°',
        low: '14°',
        hourly: [
            { time: '12 PM', icon: '☀️', temp: '18°' },
            { time: '1 PM', icon: '☀️', temp: '20°' },
            { time: '2 PM', icon: '☀️', temp: '22°' },
            { time: '3 PM', icon: '🌤️', temp: '21°' },
            { time: '4 PM', icon: '☀️', temp: '19°' },
            { time: '5 PM', icon: '🌅', temp: '17°' },
        ],
    },
    {
        city: 'Tokyo',
        temp: '16°',
        condition: 'Light Rain',
        high: '19°',
        low: '12°',
        hourly: [
            { time: '9 AM', icon: '🌧️', temp: '15°' },
            { time: '10 AM', icon: '🌧️', temp: '16°' },
            { time: '11 AM', icon: '☁️', temp: '17°' },
            { time: '12 PM', icon: '🌧️', temp: '18°' },
            { time: '1 PM', icon: '🌧️', temp: '17°' },
            { time: '2 PM', icon: '☁️', temp: '16°' },
        ],
    },
    {
        city: 'London',
        temp: '14°',
        condition: 'Overcast',
        high: '16°',
        low: '10°',
        hourly: [
            { time: '1 PM', icon: '☁️', temp: '14°' },
            { time: '2 PM', icon: '🌦️', temp: '15°' },
            { time: '3 PM', icon: '☁️', temp: '15°' },
            { time: '4 PM', icon: '🌦️', temp: '14°' },
            { time: '5 PM', icon: '☁️', temp: '13°' },
            { time: '6 PM', icon: '🌙', temp: '12°' },
        ],
    },
]

export function KevWeatherWidget({ className = '' }: KevWeatherWidgetProps) {
    const [cityIndex, setCityIndex] = useState(0)
    const current = CITIES[cityIndex]

    const handleNextCity = () => {
        setCityIndex((prev) => (prev + 1) % CITIES.length)
    }

    return (
        <div
            onClick={handleNextCity}
            title="Click to change city"
            className={`w-76 h-36 bg-[#1a2138]/95 text-white rounded-[24px] p-3.5 shadow-2xl border border-white/10 flex flex-col justify-between select-none cursor-pointer hover:border-white/20 transition-all ${className}`}
        >
            {/* Top Row */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-white/90">
                        <span>{current.city}</span>
                        <span className="text-[10px] text-blue-400">▾</span>
                    </div>
                    <div className="text-3xl font-extrabold text-white tracking-tight leading-none mt-0.5">
                        {current.temp}
                    </div>
                </div>

                <div className="text-right text-[11px] text-white/70 font-medium">
                    <div>{current.condition}</div>
                    <div className="text-[10px] text-white/50 font-mono mt-0.5">
                        H:{current.high} L:{current.low}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Hourly forecast */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10">
                {current.hourly.map((h, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5 text-center">
                        <span className="text-[9px] font-mono text-white/50">{h.time}</span>
                        <span className="text-xs my-0.5">{h.icon}</span>
                        <span className="text-[11px] font-bold text-white">{h.temp}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
