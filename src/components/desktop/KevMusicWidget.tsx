import { useState } from 'react'

interface KevMusicWidgetProps {
    className?: string
}

export function KevMusicWidget({ className = '' }: KevMusicWidgetProps) {
    const [isPlaying, setIsPlaying] = useState(false)

    return (
        <div
            className={`w-76 h-36 bg-[#eae6de] text-neutral-900 rounded-[24px] p-3.5 shadow-2xl flex flex-col justify-between select-none relative overflow-hidden ${className}`}
        >
            <div className="flex items-start gap-3">
                {/* Album Cover (Handwritten Note Aesthetic) */}
                <div className="w-16 h-16 rounded-xl bg-[#dfd9ce] border border-neutral-300 shadow-sm p-1.5 flex flex-col justify-between shrink-0 overflow-hidden">
                    <span className="text-[7px] font-mono text-neutral-500 uppercase tracking-tighter">
                        Spider-Verse
                    </span>
                    <div className="text-[7px] font-sans text-neutral-800 leading-tight italic font-serif">
                        "I made a song for a superhero movie..."
                    </div>
                    <span className="text-[6px] font-mono text-neutral-400">Dominic Fike</span>
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                            NOW PLAYING
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <h4 className="text-sm font-extrabold text-neutral-900 truncate mt-0.5">
                        Mona Lisa
                    </h4>
                    <p className="text-[11px] text-neutral-600 truncate">
                        Spider-Man: Across the Spider-Verse
                    </p>
                    <p className="text-[11px] font-bold text-neutral-800 mt-0.5">
                        Dominic Fike
                    </p>
                </div>
            </div>

            {/* Audio Timeline & Controls */}
            <div className="pt-1">
                <div className="w-full bg-neutral-300 h-1 rounded-full overflow-hidden mb-2">
                    <div className="bg-neutral-800 h-full w-2/5 rounded-full" />
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-700">
                    <button
                        onClick={() => setIsPlaying((p) => !p)}
                        className="flex items-center gap-1 font-bold text-neutral-900 hover:text-black cursor-pointer"
                    >
                        <span>{isPlaying ? '⏸' : '▶'}</span>
                        <span className="text-[10px]">{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>

                    <span className="text-[10px] font-mono text-neutral-500">1:14 / 3:06</span>

                    <span className="text-[10px] font-mono text-neutral-600">Vinyl Hi-Fi</span>
                </div>
            </div>
        </div>
    )
}
