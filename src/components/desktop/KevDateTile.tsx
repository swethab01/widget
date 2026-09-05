interface KevDateTileProps {
    className?: string
}

export function KevDateTile({ className = '' }: KevDateTileProps) {
    return (
        <div
            className={`w-36 h-36 rounded-[24px] overflow-hidden shadow-2xl relative border border-white/20 select-none bg-black flex flex-col justify-between p-3 group ${className}`}
        >
            <img
                src="/spiderman-comic.jpg"
                alt="Spider-Man"
                className="absolute inset-0 w-full h-full object-cover object-top opacity-60 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 pointer-events-none" />

            <div className="relative z-10">
                <div className="text-lime-400 font-black text-xs uppercase tracking-wider font-mono">
                    WEDNESDAY
                </div>
                <div className="text-lime-400 font-extrabold text-sm uppercase tracking-tight">
                    MARCH 25
                </div>
            </div>

            <div className="relative z-10 flex justify-end">
                <span className="text-[9px] font-mono text-white/60 bg-black/40 px-1.5 py-0.5 rounded-full border border-white/20">
                    🕷️ Spidey
                </span>
            </div>
        </div>
    )
}
