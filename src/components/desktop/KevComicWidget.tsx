// KevComicWidget — Proper Spider-Man comic art vertical tile
// Matches the 2x4 tall comic poster in KevTech screenshot

interface KevComicWidgetProps {
    className?: string
}

export function KevComicWidget({ className = '' }: KevComicWidgetProps) {
    return (
        <div
            className={`w-36 h-[308px] rounded-[24px] overflow-hidden shadow-2xl relative border border-white/15 select-none bg-gradient-to-b from-red-950 via-red-900 to-black group cursor-pointer ${className}`}
            title="Spider-Man Comic Art"
        >
            {/* Try to load image, fall back to generated art */}
            <img
                src="/spiderman-comic.jpg"
                alt="Spider-Man Comic Art"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                }}
            />

            {/* Fallback: Generated Spider-Man comic art */}
            <div className="absolute inset-0 flex flex-col items-center justify-between p-3 pointer-events-none">
                {/* Top web line art */}
                <svg className="w-full opacity-30" viewBox="0 0 144 60" fill="none">
                    <line x1="72" y1="0" x2="0" y2="60" stroke="white" strokeWidth="0.8" />
                    <line x1="72" y1="0" x2="72" y2="60" stroke="white" strokeWidth="0.8" />
                    <line x1="72" y1="0" x2="144" y2="60" stroke="white" strokeWidth="0.8" />
                    <path d="M20 20 Q72 30 124 20" stroke="white" strokeWidth="0.8" fill="none" />
                    <path d="M8 40 Q72 50 136 40" stroke="white" strokeWidth="0.8" fill="none" />
                </svg>

                {/* Spider-Man Mask Icon */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 relative flex items-center justify-center">
                        {/* Mask face */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-900 border-2 border-red-400/30 shadow-2xl relative overflow-hidden">
                            {/* Eye lenses */}
                            <div className="absolute top-5 left-2 w-6 h-4 bg-white rounded-full transform -rotate-12 shadow-inner" />
                            <div className="absolute top-5 right-2 w-6 h-4 bg-white rounded-full transform rotate-12 shadow-inner" />
                            {/* Web lines on face */}
                            <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 80 80">
                                <line x1="40" y1="0" x2="40" y2="80" stroke="black" strokeWidth="0.7" />
                                <line x1="0" y1="40" x2="80" y2="40" stroke="black" strokeWidth="0.7" />
                                <circle cx="40" cy="40" r="15" fill="none" stroke="black" strokeWidth="0.7" />
                                <circle cx="40" cy="40" r="28" fill="none" stroke="black" strokeWidth="0.7" />
                            </svg>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-white font-black text-sm tracking-tight leading-tight uppercase drop-shadow-lg">
                            Spider-Man
                        </div>
                        <div className="text-red-300 text-[10px] font-bold tracking-widest uppercase mt-0.5">
                            No Way Home
                        </div>
                    </div>
                </div>

                {/* Bottom cityscape silhouette */}
                <svg className="w-full opacity-40" viewBox="0 0 144 40" fill="white">
                    <rect x="0" y="25" width="8" height="15" />
                    <rect x="10" y="18" width="12" height="22" />
                    <rect x="24" y="22" width="6" height="18" />
                    <rect x="32" y="10" width="16" height="30" />
                    <rect x="50" y="20" width="10" height="20" />
                    <rect x="62" y="15" width="20" height="25" />
                    <rect x="84" y="8" width="18" height="32" />
                    <rect x="104" y="20" width="8" height="20" />
                    <rect x="114" y="14" width="14" height="26" />
                    <rect x="130" y="22" width="14" height="18" />
                </svg>
            </div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-red-900/30 via-transparent to-transparent pointer-events-none" />

            {/* Comic-style border highlight */}
            <div className="absolute inset-0 rounded-[24px] ring-inset ring-1 ring-white/10 pointer-events-none" />
        </div>
    )
}
