import { useState, useEffect } from 'react'
import { Card } from './ui/Card'
import { formatTimer } from '../utils/time'
import { useAmbientSound, SoundType } from '../hooks/useAmbientSound'
import type { FocusState } from '../types'

const DURATIONS = [25, 50, 90]

interface FocusWidgetProps {
    focusState: FocusState | null
    sessions: number
    isComplete: boolean
    progress: number
    onStart: (taskId: number | null, minutes: number) => Promise<void>
    onPause: () => Promise<void>
    onResume: () => Promise<void>
    onStop: () => Promise<void>
}

export function FocusWidget({
    focusState,
    sessions,
    isComplete,
    progress,
    onStart,
    onPause,
    onResume,
    onStop,
}: FocusWidgetProps) {
    const [selectedDuration, setSelectedDuration] = useState(25)
    const [customDuration, setCustomDuration] = useState('')
    const [showCustom, setShowCustom] = useState(false)
    const [showSoundMenu, setShowSoundMenu] = useState(false)

    // Park Thought state
    const [showParkThought, setShowParkThought] = useState(false)
    const [parkedText, setParkedText] = useState('')
    const [parkedSuccess, setParkedSuccess] = useState(false)

    const { soundType, volume, setSoundType, setVolume, playCompletionChime } = useAmbientSound()

    // Play completion chime when session finishes
    useEffect(() => {
        if (isComplete) {
            playCompletionChime()
        }
    }, [isComplete, playCompletionChime])

    const handleStart = () => {
        const dur = showCustom ? parseInt(customDuration) || 25 : selectedDuration
        onStart(null, dur)
    }

    const handleStopSession = async () => {
        setSoundType('off')
        await onStop()
    }

    const handleParkThoughtSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!parkedText.trim()) return

        try {
            if (window.electronAPI?.scratchpad) {
                const current = await window.electronAPI.scratchpad.get()
                const updated = (current?.content || '') + `\n- [ ] 💭 ${parkedText.trim()}`
                await window.electronAPI.scratchpad.save(updated)
                setParkedText('')
                setParkedSuccess(true)
                setTimeout(() => {
                    setParkedSuccess(false)
                    setShowParkThought(false)
                }, 1200)
            }
        } catch {
            // ignore
        }
    }

    if (isComplete) {
        return (
            <Card className="animate-fade-in flex flex-col items-center justify-center py-6 bg-emerald-950/20 border-emerald-500/30">
                <div className="text-3xl mb-1.5 animate-bounce">🎉</div>
                <div className="text-sm font-semibold text-emerald-400 tracking-tight">Session Complete</div>
                <div className="text-[11px] text-white/50 mt-0.5 font-medium">Focus block recorded to Activity Rings</div>
            </Card>
        )
    }

    if (focusState) {
        // macOS circular timer radius: r = 44 => circumference = 276.4
        const circumference = 276.4
        const strokeDashoffset = circumference - progress * circumference

        return (
            <Card className="animate-fade-in relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white/90 tracking-tight uppercase">
                            Focus Timer
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-mono border border-blue-500/25">
                            {focusState.paused ? 'Paused' : 'Active'}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Park Thought button */}
                        <button
                            onClick={() => setShowParkThought(!showParkThought)}
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                                showParkThought
                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                    : 'bg-white/[0.05] border-white/[0.08] text-white/50 hover:text-white/80'
                            }`}
                            title="Park a distracting thought into Scratchpad"
                        >
                            <span>💭</span>
                            <span>Park</span>
                        </button>

                        {/* Sound Picker Pill */}
                        <button
                            onClick={() => setShowSoundMenu(!showSoundMenu)}
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 cursor-pointer font-medium ${
                                soundType !== 'off'
                                    ? 'bg-blue-600/30 border-blue-500/40 text-blue-300'
                                    : 'bg-white/[0.05] border-white/[0.08] text-white/50 hover:text-white/80'
                            }`}
                        >
                            <span>🎧</span>
                            <span>{soundType === 'off' ? 'Sound' : soundType.toUpperCase()}</span>
                        </button>
                    </div>
                </div>

                {/* Park Thought Quick Input Popover */}
                {showParkThought && (
                    <form onSubmit={handleParkThoughtSubmit} className="mb-2 p-2 rounded-xl bg-amber-950/30 border border-amber-500/30 animate-slide-up">
                        <div className="flex items-center justify-between text-[10px] text-amber-300/80 mb-1">
                            <span>Park an intrusive thought (saved to Notes):</span>
                            {parkedSuccess && <span className="text-emerald-400 font-semibold">✓ Saved!</span>}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <input
                                autoFocus
                                type="text"
                                placeholder="e.g. Check server logs later..."
                                value={parkedText}
                                onChange={(e) => setParkedText(e.target.value)}
                                className="flex-1 bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder-white/40 outline-none"
                            />
                            <button
                                type="submit"
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                                Park
                            </button>
                        </div>
                    </form>
                )}

                {/* Sound menu */}
                {showSoundMenu && (
                    <div className="mb-2.5 p-2 rounded-xl bg-white/[0.06] border border-white/[0.08] animate-slide-up text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-white/60">
                            <span>Deep Work Audio Synthesis</span>
                            <span className="font-mono">{Math.round(volume * 100)}%</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                            {[
                                { id: 'off' as SoundType, label: 'Mute' },
                                { id: 'binaural' as SoundType, label: '40Hz' },
                                { id: 'brown' as SoundType, label: 'Brown' },
                                { id: 'rain' as SoundType, label: 'Rain' },
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setSoundType(s.id)}
                                    className={`py-1 text-[10px] rounded-lg font-medium transition-all cursor-pointer ${
                                        soundType === s.id
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-white/[0.04] text-white/60 hover:text-white'
                                    }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                        {soundType !== 'off' && (
                            <input
                                type="range"
                                min="0.05"
                                max="0.7"
                                step="0.02"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        )}
                    </div>
                )}

                {/* macOS Circular Timer Center */}
                <div className="flex flex-col items-center justify-center my-2">
                    <div className="relative flex items-center justify-center w-28 h-28">
                        <svg className="w-28 h-28 -rotate-90 transform" viewBox="0 0 100 100">
                            {/* Track background */}
                            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="6" />
                            {/* Progress Arc */}
                            <circle
                                cx="50"
                                cy="50"
                                r="44"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                            />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-mono font-bold text-white tracking-tight">
                                {formatTimer(focusState.remainingSeconds)}
                            </span>
                            <span className="text-[9px] text-white/40 font-mono mt-0.5">
                                {focusState.durationMinutes}m block
                            </span>
                        </div>
                    </div>

                    {/* Task Title label */}
                    <div className="text-[11px] text-white/70 font-medium truncate max-w-xs text-center mt-1">
                        {focusState.taskTitle}
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="flex items-center gap-2 mt-2">
                    {focusState.paused ? (
                        <button
                            onClick={onResume}
                            className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                        >
                            ▶ Resume
                        </button>
                    ) : (
                        <button
                            onClick={onPause}
                            className="flex-1 py-1.5 bg-white/[0.08] hover:bg-white/[0.14] text-white/80 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        >
                            ⏸ Pause
                        </button>
                    )}
                    <button
                        onClick={handleStopSession}
                        className="px-3 py-1.5 bg-white/[0.05] hover:bg-rose-500/20 text-white/40 hover:text-rose-400 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                        ■ End
                    </button>
                </div>
            </Card>
        )
    }

    return (
        <Card className="relative overflow-hidden">
            {/* macOS Widget Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/90 tracking-tight uppercase">
                        Focus Timer
                    </span>
                    {sessions > 0 && (
                        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.2 rounded-full">
                            {sessions} done
                        </span>
                    )}
                </div>

                <button
                    onClick={() => setShowSoundMenu(!showSoundMenu)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 cursor-pointer font-medium ${
                        soundType !== 'off'
                            ? 'bg-blue-600/30 border-blue-500/40 text-blue-300'
                            : 'bg-white/[0.05] border-white/[0.08] text-white/50 hover:text-white/80'
                    }`}
                >
                    <span>🎧</span>
                    <span>{soundType === 'off' ? 'Sound' : soundType.toUpperCase()}</span>
                </button>
            </div>

            {/* Sound Dropdown Menu */}
            {showSoundMenu && (
                <div className="mb-3 p-2 rounded-xl bg-white/[0.06] border border-white/[0.08] animate-slide-up text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-white/60">
                        <span>Deep Work Audio Synthesis</span>
                        <span className="font-mono">{Math.round(volume * 100)}%</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                        {[
                            { id: 'off' as SoundType, label: 'Mute' },
                            { id: 'binaural' as SoundType, label: '40Hz' },
                            { id: 'brown' as SoundType, label: 'Brown' },
                            { id: 'rain' as SoundType, label: 'Rain' },
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setSoundType(s.id)}
                                className={`py-1 text-[10px] rounded-lg font-medium transition-all cursor-pointer ${
                                    soundType === s.id
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white/[0.04] text-white/60 hover:text-white'
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                    {soundType !== 'off' && (
                        <input
                            type="range"
                            min="0.05"
                            max="0.7"
                            step="0.02"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    )}
                </div>
            )}

            {/* macOS Segmented Duration Picker */}
            <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-3 gap-1">
                {DURATIONS.map((d) => (
                    <button
                        key={d}
                        onClick={() => {
                            setSelectedDuration(d)
                            setShowCustom(false)
                        }}
                        className={`flex-1 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                            !showCustom && selectedDuration === d
                                ? 'bg-white/15 text-white shadow-sm font-semibold'
                                : 'text-white/50 hover:text-white/80'
                        }`}
                    >
                        {d}m
                    </button>
                ))}
                <button
                    onClick={() => setShowCustom(!showCustom)}
                    className={`px-2 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                        showCustom ? 'bg-white/15 text-white font-semibold' : 'text-white/50 hover:text-white/80'
                    }`}
                >
                    …
                </button>
            </div>

            {showCustom && (
                <div className="flex items-center gap-2 mb-3 animate-slide-up">
                    <input
                        autoFocus
                        type="number"
                        placeholder="Minutes"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        min={1}
                        max={240}
                        className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-xs text-white outline-none font-mono"
                    />
                    <span className="text-xs text-white/40 font-mono">min</span>
                </div>
            )}

            {/* Start Button (macOS Vibrant Gradient) */}
            <button
                onClick={handleStart}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
                ▶ Start Focus Session
            </button>
        </Card>
    )
}
