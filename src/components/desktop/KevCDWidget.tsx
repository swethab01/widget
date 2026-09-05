import { useState } from 'react'

interface KevCDWidgetProps {
    className?: string
}

export function KevCDWidget({ className = '' }: KevCDWidgetProps) {
    const [isSpinning, setIsSpinning] = useState(true)

    return (
        <div
            onClick={() => setIsSpinning((s) => !s)}
            className={`w-36 h-36 bg-white/[0.07] backdrop-blur-xl border border-white/25 rounded-[22px] p-2 shadow-2xl relative overflow-hidden flex items-center justify-center cursor-pointer select-none group ${className}`}
            title="Click to toggle disc spin"
        >
            {/* Jewel Case Plastic Hinge on Left */}
            <div className="absolute left-1.5 top-2 bottom-2 w-1.5 bg-white/20 rounded-full border-r border-black/30 pointer-events-none" />

            {/* Subtle Diagonal Glass Sheen */}
            <div className="absolute -top-12 -left-12 w-48 h-24 bg-gradient-to-b from-white/20 to-transparent rotate-45 pointer-events-none" />

            {/* Red Spider-Man Web Disc */}
            <div
                className={`w-28 h-28 rounded-full bg-gradient-to-tr from-rose-800 via-red-600 to-rose-700 shadow-xl border-2 border-white/30 relative flex items-center justify-center transition-transform ${
                    isSpinning ? 'animate-vinyl-spin' : ''
                }`}
            >
                {/* Spider-Web Pattern Lines */}
                <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff" strokeWidth="0.8" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#ffffff" strokeWidth="0.8" />
                    <circle cx="50" cy="50" r="18" fill="none" stroke="#ffffff" strokeWidth="0.8" />
                    <line x1="50" y1="8" x2="50" y2="92" stroke="#ffffff" strokeWidth="0.8" />
                    <line x1="8" y1="50" x2="92" y2="50" stroke="#ffffff" strokeWidth="0.8" />
                    <line x1="20" y1="20" x2="80" y2="80" stroke="#ffffff" strokeWidth="0.8" />
                    <line x1="20" y1="80" x2="80" y2="20" stroke="#ffffff" strokeWidth="0.8" />
                </svg>

                {/* Disc Center Spindle Hole */}
                <div className="w-8 h-8 rounded-full bg-neutral-900 border border-white/40 flex items-center justify-center shadow-inner">
                    <div className="w-3 h-3 rounded-full bg-black border border-white/60" />
                </div>
            </div>
        </div>
    )
}
