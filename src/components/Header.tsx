import { useState } from 'react'
import { getGreeting, formatDate } from '../utils/time'
import type { WidgetMode } from '../types'

interface HeaderProps {
    username: string
    score: number
    mode: WidgetMode
    onModeChange: (mode: WidgetMode) => void
    onNav: (page: string) => void
    currentPage: string
}

export function Header({ username, score, mode, onModeChange, onNav, currentPage }: HeaderProps) {
    const [alwaysOnTop, setAlwaysOnTop] = useState(false)

    const handleMinimize = () => window.electronAPI.window.minimize()
    const handleClose = () => window.electronAPI.window.hide()
    const handleAlwaysOnTop = () => {
        const next = !alwaysOnTop
        setAlwaysOnTop(next)
        window.electronAPI.window.setAlwaysOnTop(next)
    }

    const scoreColor =
        score >= 80 ? 'text-accent-green' : score >= 60 ? 'text-yellow-400' : 'text-red-400'

    return (
        <div className="flex flex-col select-none" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
            {/* Title bar drag region */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
                {/* Left: Logo + greeting */}
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
                        <span className="text-white text-xs font-bold">D</span>
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-text-primary leading-tight">{getGreeting(username)}</div>
                        <div className="text-[10px] text-text-muted">{formatDate()}</div>
                    </div>
                </div>

                {/* Right: score + controls */}
                <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                    <div className={`text-sm font-mono font-bold ${scoreColor}`}>
                        {score}<span className="text-xs text-text-muted">/100</span>
                    </div>

                    {/* Mode switcher */}
                    <div className="flex items-center bg-surface-border rounded-md overflow-hidden text-[10px]">
                        {(['compact', 'normal', 'expanded'] as WidgetMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => onModeChange(m)}
                                className={`px-1.5 py-0.5 transition-colors ${mode === m ? 'bg-accent text-white' : 'text-text-muted hover:text-text-secondary'}`}
                            >
                                {m[0].toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Pin */}
                    <button
                        onClick={handleAlwaysOnTop}
                        className={`text-xs transition-colors ${alwaysOnTop ? 'text-accent' : 'text-text-muted hover:text-text-secondary'}`}
                        title="Always on top"
                    >
                        📌
                    </button>

                    {/* Window controls */}
                    <button onClick={handleMinimize} className="text-text-muted hover:text-text-secondary text-xs">─</button>
                    <button onClick={handleClose} className="text-text-muted hover:text-red-400 text-xs">✕</button>
                </div>
            </div>

            {/* Navigation tabs */}
            <div
                className="flex items-center gap-1 px-3 pb-1 border-b border-surface-border"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
                {[
                    { id: 'dashboard', label: '🏠 Today' },
                    { id: 'scratchpad', label: '📝 Notes' },
                    { id: 'analytics', label: '📊 Stats' },
                    { id: 'settings', label: '⚙️ Settings' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onNav(tab.id)}
                        className={`px-2 py-1 text-[11px] rounded-md transition-colors ${currentPage === tab.id
                                ? 'bg-accent/20 text-accent'
                                : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
