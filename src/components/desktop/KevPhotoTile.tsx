// KevPhotoTile — Sweet Recipe / Photo aesthetic tile
// Matches the red-gradient photo card in KevTech screenshot

interface KevPhotoTileProps {
    className?: string
}

export function KevPhotoTile({ className = '' }: KevPhotoTileProps) {
    return (
        <div
            className={`w-36 h-36 rounded-[24px] overflow-hidden shadow-2xl relative border border-white/15 select-none bg-gradient-to-br from-rose-900 via-red-800 to-amber-900 group cursor-pointer ${className}`}
            title="Photo Tile"
        >
            {/* Try to load image, fall back to generated art */}
            <img
                src="/sweet-recipe.jpg"
                alt="Photo Tile"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                }}
            />

            {/* Fallback: Generated aesthetic photo card */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Textured paper background */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-800 via-red-700 to-amber-800" />

                {/* Polaroid-style frame */}
                <div className="absolute inset-3 rounded-[16px] bg-white/10 border border-white/20 flex flex-col items-center justify-center gap-1.5 p-2">
                    {/* Coffee cup icon */}
                    <div className="text-3xl">☕</div>
                    <div className="text-white/90 font-black text-[11px] uppercase tracking-tight text-center leading-tight">
                        Secret Recipe
                    </div>
                    <div className="text-white/60 text-[9px] font-mono tracking-widest">
                        CAFE
                    </div>
                </div>

                {/* Vintage grain texture */}
                <div className="absolute inset-0 opacity-20 mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            {/* Bottom gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Shine highlight */}
            <div className="absolute top-2 left-2 right-2 h-px bg-white/30 rounded-full pointer-events-none" />
        </div>
    )
}
