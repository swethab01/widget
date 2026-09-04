import { useState, useRef, useEffect } from 'react'

interface VinylPlayerWidgetProps {
    className?: string
}

interface Track {
    title: string
    artist: string
    album: string
    duration: number // in seconds
    coverColor: string
    vinylColor: string
}

const TRACKS: Track[] = [
    {
        title: 'Mona Lisa',
        artist: 'Dominic Fike',
        album: 'Spider-Man: Across the Spider-Verse',
        duration: 186,
        coverColor: 'from-red-600 via-rose-700 to-black',
        vinylColor: '#e11d48',
    },
    {
        title: 'After Hours',
        artist: 'The Weeknd',
        album: 'After Hours (Deluxe Edition)',
        duration: 220,
        coverColor: 'from-amber-600 via-red-900 to-black',
        vinylColor: '#d97706',
    },
    {
        title: '40Hz Gamma Flow',
        artist: 'DevPulse Soundscapes',
        album: 'Deep Work Binaural',
        duration: 300,
        coverColor: 'from-cyan-600 via-blue-900 to-slate-950',
        vinylColor: '#0ea5e9',
    },
]

export function VinylPlayerWidget({ className = '' }: VinylPlayerWidgetProps) {
    const [trackIndex, setTrackIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progressSeconds, setProgressSeconds] = useState(42)
    const audioContextRef = useRef<AudioContext | null>(null)
    const oscillatorRef = useRef<OscillatorNode | null>(null)
    const gainRef = useRef<GainNode | null>(null)

    const track = TRACKS[trackIndex]

    // Web Audio synthesizer for ambient sound when playing
    useEffect(() => {
        if (isPlaying) {
            try {
                const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
                const ctx = new AudioCtx()
                audioContextRef.current = ctx

                // Soft soothing ambient drone
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = 'sine'
                osc.frequency.setValueAtTime(216, ctx.currentTime) // Harmonic A
                gain.gain.setValueAtTime(0.02, ctx.currentTime) // Soft volume

                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start()
                oscillatorRef.current = osc
                gainRef.current = gain
            } catch {
                // Ignore audio context errors
            }
        } else {
            if (oscillatorRef.current) {
                try {
                    oscillatorRef.current.stop()
                    oscillatorRef.current.disconnect()
                } catch {
                    // Ignore
                }
                oscillatorRef.current = null
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close()
            }
        }

        return () => {
            if (oscillatorRef.current) {
                try {
                    oscillatorRef.current.stop()
                } catch {
                    // Ignore
                }
            }
        }
    }, [isPlaying])

    // Progress ticker
    useEffect(() => {
        if (!isPlaying) return
        const timer = setInterval(() => {
            setProgressSeconds((prev) => (prev >= track.duration ? 0 : prev + 1))
        }, 1000)
        return () => clearInterval(timer)
    }, [isPlaying, track.duration])

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60)
        const s = secs % 60
        return `${m}:${String(s).padStart(2, '0')}`
    }

    const handleNextTrack = (e: React.MouseEvent) => {
        e.stopPropagation()
        setTrackIndex((prev) => (prev + 1) % TRACKS.length)
        setProgressSeconds(0)
    }

    const handlePrevTrack = (e: React.MouseEvent) => {
        e.stopPropagation()
        setTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length)
        setProgressSeconds(0)
    }

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsPlaying((prev) => !prev)
    }

    return (
        <div className={`mac-widget-tile p-4 flex flex-col justify-between select-none ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-white/50 mb-2">
                <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-rose-400 mac-pulse-dot' : 'bg-white/30'}`} />
                    <span className="font-semibold text-white/70">NOW PLAYING</span>
                </div>
                <span className="text-[10px] text-white/40">VINYL HIFI</span>
            </div>

            {/* Middle Section: Spinning Vinyl Disc + Album Art */}
            <div className="flex items-center gap-3.5 py-1">
                {/* Vinyl Record & Sleeve Container */}
                <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                    {/* Spinning Vinyl Record Disc */}
                    <div
                        className={`absolute w-16 h-16 rounded-full bg-neutral-900 border-2 border-neutral-700 shadow-xl flex items-center justify-center overflow-hidden transition-all ${
                            isPlaying ? 'animate-vinyl-spin' : 'animate-vinyl-paused'
                        }`}
                        style={{
                            backgroundImage: `radial-gradient(circle, #1a1a1a 25%, #2a2a2a 26%, #1a1a1a 45%, #2a2a2a 46%, #1a1a1a 65%, #111 100%)`,
                        }}
                    >
                        {/* Center Vinyl Label */}
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center border border-white/20 shadow-sm"
                            style={{ backgroundColor: track.vinylColor }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-white/40" />
                        </div>
                    </div>
                </div>

                {/* Track Details */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white tracking-tight truncate">
                        {track.title}
                    </h4>
                    <p className="text-[11px] text-white/70 truncate">{track.artist}</p>
                    <p className="text-[9px] text-white/40 font-mono truncate mt-0.5">{track.album}</p>
                </div>
            </div>

            {/* Scrub Progress Bar */}
            <div className="mt-2 space-y-1">
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${(progressSeconds / track.duration) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-white/40">
                    <span>{formatTime(progressSeconds)}</span>
                    <span>{formatTime(track.duration)}</span>
                </div>
            </div>

            {/* Playback Controls Footer */}
            <div className="mt-2 pt-2 border-t border-white/[0.08] flex items-center justify-center gap-5">
                <button
                    onClick={handlePrevTrack}
                    className="text-white/60 hover:text-white transition-colors text-sm hover:scale-110 active:scale-95"
                    title="Previous Track"
                >
                    ⏮
                </button>
                <button
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white text-xs transition-all hover:scale-105 active:scale-95 shadow-md"
                    title={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? '⏸' : '▶'}
                </button>
                <button
                    onClick={handleNextTrack}
                    className="text-white/60 hover:text-white transition-colors text-sm hover:scale-110 active:scale-95"
                    title="Next Track"
                >
                    ⏭
                </button>
            </div>
        </div>
    )
}
