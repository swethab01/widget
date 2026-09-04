import { useState } from 'react'

interface InspirationalQuoteWidgetProps {
    className?: string
}

interface Quote {
    text: string
    author: string
}

const QUOTES: Quote[] = [
    { text: 'AND IF NOT, HE IS STILL GOOD.', author: 'DANIEL 3:18' },
    { text: 'FIRST SOLVE THE PROBLEM. THEN WRITE THE CODE.', author: 'JOHN JOHNSON' },
    { text: 'SIMPLICITY IS PREREQUISITE FOR RELIABILITY.', author: 'EDSKER DIJKSTRA' },
    { text: 'MAKE IT WORK, MAKE IT RIGHT, MAKE IT FAST.', author: 'KENT BECK' },
    { text: 'TALK IS CHEAP. SHOW ME THE CODE.', author: 'LINUS TORVALDS' },
]

export function InspirationalQuoteWidget({ className = '' }: InspirationalQuoteWidgetProps) {
    const [index, setIndex] = useState(0)

    const handleNextQuote = () => {
        setIndex((prev) => (prev + 1) % QUOTES.length)
    }

    const current = QUOTES[index]

    return (
        <div
            onClick={handleNextQuote}
            className={`mac-widget-tile p-4 cursor-pointer hover:border-white/20 transition-all select-none flex flex-col justify-between group ${className}`}
            title="Click to refresh quote"
        >
            {/* Header */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-white/50 mb-2">
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mac-pulse-dot" />
                    <span className="font-semibold text-white/70">MANTRA</span>
                </div>
                <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">
                    REFRESH ↻
                </span>
            </div>

            {/* Quote Body */}
            <div className="py-2">
                <p className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug">
                    "{current.text}"
                </p>
            </div>

            {/* Author Footer */}
            <div className="mt-2 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-white/40">
                <span className="tracking-wider">{current.author}</span>
                <span className="text-amber-400/80">DAILY INSPIRATION</span>
            </div>
        </div>
    )
}
