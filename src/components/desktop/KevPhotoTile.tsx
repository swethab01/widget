interface KevPhotoTileProps {
    className?: string
}

export function KevPhotoTile({ className = '' }: KevPhotoTileProps) {
    return (
        <div
            className={`w-36 h-36 rounded-[24px] overflow-hidden shadow-2xl relative border border-white/20 select-none bg-[#b91c1c] flex flex-col justify-end p-3 group ${className}`}
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-red-800 via-rose-700 to-amber-600 opacity-90" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-4xl">📸</span>
            </div>
            <div className="relative z-10 bg-black/50 backdrop-blur-md rounded-xl p-1.5 border border-white/20 text-center">
                <span className="text-[10px] font-mono text-white font-bold tracking-tight">
                    Sweet Recipe
                </span>
            </div>
        </div>
    )
}
