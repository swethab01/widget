import { useState } from 'react'
import { Card } from './ui/Card'
import { ProgressBar } from './ui/ProgressBar'
import { formatTimer } from '../utils/time'
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

    const handleStart = () => {
        const dur = showCustom ? parseInt(customDuration) || 25 : selectedDuration
        onStart(null, dur)
    }

    if (isComplete) {
        return (
            <Card className="animate-fade-in flex flex-col items-center justify-center py-4">
                <div className="text-2xl mb-1">🎉</div>
                <div className="text-xs font-semibold text-accent-green">Session Complete!</div>
                <div className="text-[10px] text-text-muted mt-0.5">Great work. Take a short break.</div>
            </Card>
        )
    }

    if (focusState) {
        return (
            <Card className="animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm">🎯</span>
                        <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Focus</span>
                    </div>
                    <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded-md">
                        {focusState.paused ? 'Paused' : 'Active'}
                    </span>
                </div>

                {/* Task label */}
                <div className="text-[11px] text-text-secondary mb-2 truncate">
                    {focusState.taskTitle}
                </div>

                {/* Timer display */}
                <div className="text-center mb-3">
                    <div className="text-3xl font-mono font-bold text-text-primary tracking-tight">
                        {formatTimer(focusState.remainingSeconds)}
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">
                        {focusState.durationMinutes}min session
                    </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                    <ProgressBar value={progress * 100} color="bg-accent" height="h-1.5" animate />
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                    {focusState.paused ? (
                        <button
                            onClick={onResume}
                            className="flex-1 py-1.5 bg-accent rounded-lg text-white text-xs font-medium hover:bg-blue-500 transition-colors"
                        >
                            ▶ Resume
                        </button>
                    ) : (
                        <button
                            onClick={onPause}
                            className="flex-1 py-1.5 bg-surface-hover border border-surface-border rounded-lg text-text-secondary text-xs hover:text-text-primary transition-colors"
                        >
                            ⏸ Pause
                        </button>
                    )}
                    <button
                        onClick={onStop}
                        className="px-3 py-1.5 bg-surface-hover border border-surface-border rounded-lg text-text-muted text-xs hover:text-red-400 transition-colors"
                    >
                        ■ Stop
                    </button>
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm">⏱</span>
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Focus</span>
                </div>
                {sessions > 0 && (
                    <span className="text-[10px] text-text-muted">
                        {sessions} session{sessions !== 1 ? 's' : ''} today
                    </span>
                )}
            </div>

            {/* Duration picker */}
            <div className="flex gap-1.5 mb-3">
                {DURATIONS.map((d) => (
                    <button
                        key={d}
                        onClick={() => { setSelectedDuration(d); setShowCustom(false) }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-colors ${!showCustom && selectedDuration === d
                                ? 'bg-accent text-white'
                                : 'bg-surface-hover text-text-secondary hover:bg-surface-border'
                            }`}
                    >
                        {d}m
                    </button>
                ))}
                <button
                    onClick={() => setShowCustom(!showCustom)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${showCustom ? 'bg-accent text-white' : 'bg-surface-hover text-text-secondary hover:bg-surface-border'
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
                        className="flex-1 bg-surface-hover border border-surface-border rounded-lg px-2 py-1.5 text-xs text-text-primary outline-none font-mono"
                    />
                    <span className="text-xs text-text-muted">min</span>
                </div>
            )}

            <button
                onClick={handleStart}
                className="w-full py-2 bg-accent rounded-lg text-white text-xs font-semibold hover:bg-blue-500 active:scale-95 transition-all"
            >
                ▶ Start Focus Session
            </button>

            <div className="mt-2 text-[10px] text-text-muted text-center">
                Deep work. No distractions.
            </div>
        </Card>
    )
}
