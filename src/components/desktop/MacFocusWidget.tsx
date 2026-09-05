import { useFocus } from '../../hooks/useFocus'
import { useAmbientSound } from '../../hooks/useAmbientSound'
import { formatTimer } from '../../utils/time'

interface MacFocusWidgetProps {
    className?: string
}

export function MacFocusWidget({ className = '' }: MacFocusWidgetProps) {
    const focus = useFocus()
    const ambient = useAmbientSound()

    const isRunning = !!focus.focusState
    const isPaused = focus.focusState?.paused ?? false
    const remainingSeconds = focus.focusState?.remainingSeconds ?? 25 * 60
    const totalSeconds = (focus.focusState?.durationMinutes ?? 25) * 60
    const taskTitle = focus.focusState?.taskTitle || 'Deep Work Sprint'

    // Circular progress
    const radius = 34
    const circumference = 2 * Math.PI * radius
    const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0
    const strokeDashoffset = circumference - progress * circumference

    const handleTogglePlay = () => {
        if (!isRunning) {
            focus.start(null, 25)
        } else if (isPaused) {
            focus.resume()
        } else {
            focus.pause()
        }
    }

    return (
        <div
            className={`mac-widget-tile p-4 flex flex-col justify-between select-none ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-white/50 mb-1">
                <div className="flex items-center gap-1.5">
                    <span
                        className={`w-2 h-2 rounded-full ${
                            isRunning && !isPaused
                                ? 'bg-cyan-400 mac-pulse-dot shadow-sm shadow-cyan-400/50'
                                : isPaused
                                ? 'bg-amber-400'
                                : 'bg-white/30'
                        }`}
                    />
                    <span className="font-semibold text-white/80">POMODORO FOCUS</span>
                </div>
                <span className="text-[10px] text-cyan-400 font-semibold">
                    {isRunning ? (isPaused ? 'PAUSED' : 'ACTIVE') : 'READY'}
                </span>
            </div>

            {/* Timer Center with Ring */}
            <div className="flex items-center justify-around py-1">
                {/* SVG Progress Ring */}
                <div className="relative flex items-center justify-center">
                    <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 84 84">
                        <circle
                            cx="42"
                            cy="42"
                            r={radius}
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.08)"
                            strokeWidth="6"
                        />
                        <circle
                            cx="42"
                            cy="42"
                            r={radius}
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-mono font-extrabold text-white tracking-tight">
                            {formatTimer(remainingSeconds)}
                        </span>
                        <span className="text-[9px] font-mono text-cyan-400 font-medium">
                            {isRunning ? `${Math.round(progress * 100)}%` : '25m'}
                        </span>
                    </div>
                </div>

                {/* Right controls */}
                <div className="flex flex-col items-start gap-1.5 pl-2">
                    <span className="text-xs font-semibold text-white/90 line-clamp-1 max-w-[120px]">
                        {taskTitle}
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 mt-1">
                        <button
                            onClick={handleTogglePlay}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold shadow-md transition-all cursor-pointer flex items-center gap-1 ${
                                isRunning && !isPaused
                                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                                    : 'bg-cyan-500 hover:bg-cyan-400 text-black'
                            }`}
                        >
                            <span>{isRunning && !isPaused ? '⏸ Pause' : '▶ Start'}</span>
                        </button>

                        {isRunning && (
                            <button
                                onClick={focus.stop}
                                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-rose-500/30 text-white/70 hover:text-rose-300 text-[11px] transition-colors cursor-pointer"
                                title="Reset Session"
                            >
                                ⏹
                            </button>
                        )}
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-1 mt-1 text-[9px] font-mono text-white/50">
                        <button
                            onClick={() => focus.start(null, 15)}
                            className="px-1.5 py-0.5 rounded bg-white/[0.06] hover:bg-white/15 text-white/70 hover:text-white"
                        >
                            15m
                        </button>
                        <button
                            onClick={() => focus.start(null, 25)}
                            className="px-1.5 py-0.5 rounded bg-white/[0.06] hover:bg-white/15 text-white/70 hover:text-white"
                        >
                            25m
                        </button>
                        <button
                            onClick={() => focus.start(null, 45)}
                            className="px-1.5 py-0.5 rounded bg-white/[0.06] hover:bg-white/15 text-white/70 hover:text-white"
                        >
                            45m
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer: Ambient Sound Toggle */}
            <div className="mt-1 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono">
                <button
                    onClick={() =>
                        ambient.setSoundType(ambient.soundType === 'off' ? 'binaural' : 'off')
                    }
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                        ambient.soundType !== 'off'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'text-white/40 hover:text-white/70'
                    }`}
                >
                    <span>{ambient.soundType !== 'off' ? '🔊' : '🔇'}</span>
                    <span>{ambient.soundType !== 'off' ? '40Hz Binaural' : 'Ambient Sound'}</span>
                </button>

                <span className="text-white/40">
                    {focus.sessions} Sprints Today
                </span>
            </div>
        </div>
    )
}
