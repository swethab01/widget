import { useState, useEffect } from 'react'

interface KevDateTileProps {
    className?: string
}

export function KevDateTile({ className = '' }: KevDateTileProps) {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
    const monthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase()

    return (
        <div
            className={`w-36 h-36 rounded-[24px] overflow-hidden shadow-2xl relative border border-white/20 select-none bg-black flex flex-col justify-between p-3.5 group ${className}`}
        >
            <img
                src="/spiderman-comic.jpg"
                alt="Spider-Man"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-70 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50 pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-center h-full">
                <span className="text-[#a3e635] font-black text-[13px] tracking-wider font-mono uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {weekday}
                </span>
                <span className="text-white font-black text-base tracking-tight uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight mt-0.5">
                    {monthDay}
                </span>
            </div>
        </div>
    )
}
