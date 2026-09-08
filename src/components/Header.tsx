import { useState, useEffect } from 'react'
import type { WidgetMode } from '../types'

interface HeaderProps {
    username: string
    score: number
    mode: WidgetMode
    onModeChange: (mode: WidgetMode) => void
    onNav: (page: string) => void
    currentPage: string
    onOpenSpotlight?: () => void
}

export function Header({
    score,
    mode,
    onModeChange,
    onNav,
    currentPage,
    onOpenSpotlight,
}: HeaderProps) {
    const [alwaysOnTop, setAlwaysOnTop] = useState(false)

    useEffect(() => {
        window.electronAPI.settings.get('alwaysOnTop').then((val) => {
            if (val === 'true') setAlwaysOnTop(true)
        })
    }, [])

    const handleClose = () => window.electronAPI.window.hide()
    const handleMinimize = () => window.electronAPI.window.minimize()
    const handleZoom = () => {
        // macOS Green button toggles normal / expanded cockpit
        const next = mode === 'expanded' ? 'normal' : 'expanded'
        onModeChange(next)
    }

    const handleAlwaysOnTop = () => {
        const next = !alwaysOnTop
        setAlwaysOnTop(next)
        window.electronAPI.window.setAlwaysOnTop(next)
        window.electronAPI.settings.set('alwaysOnTop', String(next))
    }

    const scoreColor =
        score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400'

    return (
        <div
            className="flex flex-col select-none border-b border-white/[0.07] bg-[#12141c]/80 backdrop-blur-3xl z-30"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
            {/* macOS Titlebar */}
            <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
                {/* Left: macOS Traffic Lights */}
                <div
                    className="flex items-center gap-2 mac-traffic-container"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                    <button
                        onClick={handleClose}
                        className="mac-traffic-light traffic-red cursor-pointer shadow-sm active:brightness-75"
                        title="Close / Hide to Tray"
                    >
                        <span>✕</span>
                    </button>
                    <button
                        onClick={handleMinimize}
                        className="mac-traffic-light traffic-yellow cursor-pointer shadow-sm active:brightness-75"
                        title="Minimize"
                    >
                        <span>─</span>
                    </button>
                    <button
                        onClick={handleZoom}
                        className="mac-traffic-light traffic-green cursor-pointer shadow-sm active:brightness-75"
                        title={mode === 'expanded' ? 'Collapse to Sidebar' : 'Expand to Cockpit'}
                    >
                        <span>⤢</span>
                    </button>

                    {/* Window title */}
                    <div className="ml-1.5 flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white/90 tracking-tight">DevPulse</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mac-pulse-dot" title="Live Screen Tracking Active" />
                    </div>
                </div>

                {/* Center: Segmented Pill (macOS style) */}
                <div
                    className="flex items-center mac-segmented-pill"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                    {[
                        { id: 'dashboard', label: 'Today', icon: '✦' },
                        { id: 'scratchpad', label: 'Notes', icon: '✎' },
                        { id: 'analytics', label: 'Stats', icon: '☲' },
                        { id: 'settings', label: 'Settings', icon: '⚙' },
                    ].map((tab) => {
                        const isActive = currentPage === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onNav(tab.id)}
                                className={`px-2.5 py-1 text-[11px] font-medium mac-segment-item flex items-center gap-1 cursor-pointer ${
                                    isActive
                                        ? 'mac-segment-active'
                                        : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                                }`}
                            >
                                <span className="text-[10px] opacity-70">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Right: Mode + Spotlight + Pin + Score */}
                <div
                    className="flex items-center gap-2"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                    {/* Desktop Canvas Mode Toggle */}
                    <button
                        onClick={() => onModeChange(mode === 'canvas' ? 'normal' : 'canvas')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                            mode === 'canvas'
                                ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                                : 'bg-blue-600/90 hover:bg-blue-500 text-white border-blue-500 shadow'
                        }`}
                        title="Switch to Full Desktop Wallpaper Canvas (Pick & Place Widgets)"
                    >
                        <span>🖥️</span>
                        <span>Desktop Canvas</span>
                    </button>

                    {/* Spotlight search button */}
                    <button
                        onClick={onOpenSpotlight}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/70 hover:text-white text-[10px] transition-all cursor-pointer font-mono"
                        title="Open Spotlight Launcher (⌘K)"
                    >
                        <span>⌘K</span>
                    </button>

                    {/* Pin button */}
                    <button
                        onClick={handleAlwaysOnTop}
                        className={`p-1 rounded-full text-xs transition-colors cursor-pointer ${
                            alwaysOnTop
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'text-white/40 hover:text-white/80 hover:bg-white/[0.06]'
                        }`}
                        title={alwaysOnTop ? 'Pinned On Top' : 'Pin Always On Top'}
                    >
                        📌
                    </button>

                    {/* Score Badge */}
                    <div className="flex items-center gap-1 pl-1.5 border-l border-white/10">
                        <span className={`text-xs font-mono font-bold ${scoreColor}`}>
                            {score}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">pts</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
