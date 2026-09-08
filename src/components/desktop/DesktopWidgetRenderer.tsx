import { useState, useEffect } from 'react'
import { KevClockWidget } from './KevClockWidget'
import { KevBatteryWidget } from './KevBatteryWidget'
import { KevWeatherWidget } from './KevWeatherWidget'
import { KevCalendarWidget } from './KevCalendarWidget'
import { KevMusicWidget } from './KevMusicWidget'
import { KevCDWidget } from './KevCDWidget'
import { KevComicWidget } from './KevComicWidget'
import { KevDateTile } from './KevDateTile'
import { KevPhotoTile } from './KevPhotoTile'
import { KevQuoteWidget } from './KevQuoteWidget'
import { ChatGPTSearchWidget } from './ChatGPTSearchWidget'
import { LeetCodeWidget } from './LeetCodeWidget'
import { MacTasksWidget } from './MacTasksWidget'
import { MacFocusWidget } from './MacFocusWidget'
import { MacGoalsWidget } from './MacGoalsWidget'
import { MacScoreWidget } from './MacScoreWidget'
import { RetroFlipClockWidget } from './RetroFlipClockWidget'
import { AppLaunchpadWidget } from './AppLaunchpadWidget'
import { ScreenTimeWidget } from '../ScreenTimeWidget'
import { useTasks } from '../../hooks/useTasks'
import { useScreenTime } from '../../hooks/useScreenTime'

interface DesktopWidgetRendererProps {
    widgetId: string
}

const WIDGET_META: Record<string, { title: string; icon: string; accent: string }> = {
    leetcode: { title: 'LeetCode Daily', icon: '⚡', accent: 'border-amber-500/40 text-amber-400' },
    chatgpt: { title: 'ChatGPT Box', icon: '🤖', accent: 'border-emerald-500/40 text-emerald-400' },
    tasks: { title: "Today's Tasks", icon: '📋', accent: 'border-blue-500/40 text-blue-400' },
    goals: { title: 'Habits & Goals', icon: '🎯', accent: 'border-purple-500/40 text-purple-400' },
    screentime: { title: 'Laptop Screen Time', icon: '⏱', accent: 'border-indigo-500/40 text-indigo-400' },
    'kev-clock': { title: 'Apple Clock', icon: '⌚', accent: 'border-white/20 text-white' },
    'kev-battery': { title: 'Battery Monitor', icon: '🔋', accent: 'border-emerald-500/30 text-emerald-400' },
    'kev-weather': { title: 'Weather', icon: '🌦', accent: 'border-cyan-500/30 text-cyan-400' },
    'kev-calendar': { title: 'Calendar', icon: '📅', accent: 'border-white/20 text-white' },
    'kev-music': { title: 'Now Playing', icon: '🎵', accent: 'border-rose-500/30 text-rose-400' },
    'kev-comic': { title: 'Comic Art', icon: '🕷️', accent: 'border-red-500/30 text-red-400' },
    'kev-cd': { title: 'CD Disc', icon: '💿', accent: 'border-red-500/30 text-red-400' },
    'kev-photo': { title: 'Photo Tile', icon: '📷', accent: 'border-white/20 text-white' },
    'kev-quote': { title: 'Daily Quote', icon: '💡', accent: 'border-amber-500/30 text-amber-400' },
    'kev-date': { title: 'Date Tile', icon: '📅', accent: 'border-white/20 text-white' },
}

const QUICK_ADD_WIDGETS = [
    { id: 'leetcode',   name: 'LeetCode Daily',     icon: '⚡' },
    { id: 'screentime', name: 'Laptop Screen Time',  icon: '⏱' },
    { id: 'chatgpt',    name: 'ChatGPT Box',        icon: '🤖' },
    { id: 'launchpad',  name: 'App Launcher (8 Apps)', icon: '🚀' },
    { id: 'tasks',      name: "Today's Tasks",      icon: '📋' },
    { id: 'goals',      name: 'Habits & Goals',     icon: '🎯' },
]

export function DesktopWidgetRenderer({ widgetId }: DesktopWidgetRendererProps) {
    const tasks = useTasks()
    const screenTime = useScreenTime()
    const [isClosing, setIsClosing] = useState(false)
    const [showQuickMenu, setShowQuickMenu] = useState(false)
    const [activeWidgets, setActiveWidgets] = useState<string[]>([])

    useEffect(() => {
        window.electronAPI?.widgets?.getActive?.().then((list) => {
            if (Array.isArray(list)) setActiveWidgets(list)
        })
        const handleActiveChanged = (...args: unknown[]) => {
            const list = args[0]
            if (Array.isArray(list)) setActiveWidgets(list as string[])
        }
        window.electronAPI?.on?.('widgets:activeChanged', handleActiveChanged)
        return () => window.electronAPI?.off?.('widgets:activeChanged', handleActiveChanged)
    }, [])

    const handleClose = () => {
        // INSTANT 0ms VISUAL REMOVAL
        setIsClosing(true)
        if (window.electronAPI?.widgets?.closeCurrent) {
            window.electronAPI.widgets.closeCurrent()
        } else if (window.electronAPI?.widgets?.close) {
            window.electronAPI.widgets.close(widgetId)
        } else {
            window.close()
        }
    }

    const handleToggleOtherWidget = async (id: string) => {
        // Optimistic instant state update
        setActiveWidgets((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        )
        await window.electronAPI?.widgets?.toggle?.(id)
    }

    const handleOpenManager = () => {
        setShowQuickMenu(false)
        window.electronAPI?.widgets?.openManager?.()
    }

    const handleClearAll = async () => {
        setShowQuickMenu(false)
        await window.electronAPI?.widgets?.closeAll?.()
    }

    // Keyboard shortcut: Escape closes the widget immediately
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showQuickMenu) {
                    setShowQuickMenu(false)
                } else {
                    handleClose()
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showQuickMenu])

    if (isClosing) {
        return null
    }

    const meta = WIDGET_META[widgetId] || { title: widgetId, icon: '🧩', accent: 'border-white/20 text-white' }

    const renderWidget = () => {
        switch (widgetId) {
            case 'chatgpt':
                return <ChatGPTSearchWidget onClose={handleClose} />
            case 'leetcode':
                return <LeetCodeWidget className="w-full !bg-transparent !border-0 !shadow-none !p-1" />
            case 'tasks':
                return (
                    <MacTasksWidget
                        tasks={tasks.tasks}
                        doneTasks={tasks.doneTasks}
                        completionRate={tasks.completionRate}
                        onAdd={tasks.addTask}
                        onToggle={tasks.toggleTask}
                        onDelete={tasks.deleteTask}
                        onFocusTask={async (taskId, minutes) => {
                            if (window.electronAPI?.focus?.start) {
                                await window.electronAPI.focus.start(taskId, minutes)
                            }
                        }}
                        className="w-full !bg-transparent !border-0 !shadow-none !p-1"
                    />
                )
            case 'goals':
                return <MacGoalsWidget className="w-full !bg-transparent !border-0 !shadow-none !p-1" />
            case 'kev-clock':
                return <KevClockWidget />
            case 'kev-battery':
                return <KevBatteryWidget />
            case 'kev-weather':
                return <KevWeatherWidget />
            case 'kev-calendar':
                return <KevCalendarWidget />
            case 'kev-music':
                return <KevMusicWidget />
            case 'kev-cd':
                return <KevCDWidget />
            case 'kev-comic':
                return <KevComicWidget />
            case 'kev-quote':
                return <KevQuoteWidget />
            case 'kev-date':
                return <KevDateTile />
            case 'kev-photo':
                return <KevPhotoTile />
            case 'focus':
                return <MacFocusWidget className="w-full !bg-transparent !border-0 !shadow-none" />
            case 'score':
                return <MacScoreWidget className="w-full !bg-transparent !border-0 !shadow-none" />
            case 'clock':
                return <RetroFlipClockWidget />
            case 'launchpad':
                return (
                    <AppLaunchpadWidget
                        className="w-full !bg-transparent !border-0 !shadow-none"
                        onClose={handleClose}
                        onOpenNotes={handleOpenManager}
                        onOpenSettings={handleOpenManager}
                    />
                )
            case 'screentime':
                return (
                    <ScreenTimeWidget
                        summary={screenTime.summary}
                        loading={screenTime.loading}
                        onClose={handleClose}
                        className="w-full !bg-transparent !border-0 !shadow-none"
                    />
                )
            default:
                return (
                    <div className="p-4 bg-black/80 rounded-2xl text-white text-xs text-center border border-white/10">
                        Unknown Widget: {widgetId}
                    </div>
                )
        }
    }

    // For iOS-style standalone widgets like ScreenTime and AppLaunchpad, render frameless edge-to-edge
    if (widgetId === 'screentime') {
        return (
            <div
                className="w-full h-full flex items-center justify-center bg-transparent select-none relative cursor-grab active:cursor-grabbing p-0"
                style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
                onContextMenu={(e) => {
                    e.preventDefault()
                    setShowQuickMenu((prev) => !prev)
                }}
            >
                <ScreenTimeWidget
                    summary={screenTime.summary}
                    loading={screenTime.loading}
                    onClose={handleClose}
                    className="w-[176px] h-[176px]"
                />

                {/* Quick Add / Remove Popover Menu on Right Click */}
                {showQuickMenu && (
                    <div
                        className="absolute top-2 left-2 z-50 bg-[#16161a]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-2xl text-xs text-white min-w-[190px]"
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    >
                        <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-1.5">
                            <span className="font-bold text-[11px] text-white/90">Screen Time Options</span>
                            <button
                                onClick={() => setShowQuickMenu(false)}
                                className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-white/60 flex items-center justify-center text-[9px]"
                            >
                                ✕
                            </button>
                        </div>
                        <button
                            onClick={handleOpenManager}
                            className="w-full px-2 py-1.5 rounded-lg flex items-center gap-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                        >
                            <span>🧩</span>
                            <span>Widget Hub...</span>
                        </button>
                        <button
                            onClick={handleClose}
                            className="w-full px-2 py-1.5 rounded-lg flex items-center gap-1.5 text-rose-300 hover:text-white hover:bg-rose-500/30 transition-colors text-left"
                        >
                            <span>✕</span>
                            <span>Close Widget</span>
                        </button>
                    </div>
                )}
            </div>
        )
    }

    if (widgetId === 'launchpad') {
        return (
            <div
                className="w-full h-full flex items-center justify-center bg-transparent select-none relative cursor-grab active:cursor-grabbing p-0"
                style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
                onContextMenu={(e) => {
                    e.preventDefault()
                    setShowQuickMenu((prev) => !prev)
                }}
            >
                <AppLaunchpadWidget
                    className="max-w-[320px] max-h-[164px]"
                    onClose={handleClose}
                    onOpenSettings={handleOpenManager}
                />

                {/* Quick Add / Remove Popover Menu on Right Click */}
                {showQuickMenu && (
                    <div
                        className="absolute top-2 left-2 z-50 bg-[#16161a]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-2xl text-xs text-white min-w-[190px]"
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    >
                        <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-1.5">
                            <span className="font-bold text-[11px] text-white/90">App Launcher Options</span>
                            <button
                                onClick={() => setShowQuickMenu(false)}
                                className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-white/60 flex items-center justify-center text-[9px]"
                            >
                                ✕
                            </button>
                        </div>
                        <button
                            onClick={handleOpenManager}
                            className="w-full px-2 py-1.5 rounded-lg flex items-center gap-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                        >
                            <span>🧩</span>
                            <span>Widget Hub...</span>
                        </button>
                        <button
                            onClick={handleClose}
                            className="w-full px-2 py-1.5 rounded-lg flex items-center gap-1.5 text-rose-300 hover:text-white hover:bg-rose-500/30 transition-colors text-left"
                        >
                            <span>✕</span>
                            <span>Close Widget</span>
                        </button>
                    </div>
                )}
            </div>
        )
    }

    if (widgetId === 'chatgpt') {
        return (
            <div
                className="w-full h-full flex items-center justify-center bg-transparent select-none relative cursor-grab active:cursor-grabbing p-0"
                style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
                onContextMenu={(e) => {
                    e.preventDefault()
                    setShowQuickMenu((prev) => !prev)
                }}
            >
                <ChatGPTSearchWidget
                    className="max-w-[320px] max-h-[140px]"
                    onClose={handleClose}
                />

                {/* Quick Add / Remove Popover Menu on Right Click */}
                {showQuickMenu && (
                    <div
                        className="absolute top-2 left-2 z-50 bg-[#16161a]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-2xl text-xs text-white min-w-[190px]"
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    >
                        <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-1.5">
                            <span className="font-bold text-[11px] text-white/90">ChatGPT Options</span>
                            <button
                                onClick={() => setShowQuickMenu(false)}
                                className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-white/60 flex items-center justify-center text-[9px]"
                            >
                                ✕
                            </button>
                        </div>
                        <button
                            onClick={handleOpenManager}
                            className="w-full px-2 py-1.5 rounded-lg flex items-center gap-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                        >
                            <span>🧩</span>
                            <span>Widget Hub...</span>
                        </button>
                        <button
                            onClick={handleClose}
                            className="w-full px-2 py-1.5 rounded-lg flex items-center gap-1.5 text-rose-300 hover:text-white hover:bg-rose-500/30 transition-colors text-left"
                        >
                            <span>✕</span>
                            <span>Close Widget</span>
                        </button>
                    </div>
                )}
            </div>
        )
    }

    if (widgetId === 'leetcode') {
        return (
            <div
                className="w-full h-full flex items-center justify-center bg-transparent select-none relative p-0"
                onContextMenu={(e) => {
                    e.preventDefault()
                    setShowQuickMenu((prev) => !prev)
                }}
            >
                <LeetCodeWidget
                    className="w-full h-full"
                    onClose={handleClose}
                />

                {/* Quick Add / Remove Popover Menu on Right Click */}
                {showQuickMenu && (
                    <div
                        className="absolute top-2 left-2 z-50 bg-[#16161a]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-2xl text-xs text-white min-w-[190px]"
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    >
                        <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-1.5">
                            <span className="font-bold text-[11px] text-white/90">LeetCode Options</span>
                            <button
                                onClick={() => setShowQuickMenu(false)}
                                className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-white/60 flex items-center justify-center text-[9px]"
                            >
                                ✕
                            </button>
                        </div>
                        <button
                            onClick={handleOpenManager}
                            className="w-full px-2 py-1.5 rounded-lg flex items-center gap-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                        >
                            <span>🧩</span>
                            <span>Widget Hub...</span>
                        </button>
                        <button
                            onClick={handleClose}
                            className="w-full px-2 py-1.5 rounded-lg flex items-center gap-1.5 text-rose-300 hover:text-white hover:bg-rose-500/30 transition-colors text-left"
                        >
                            <span>✕</span>
                            <span>Close Widget</span>
                        </button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-transparent select-none relative p-1">
            {/* Unified Sleek Widget Glass Wrapper */}
            <div
                className="w-full h-full flex flex-col rounded-[24px] overflow-hidden shadow-2xl transition-all relative"
                style={{
                    background: 'rgba(11, 14, 23, 0.92)',
                    backdropFilter: 'blur(28px)',
                    WebkitBackdropFilter: 'blur(28px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
                }}
            >
                {/* Top Drag & Control Bar */}
                <div
                    className="w-full h-8 px-3 flex items-center justify-between border-b border-white/[0.08] cursor-grab active:cursor-grabbing shrink-0 transition-colors hover:bg-white/[0.03]"
                    style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
                    title="Click and drag to move widget anywhere on desktop (Right click for quick menu)"
                    onContextMenu={(e) => {
                        e.preventDefault()
                        setShowQuickMenu((prev) => !prev)
                    }}
                >
                    {/* Left: Window Title & Icon */}
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs">{meta.icon}</span>
                        <span className="text-[11px] font-bold text-white/80 tracking-wide font-sans truncate">
                            {meta.title}
                        </span>
                    </div>

                    {/* Center: Drag indicator dots */}
                    <div className="flex items-center gap-0.5 text-white/25 text-[10px] tracking-widest uppercase font-mono">
                        <span>⠿</span>
                        <span className="text-[9px]">drag</span>
                    </div>

                    {/* Right: Actions with no-drag */}
                    <div
                        className="flex items-center gap-1.5 relative"
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    >
                        {/* QUICK ADD/MANAGE BUTTON */}
                        <button
                            onClick={() => setShowQuickMenu((prev) => !prev)}
                            title="Add or remove widgets"
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer shadow-sm ${
                                showQuickMenu
                                    ? 'bg-blue-600 text-white ring-2 ring-blue-400/50'
                                    : 'bg-white/10 hover:bg-blue-500 hover:text-white text-white/60'
                            }`}
                        >
                            +
                        </button>

                        {/* MINIMIZE BUTTON */}
                        <button
                            onClick={() => {
                                if (window.electronAPI?.window?.minimize) {
                                    window.electronAPI.window.minimize()
                                }
                            }}
                            title="Minimize widget to desktop"
                            className="w-5 h-5 rounded-full bg-white/10 hover:bg-amber-500 hover:text-white text-white/60 flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                        >
                            –
                        </button>

                        {/* INSTANT PROMINENT CLOSE BUTTON */}
                        <button
                            onClick={handleClose}
                            title="Close this widget (Instant Esc)"
                            className="w-5 h-5 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white flex items-center justify-center text-[11px] font-bold transition-all cursor-pointer shadow-md hover:scale-110 active:scale-95"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Quick Add / Remove Popover Menu */}
                {showQuickMenu && (
                    <div
                        className="absolute top-9 right-2 z-50 w-52 p-2 rounded-2xl bg-[#121622]/95 backdrop-blur-2xl border border-white/20 shadow-2xl text-white font-sans text-xs animate-in fade-in zoom-in-95 duration-100"
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    >
                        <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono text-white/40 uppercase tracking-wider">
                            <span>Desktop Widgets</span>
                            <button
                                onClick={() => setShowQuickMenu(false)}
                                className="text-white/40 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {/* 4 Core Focus Widgets */}
                        <div className="space-y-1 my-1">
                            {QUICK_ADD_WIDGETS.map((w) => {
                                const isActive = activeWidgets.includes(w.id)
                                return (
                                    <button
                                        key={w.id}
                                        onClick={() => handleToggleOtherWidget(w.id)}
                                        className={`w-full px-2.5 py-1.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                                            isActive
                                                ? 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/30'
                                                : 'hover:bg-white/10 text-white/70 hover:text-white'
                                        }`}
                                    >
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <span>{w.icon}</span>
                                            <span>{w.name}</span>
                                        </span>
                                        <span
                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono ${
                                                isActive
                                                    ? 'bg-emerald-500/25 text-emerald-300'
                                                    : 'bg-white/10 text-white/40'
                                            }`}
                                        >
                                            {isActive ? '✓ Live' : '+ Add'}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>

                        <div className="h-[1px] bg-white/10 my-1" />

                        {/* Catalog & Bulk Actions */}
                        <button
                            onClick={handleOpenManager}
                            className="w-full px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                        >
                            <span>🧩</span>
                            <span>More in Widget Hub...</span>
                        </button>
                        <button
                            onClick={handleClearAll}
                            className="w-full px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-rose-300 hover:text-white hover:bg-rose-500/30 transition-colors text-left cursor-pointer"
                        >
                            <span>🧹</span>
                            <span>Clear All Widgets</span>
                        </button>
                    </div>
                )}

                {/* Widget Body Content Area with no-drag so all inputs, buttons, clicks work seamlessly */}
                <div
                    className="flex-1 w-full overflow-y-auto overflow-x-hidden p-2.5 flex flex-col justify-between scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                    {renderWidget()}
                </div>
            </div>
        </div>
    )
}
