interface KevWeatherWidgetProps {
    className?: string
}

export function KevWeatherWidget({ className = '' }: KevWeatherWidgetProps) {
    const hourly = [
        { time: '12 AM', icon: '🌙', temp: '23°' },
        { time: '1 AM', icon: '🌙', temp: '23°' },
        { time: '2 AM', icon: '🌙', temp: '23°' },
        { time: '3 AM', icon: '☁️', temp: '23°' },
        { time: '4 AM', icon: '☁️', temp: '22°' },
        { time: '5 AM', icon: '🌙', temp: '22°' },
    ]

    return (
        <div
            className={`w-76 h-36 bg-[#1a2138]/95 text-white rounded-[24px] p-3.5 shadow-2xl border border-white/10 flex flex-col justify-between select-none ${className}`}
        >
            {/* Top Row */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-white/90">
                        <span>Doha</span>
                        <span className="text-[10px]">📍</span>
                    </div>
                    <div className="text-3xl font-extrabold text-white tracking-tight leading-none mt-0.5">
                        23°
                    </div>
                </div>

                <div className="text-right text-[11px] text-white/70 font-medium">
                    <div>Mostly Clear</div>
                    <div className="text-[10px] text-white/50 font-mono mt-0.5">
                        H:28° L:21°
                    </div>
                </div>
            </div>

            {/* Bottom Row: Hourly forecast */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10">
                {hourly.map((h, i) => (
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
