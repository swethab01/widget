import { useState, useEffect } from 'react'

interface KevCalendarWidgetProps {
    className?: string
}

export function KevCalendarWidget({ className = '' }: KevCalendarWidgetProps) {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const todayDate = now.getDate()
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
    const monthName = now.toLocaleDateString('en-US', { month: 'long' }).toUpperCase()

    // Build current month calendar cells
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDayIndex = new Date(year, month, 1).getDay() // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const calendarCells: (number | '')[] = []
    for (let i = 0; i < firstDayIndex; i++) {
        calendarCells.push('')
    }
    for (let d = 1; d <= daysInMonth; d++) {
        calendarCells.push(d)
    }
    // Pad to multiple of 7 for clean rows (up to 35 or 42)
    while (calendarCells.length % 7 !== 0) {
        calendarCells.push('')
    }

    return (
        <div
            className={`w-76 h-36 bg-[#18191d]/95 border border-white/10 text-white rounded-[24px] p-3.5 shadow-2xl flex items-center justify-between select-none ${className}`}
        >
            {/* Left Column: Event summary */}
            <div className="flex flex-col justify-between h-full pr-3 border-r border-white/10 w-28 shrink-0">
                <div>
                    <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-wider block">
                        {weekday}
                    </span>
                    <span className="text-4xl font-extrabold text-white leading-none block mt-1">
                        {todayDate}
                    </span>
                </div>
                <span className="text-[10px] text-white/50 font-medium">
                    No Events Today
                </span>
            </div>

            {/* Right Column: Month grid */}
            <div className="flex-1 pl-3 flex flex-col justify-between h-full">
                <div className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest text-right mb-0.5">
                    {monthName}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-mono text-white/40 mb-0.5">
                    <span>S</span>
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                </div>

                <div className="grid grid-cols-7 gap-y-0.5 text-center text-[10px] font-mono text-white/80">
                    {calendarCells.slice(0, 35).map((d, i) => (
                        <div
                            key={i}
                            className={`h-3.5 flex items-center justify-center ${
                                d === todayDate
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
