import { useState } from 'react'

interface MacCalendarWidgetProps {
    className?: string
    taskCount?: number
}

export function MacCalendarWidget({ className = '', taskCount = 3 }: MacCalendarWidgetProps) {
    const [today] = useState(new Date())

    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() // 0-11
    const currentDate = today.getDate()

    const monthName = today.toLocaleDateString('en-US', { month: 'long' })
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()

    // Days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    // First day of month (0 = Sun, 1 = Mon...)
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay()

    const days = []
    // Empty cells for alignment
    for (let i = 0; i < firstDayIndex; i++) {
        days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i)
    }

    return (
        <div className={`mac-widget-tile p-4 flex flex-col justify-between select-none ${className}`}>
            {/* Header: Date Badge & Month */}
            <div className="flex items-start justify-between mb-2">
                <div>
                    <span className="text-[10px] font-bold tracking-widest text-rose-500 block">
                        {dayName}
                    </span>
                    <span className="text-3xl font-extrabold text-white tracking-tight leading-none">
                        {currentDate}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-xs font-semibold text-white/90">{monthName}</span>
                    <span className="text-[10px] font-mono text-white/40 block">{currentYear}</span>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="py-1">
                {/* Day Headers */}
                <div className="grid grid-cols-7 text-center text-[9px] font-mono font-semibold text-white/40 mb-1">
                    <span>S</span>
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                </div>

                {/* Day Numbers */}
                <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-mono">
                    {days.slice(0, 35).map((d, index) => {
                        if (d === null) return <span key={index} />
                        const isToday = d === currentDate
                        return (
                            <span
                                key={index}
                                className={`w-5 h-5 mx-auto flex items-center justify-center rounded-full transition-all ${
                                    isToday
                                        ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/30'
                                        : 'text-white/70 hover:bg-white/10'
                                }`}
                            >
                                {d}
                            </span>
                        )
                    })}
                </div>
            </div>

            {/* Footer / Event preview */}
            <div className="mt-2 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-white/50">
                <span className="truncate">
                    {taskCount > 0 ? `${taskCount} Tasks Due Today` : 'No Events Today'}
                </span>
                <span className="text-emerald-400">Schedule</span>
            </div>
        </div>
    )
}
