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
}

const WALLPAPERS: { id: DesktopWallpaper; label: string; icon: string }[] = [
    { id: 'spiderman', label: 'Spider-Man Dark', icon: '🕷️' },
    { id: 'mountains', label: 'Misty Mountains', icon: '🏔️' },
    { id: 'forest', label: 'Emerald Forest', icon: '🌲' },
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
                        className="hover:text-white px-1.5 py-0.5 rounded transition-colors text-sm font-semibold"
                    >
                        
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
