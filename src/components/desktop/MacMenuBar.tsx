import { useState, useEffect } from 'react'
import type { DesktopWallpaper, WidgetMode } from '../../types'

interface MacMenuBarProps {
    currentWallpaper: DesktopWallpaper
    onSelectWallpaper: (wp: DesktopWallpaper) => void
    currentMode: WidgetMode
    onModeChange: (mode: WidgetMode) => void
    onOpenSpotlight: () => void
    onCloseWindow: () => void
    onMinimizeWindow: () => void
    onToggleEditWidgets?: () => void
    isEditMode?: boolean
}

export function AppleLogoIcon({ className = 'w-3.5 h-3.5 fill-current' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.85-11.97-14.42-6.53-10.12-11.66-21.78-15.39-34.98-3.73-13.2-5.59-25.07-5.59-35.62 0-14.58 3.59-26.65 10.78-36.21 7.19-9.56 16.32-14.45 27.38-14.67 4.9 0 10.45 1.25 16.65 3.76 6.21 2.5 10.23 3.82 12.06 3.94 1.41-.12 5.54-1.46 12.39-4.04 6.86-2.58 12.63-3.76 17.31-3.55 13.06.65 23.47 5.76 31.23 15.33-11.33 6.86-16.89 16.54-16.68 29.04.22 9.79 3.97 18.06 11.26 24.81 7.29 6.74 15.99 10.44 26.11 11.1-2.61 7.73-5.87 15.66-9.78 23.8zM119.22 31.84c0-7.29 2.55-14.19 7.66-20.7 5.11-6.51 11.58-10.77 19.41-12.78-.22 1.41-.33 2.72-.33 3.92 0 7.07-2.67 14.14-8.01 21.21-5.34 7.07-11.8 11.42-19.38 13.06-.22-1.52-.33-2.72-.33-3.61z" />
        </svg>
    )
}

const WALLPAPERS: { id: DesktopWallpaper; label: string; icon: string }[] = [
    { id: 'sonoma', label: 'Sonoma Horizon', icon: '🌅' },
    { id: 'sequoia', label: 'Sequoia Twilight', icon: '🌲' },
    { id: 'spiderman', label: 'Spider-Man Dark', icon: '🕷️' },
    { id: 'mountains', label: 'Misty Mountains', icon: '🏔️' },
    { id: 'forest', label: 'Emerald Forest', icon: '🍃' },
    { id: 'cyber', label: 'Cyber Studio', icon: '🌌' },
]

export function MacMenuBar({
    currentWallpaper,
    onSelectWallpaper,
    currentMode,
    onModeChange,
    onOpenSpotlight,
    onCloseWindow,
    onMinimizeWindow,
    onToggleEditWidgets,
    isEditMode = false,
}: MacMenuBarProps) {
    const [now, setNow] = useState(new Date())
    const [showWallpaperMenu, setShowWallpaperMenu] = useState(false)
    const [showAppleMenu, setShowAppleMenu] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    })

    return (
        <header
            className="w-full h-8 bg-black/40 backdrop-blur-2xl border-b border-white/[0.08] px-3 flex items-center justify-between text-xs text-white/90 select-none z-50 drag-region relative font-sans"
        >
            {/* Left Side: Traffic lights + Apple logo + App Menus */}
            <div className="flex items-center gap-3 no-drag">
                {/* Traffic Lights */}
                <div className="flex items-center gap-1.5 mac-traffic-container pr-1">
                    <button
                        onClick={onCloseWindow}
                        className="mac-traffic-light traffic-red cursor-pointer"
                        title="Close window"
                    >
                        <span>✕</span>
                    </button>
                    <button
                        onClick={onMinimizeWindow}
                        className="mac-traffic-light traffic-yellow cursor-pointer"
                        title="Minimize window"
                    >
                        <span>−</span>
                    </button>
                    <button
                        onClick={() => onModeChange(currentMode === 'canvas' ? 'expanded' : 'canvas')}
                        className="mac-traffic-light traffic-green cursor-pointer"
                        title="Toggle Full Canvas / Cockpit"
                    >
                        <span>+</span>
                    </button>
                </div>

                {/* Apple Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowAppleMenu((prev) => !prev)}
                        className="hover:text-white px-1.5 py-1 rounded transition-colors text-white/90 flex items-center justify-center cursor-pointer"
                        title="Apple Menu"
                    >
                        <AppleLogoIcon className="w-3.5 h-3.5 fill-current" />
                    </button>
                    {showAppleMenu && (
                        <div
                            className="absolute top-7 left-0 w-48 bg-[#181b24]/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl py-1.5 text-xs text-white/90 z-50"
                            onClick={() => setShowAppleMenu(false)}
                        >
                            <div className="px-3 py-1 font-bold text-white border-b border-white/10 mb-1">
                                About DevPulse
                            </div>
                            <button
                                onClick={() => onModeChange('canvas')}
                                className="w-full text-left px-3 py-1 hover:bg-blue-600/60 transition-colors flex items-center justify-between"
                            >
                                <span>Desktop Canvas</span>
                                <span className="text-[10px] text-white/50">1260×840</span>
                            </button>
                            <button
                                onClick={() => onModeChange('expanded')}
                                className="w-full text-left px-3 py-1 hover:bg-blue-600/60 transition-colors flex items-center justify-between"
                            >
                                <span>Dual Cockpit</span>
                                <span className="text-[10px] text-white/50">960×720</span>
                            </button>
                            <button
                                onClick={() => onModeChange('normal')}
                                className="w-full text-left px-3 py-1 hover:bg-blue-600/60 transition-colors flex items-center justify-between"
                            >
                                <span>Sidebar Widget</span>
                                <span className="text-[10px] text-white/50">440×700</span>
                            </button>
                            <button
                                onClick={() => onModeChange('compact')}
                                className="w-full text-left px-3 py-1 hover:bg-blue-600/60 transition-colors flex items-center justify-between"
                            >
                                <span>2×2 Small Widget</span>
                                <span className="text-[10px] text-white/50">340×240</span>
                            </button>
                            <div className="border-t border-white/10 my-1" />
                            <button
                                onClick={onCloseWindow}
                                className="w-full text-left px-3 py-1 hover:bg-rose-600/60 text-rose-300 transition-colors"
                            >
                                Close Window
                            </button>
                        </div>
                    )}
                </div>

                {/* Main App Name */}
                <span className="font-bold text-white tracking-tight">DevPulse</span>

                {/* Menu items */}
                <div className="hidden sm:flex items-center gap-3 text-white/70">
                    <button
                        onClick={() => onModeChange('normal')}
                        className="hover:text-white transition-colors"
                    >
                        Widget
                    </button>
                    <button
                        onClick={() => onModeChange('expanded')}
                        className="hover:text-white transition-colors"
                    >
                        Cockpit
                    </button>
                    <button
                        onClick={onOpenSpotlight}
                        className="hover:text-white transition-colors"
                    >
                        Spotlight
                    </button>
                    {onToggleEditWidgets && (
                        <button
                            onClick={onToggleEditWidgets}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                                isEditMode
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            {isEditMode ? '✓ Done Editing' : '🧩 Edit Widgets'}
                        </button>
                    )}
                </div>
            </div>

            {/* Right Side: Tray Controls + Wallpaper Picker + Clock */}
            <div className="flex items-center gap-3 no-drag text-[11px] font-medium">
                {/* Wallpaper Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowWallpaperMenu((prev) => !prev)}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.08] hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all text-[11px]"
                        title="Change macOS Wallpaper"
                    >
                        <span>
                            {WALLPAPERS.find((w) => w.id === currentWallpaper)?.icon}
                        </span>
                        <span className="hidden md:inline">
                            {WALLPAPERS.find((w) => w.id === currentWallpaper)?.label}
                        </span>
                        <span className="text-[8px] text-white/40">▼</span>
                    </button>

                    {showWallpaperMenu && (
                        <div
                            className="absolute top-7 right-0 w-44 bg-[#181b24]/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl py-1 text-xs text-white/90 z-50"
                            onClick={() => setShowWallpaperMenu(false)}
                        >
                            <div className="px-3 py-1 text-[10px] font-mono text-white/40 border-b border-white/10 uppercase tracking-wider">
                                Choose Wallpaper
                            </div>
                            {WALLPAPERS.map((w) => (
                                <button
                                    key={w.id}
                                    onClick={() => onSelectWallpaper(w.id)}
                                    className={`w-full text-left px-3 py-1.5 hover:bg-blue-600/60 flex items-center justify-between transition-colors ${
                                        currentWallpaper === w.id ? 'text-blue-400 font-bold' : ''
                                    }`}
                                >
                                    <span>{w.icon} {w.label}</span>
                                    {currentWallpaper === w.id && <span>✓</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Wi-Fi Icon */}
                <span className="text-white/60 text-xs hover:text-white cursor-pointer" title="Wi-Fi: Connected">
                    􀙇
                </span>

                {/* Battery Status */}
                <div className="flex items-center gap-1 text-white/80 font-mono text-[10px]">
                    <span className="text-emerald-400">94%</span>
                    <div className="w-4 h-2 rounded-[2px] border border-white/40 p-[1px] flex items-center">
                        <div className="h-full w-[94%] bg-emerald-400 rounded-[1px]" />
                    </div>
                </div>

                {/* Spotlight Search Icon */}
                <button
                    onClick={onOpenSpotlight}
                    className="hover:text-white transition-colors text-xs text-white/70"
                    title="Spotlight Search (Cmd+K)"
                >
                    🔍
                </button>

                {/* Live Clock & Date */}
                <div className="flex items-center gap-1.5 font-mono text-white/90 pl-1 border-l border-white/15">
                    <span className="hidden lg:inline text-white/50">{dateString}</span>
                    <span className="font-semibold">{timeString}</span>
                </div>
            </div>
        </header>
    )
}
