interface KevBatteryWidgetProps {
    className?: string
}

export function KevBatteryWidget({ className = '' }: KevBatteryWidgetProps) {
    const radius = 22
    const circumference = 2 * Math.PI * radius
    const percentage = 94
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div
            className={`w-36 h-[308px] bg-[#18191d]/95 border border-white/10 rounded-[24px] p-3 shadow-2xl flex flex-col items-center justify-between select-none ${className}`}
        >
            {/* Ring 1: Active Mac Battery */}
            <div className="flex items-center justify-center gap-2 relative w-full pt-1">
                <span className="text-[11px] font-mono font-bold text-white/70">94%</span>
                <div className="relative flex items-center justify-center">
                    <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 54 54">
                        <circle
                            cx="27"
                            cy="27"
                            r={radius}
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="4"
                        />
                        <circle
                            cx="27"
                            cy="27"
                            r={radius}
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                            <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm-2 13h20v2H2v-2z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Ring 2: Empty Accessory Ring */}
            <div className="w-14 h-14 rounded-full border-2 border-neutral-700/60 flex items-center justify-center" />

            {/* Ring 3: Empty Accessory Ring */}
            <div className="w-14 h-14 rounded-full border-2 border-neutral-700/60 flex items-center justify-center" />

            {/* Ring 4: Empty Accessory Ring */}
            <div className="w-14 h-14 rounded-full border-2 border-neutral-700/60 flex items-center justify-center mb-1" />
        </div>
    )
}
