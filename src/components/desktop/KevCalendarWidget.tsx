interface KevCalendarWidgetProps {
    className?: string
}

export function KevCalendarWidget({ className = '' }: KevCalendarWidgetProps) {
    const days = [
        ['', '', '', 1, 2, 3, 4],
        [5, 6, 7, 8, 9, 10, 11],
        [12, 13, 14, 15, 16, 17, 18],
        [19, 20, 21, 22, 23, 24, 25],
        [26, 27, 28, 29, 30, 31, ''],
    ]

    return (
        <div
            className={`w-76 h-36 bg-[#18191d]/95 border border-white/10 text-white rounded-[24px] p-3.5 shadow-2xl flex items-center justify-between select-none ${className}`}
        >
            {/* Left Column: Event summary */}
            <div className="flex flex-col justify-between h-full pr-3 border-r border-white/10 w-28 shrink-0">
                <div>
                    <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-wider block">
                        WEDNESDAY
                    </span>
                    <span className="text-4xl font-extrabold text-white leading-none block mt-1">
                        25
                    </span>
                </div>
                <span className="text-[10px] text-white/50 font-medium">
                    No Events Today
                </span>
            </div>

            {/* Right Column: Month grid */}
            <div className="flex-1 pl-3 flex flex-col justify-between h-full">
                <div className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest text-right mb-1">
                    MARCH
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-mono text-white/40 mb-1">
                    <span>S</span>
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                </div>

                <div className="grid grid-cols-7 gap-y-0.5 text-center text-[10px] font-mono text-white/80">
                    {days.flat().map((d, i) => (
                        <div
                            key={i}
                            className={`h-4 flex items-center justify-center ${
                                d === 25
                                    ? 'w-4 h-4 rounded-full bg-rose-600 text-white font-bold mx-auto shadow-sm shadow-rose-600/50'
                                    : ''
                            }`}
                        >
                            {d}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
