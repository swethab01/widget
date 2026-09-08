import { useState, useEffect } from 'react'
import { MacMenuBar } from './MacMenuBar'
import { MacDock } from './MacDock'
import { MacWindowModal } from './MacWindowModal'
import { DraggableWidgetContainer } from './DraggableWidgetContainer'
import { MacWidgetGalleryDrawer, WIDGET_CATALOG } from './MacWidgetGalleryDrawer'
import { KevClockWidget } from './KevClockWidget'
import { KevWeatherWidget } from './KevWeatherWidget'
import { KevBatteryWidget } from './KevBatteryWidget'
import { KevMusicWidget } from './KevMusicWidget'
import { KevQuoteWidget } from './KevQuoteWidget'
import { KevCalendarWidget } from './KevCalendarWidget'
import { KevCDWidget } from './KevCDWidget'
import { KevComicWidget } from './KevComicWidget'
import { KevDateTile } from './KevDateTile'
import { KevPhotoTile } from './KevPhotoTile'
import { KevAppStackWidget } from './KevAppStackWidget'
import { LeetCodeWidget } from './LeetCodeWidget'
import { ChatGPTSearchWidget } from './ChatGPTSearchWidget'
import { RetroFlipClockWidget } from './RetroFlipClockWidget'
import { BatteryRingsWidget } from './BatteryRingsWidget'
import { WeatherWidget } from './WeatherWidget'
import { VinylPlayerWidget } from './VinylPlayerWidget'
import { AppLaunchpadWidget } from './AppLaunchpadWidget'
import { MacCalendarWidget } from './MacCalendarWidget'
import { InspirationalQuoteWidget } from './InspirationalQuoteWidget'
import { MacTasksWidget } from './MacTasksWidget'
import { MacGoalsWidget } from './MacGoalsWidget'
import { MacFocusWidget } from './MacFocusWidget'
import { MacScoreWidget } from './MacScoreWidget'
import { ScreenTimeWidget } from '../ScreenTimeWidget'
import { Scratchpad } from '../../pages/Scratchpad'
import { Analytics } from '../../pages/Analytics'
import { SettingsPage } from '../../pages/Settings'
import { useScreenTime } from '../../hooks/useScreenTime'
import { useTasks } from '../../hooks/useTasks'
import type { DesktopWallpaper, WidgetMode } from '../../types'

interface PlacedWidget {
    id: string
    type: string
    title: string
    x: number
    y: number
    zIndex: number
}

// Developer Focus Layout: LeetCode + Today's Tasks + Habits Tracker + ChatGPT Box
const DEV_FOCUS_LAYOUT: PlacedWidget[] = [
    { id: 'chatgpt',  type: 'chatgpt',  title: 'ChatGPT Search Box',        x: 460, y: 30,  zIndex: 10 },
    { id: 'leetcode', type: 'leetcode', title: 'LeetCode Daily Problem',    x: 40,  y: 30,  zIndex: 10 },
    { id: 'goals',    type: 'goals',    title: 'Daily Habits & Goals',      x: 40,  y: 430, zIndex: 10 },
    { id: 'tasks',    type: 'tasks',    title: "Today's Tasks Checklist",   x: 940, y: 30,  zIndex: 10 },
]

// KevTech layout — no clock, no date tile
const KEVTECH_LAYOUT: PlacedWidget[] = [
    { id: 'kev-battery',  type: 'kev-battery',  title: 'Laptop Battery Monitor',   x: 870, y: 40,  zIndex: 11 },
    { id: 'kev-weather',  type: 'kev-weather',  title: 'Weather (Doha 23°)',       x: 345, y: 40,  zIndex: 10 },
    { id: 'kev-calendar', type: 'kev-calendar', title: 'Dark March Calendar',      x: 345, y: 220, zIndex: 10 },
    { id: 'kev-music',    type: 'kev-music',    title: 'Dominic Fike Now Playing', x: 345, y: 400, zIndex: 10 },
    { id: 'kev-comic',    type: 'kev-comic',    title: 'Spider-Man Comic Art',     x: 155, y: 40,  zIndex: 10 },
    { id: 'kev-cd',       type: 'kev-cd',       title: 'Spider-Man CD Disc',       x: 10,  y: 40,  zIndex: 10 },
    { id: 'kev-photo',    type: 'kev-photo',    title: 'Photo Tile',               x: 10,  y: 230, zIndex: 10 },
    { id: 'kev-quote',    type: 'kev-quote',    title: 'Daniel 3:18 Quote',        x: 10,  y: 420, zIndex: 10 },
]

// MacBook layout — no clock, no date tile
const MACBOOK_LAYOUT: PlacedWidget[] = [
    { id: 'kev-appstack-left',  type: 'kev-appstack', title: 'App Stack',    x: 20,  y: 40,  zIndex: 10 },
    { id: 'kev-weather',        type: 'kev-weather',  title: 'Weather',      x: 20,  y: 320, zIndex: 10 },
    { id: 'kev-appstack-right', type: 'kev-appstack', title: 'Dev Stack',    x: 700, y: 40,  zIndex: 10 },
    { id: 'kev-battery',        type: 'kev-battery',  title: 'Battery',      x: 700, y: 320, zIndex: 10 },
]

const DEFAULT_PLACED_WIDGETS: PlacedWidget[] = DEV_FOCUS_LAYOUT

interface MacDesktopCanvasProps {
    currentWallpaper: DesktopWallpaper
    onSelectWallpaper: (wp: DesktopWallpaper) => void
    currentMode: WidgetMode
    onModeChange: (mode: WidgetMode) => void
    currentPage: string
    onNav: (page: string) => void
    onOpenSpotlight: () => void
    onStartFocus: (taskId: number | null, minutes: number) => void
}

export function MacDesktopCanvas({
    currentWallpaper,
    onSelectWallpaper,
    currentMode,
    onModeChange,
    currentPage,
    onNav,
    onOpenSpotlight,
    onStartFocus,
}: MacDesktopCanvasProps) {
    const screenTime = useScreenTime()
    const tasks = useTasks()

    const [isEditMode, setIsEditMode] = useState(false)
    const [isGalleryOpen, setIsGalleryOpen] = useState(false)
    const [maxZIndex, setMaxZIndex] = useState(20)
    const [dockOrientation, setDockOrientation] = useState<'bottom' | 'left'>('left')

    // v10 — pure developer focus: LeetCode + Tasks + Habits + ChatGPT
    const [placedWidgets, setPlacedWidgets] = useState<PlacedWidget[]>(() => {
        try {
            const saved = localStorage.getItem('devpulse_placed_widgets_v10')
            if (saved) {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed) && parsed.length > 0) return parsed
            }
        } catch {}
        return DEFAULT_PLACED_WIDGETS
    })

    useEffect(() => {
        localStorage.setItem('devpulse_placed_widgets_v10', JSON.stringify(placedWidgets))
    }, [placedWidgets])

    const handleBringToFront = (id: string) => {
        const nextZ = maxZIndex + 1
        setMaxZIndex(nextZ)
        setPlacedWidgets((prev) =>
            prev.map((w) => (w.id === id ? { ...w, zIndex: nextZ } : w))
        )
    }

    const handlePositionChange = (id: string, x: number, y: number) => {
        setPlacedWidgets((prev) =>
            prev.map((w) => (w.id === id ? { ...w, x, y } : w))
        )
    }

    const handleRemoveWidget = (id: string) => {
        setPlacedWidgets((prev) => prev.filter((w) => w.id !== id))
    }

    const handleToggleWidget = (widgetId: string) => {
        const exists = placedWidgets.some((w) => w.id === widgetId)
        if (exists) {
            handleRemoveWidget(widgetId)
        } else {
            const catalogItem = WIDGET_CATALOG.find((c) => c.id === widgetId)
            if (!catalogItem) return

            const offset = (placedWidgets.length % 6) * 35
            const newWidget: PlacedWidget = {
                id: catalogItem.id,
                type: catalogItem.id,
                title: catalogItem.name,
                x: 480 + offset,
                y: 80 + offset,
                zIndex: maxZIndex + 1,
            }
            setMaxZIndex((z) => z + 1)
            setPlacedWidgets((prev) => [...prev, newWidget])
        }
    }

    const handleClearAll = () => {
        setPlacedWidgets([])
        localStorage.setItem('devpulse_placed_widgets_v10', JSON.stringify([]))
    }

    const handleResetLayout = () => {
        setPlacedWidgets(DEFAULT_PLACED_WIDGETS)
        localStorage.setItem(
            'devpulse_placed_widgets_v10',
            JSON.stringify(DEFAULT_PLACED_WIDGETS)
        )
    }

    const handleFocusLayout = () => {
        setPlacedWidgets(DEV_FOCUS_LAYOUT)
        localStorage.setItem('devpulse_placed_widgets_v10', JSON.stringify(DEV_FOCUS_LAYOUT))
    }

    const handleKevTechLayout = () => {
        setPlacedWidgets(KEVTECH_LAYOUT)
        localStorage.setItem('devpulse_placed_widgets_v10', JSON.stringify(KEVTECH_LAYOUT))
        onSelectWallpaper('spiderman')
    }

    const handleMacBookLayout = () => {
        setPlacedWidgets(MACBOOK_LAYOUT)
        localStorage.setItem('devpulse_placed_widgets_v10', JSON.stringify(MACBOOK_LAYOUT))
        onSelectWallpaper('mountains')
    }

    // Wallpaper background styling
    const getWallpaperStyle = () => {
        switch (currentWallpaper) {
            case 'spiderman':
                return {
                    backgroundColor: '#000000',
                    backgroundImage: "url('/spiderman-mask.jpg')",
                    backgroundPosition: '16% center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                }
            case 'sonoma':
                return {
                    background:
                        'radial-gradient(ellipse at 75% 20%, #ff6b4a 0%, #d81b60 25%, #6a1b9a 50%, #1a0933 80%, #080314 100%)',
                }
            case 'sequoia':
                return {
                    background:
                        'radial-gradient(ellipse at 50% 15%, #d97706 0%, #78350f 32%, #1c1917 70%, #09090b 100%)',
                }
            case 'mountains':
                return {
                    background:
                        'linear-gradient(175deg, #6b8fa3 0%, #4a7a8a 15%, #3d6b7a 30%, #2d5a6b 45%, #1a3a4a 65%, #0d1f2d 85%, #060f18 100%)',
                }
            case 'forest':
                return {
                    background:
                        'linear-gradient(180deg, #064e3b 0%, #022c22 45%, #030712 100%)',
                }
            case 'cyber':
            default:
                return {
                    background:
                        'radial-gradient(circle at 50% 50%, #0f172a 0%, #0b0f19 50%, #030712 100%)',
                }
        }
    }

    // Render individual widget component by type
    const renderWidgetContent = (widget: PlacedWidget) => {
        switch (widget.type) {
            // KevTech Exact Widgets
            case 'kev-clock':
                return <KevClockWidget />
            case 'kev-weather':
                return <KevWeatherWidget />
            case 'kev-battery':
                return <KevBatteryWidget />
            case 'kev-music':
                return <KevMusicWidget />
            case 'kev-quote':
                return <KevQuoteWidget />
            case 'kev-calendar':
                return <KevCalendarWidget />
            case 'kev-cd':
                return <KevCDWidget />
            case 'kev-comic':
                return <KevComicWidget />
            case 'kev-date':
                return <KevDateTile />
            case 'kev-photo':
                return <KevPhotoTile />
            case 'kev-appstack':
                return <KevAppStackWidget />

            // User Requested Developer Widgets
            case 'leetcode':
                return (
                    <LeetCodeWidget
                        isEditMode={isEditMode}
                        onClose={() => handleRemoveWidget(widget.id)}
                    />
                )
            case 'chatgpt':
                return (
                    <ChatGPTSearchWidget
                        isEditMode={isEditMode}
                        onClose={() => handleRemoveWidget(widget.id)}
                    />
                )

            // Additional Productivity Widgets
            case 'clock':
                return <RetroFlipClockWidget />
            case 'tasks':
                return (
                    <MacTasksWidget
                        tasks={tasks.tasks}
                        doneTasks={tasks.doneTasks}
                        completionRate={tasks.completionRate}
                        onAdd={tasks.addTask}
                        onToggle={tasks.toggleTask}
                        onDelete={tasks.deleteTask}
                        onFocusTask={(taskId, min) => onStartFocus(taskId, min)}
                        onClose={() => handleRemoveWidget(widget.id)}
                        className="w-80 md:w-96"
                    />
                )
            case 'goals':
                return (
                    <MacGoalsWidget
                        onClose={() => handleRemoveWidget(widget.id)}
                        className="w-80 md:w-96"
                    />
                )
            case 'focus':
                return <MacFocusWidget className="w-80" />
            case 'score':
                return <MacScoreWidget className="w-72" />
            case 'battery':
                return <BatteryRingsWidget className="w-80" />
            case 'weather':
                return <WeatherWidget className="w-80" />
            case 'vinyl':
                return <VinylPlayerWidget className="w-80" />
            case 'calendar':
                return (
                    <MacCalendarWidget
                        taskCount={tasks.tasks.filter((t) => t.status === 'todo').length}
                        className="w-72"
                    />
                )
            case 'launchpad':
                return (
                    <AppLaunchpadWidget
                        className="w-72"
                        onOpenNotes={() => onNav('scratchpad')}
                        onOpenSettings={() => onNav('settings')}
                    />
                )
            case 'quote':
                return <InspirationalQuoteWidget className="w-72" />
            case 'screentime':
                return (
                    <ScreenTimeWidget
                        summary={screenTime.summary}
                        loading={screenTime.loading}
                        className="w-80 md:w-96"
                    />
                )
            default:
                return null
        }
    }

    return (
        <div
            className="flex flex-col h-screen w-screen select-none overflow-hidden relative font-sans transition-all duration-700"
            style={getWallpaperStyle()}
        >
            {/* Top macOS Menu Bar */}
            <MacMenuBar
                currentWallpaper={currentWallpaper}
                onSelectWallpaper={onSelectWallpaper}
                currentMode={currentMode}
                onModeChange={onModeChange}
                onOpenSpotlight={onOpenSpotlight}
                onCloseWindow={() => window.electronAPI.window.hide()}
                onMinimizeWindow={() => window.electronAPI.window.minimize()}
                onToggleEditWidgets={() => {
                    setIsEditMode((prev) => !prev)
                    setIsGalleryOpen((prev) => !prev)
                }}
                isEditMode={isEditMode}
            />

            {/* Desktop Canvas Surface for Free-Form Draggable Widgets */}
            <div className="flex-1 relative overflow-hidden w-full h-full">
                {/* Floating Screen Widgets */}
                {placedWidgets.map((w) => (
                    <DraggableWidgetContainer
                        key={w.id}
                        id={w.id}
                        title={w.title}
                        initialX={w.x}
                        initialY={w.y}
                        zIndex={w.zIndex}
                        isEditMode={isEditMode}
                        onPositionChange={handlePositionChange}
                        onBringToFront={handleBringToFront}
                        onClose={handleRemoveWidget}
                    >
                        {renderWidgetContent(w)}
                    </DraggableWidgetContainer>
                ))}

                {/* Floating Desktop Widget Control Bar */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3.5 py-1.5 bg-black/65 backdrop-blur-2xl border border-white/20 rounded-full shadow-2xl">
                    <button
                        onClick={() => {
                            setIsEditMode(true)
                            setIsGalleryOpen(true)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                    >
                        <span>🧩</span>
                        <span>+ Widgets</span>
                    </button>
                    <button
                        onClick={handleFocusLayout}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer border border-amber-400/30"
                        title="Launch Dev Focus Setup (LeetCode + Tasks + Habits + ChatGPT)"
                    >
                        <span>🔥</span>
                        <span>Dev Focus</span>
                    </button>
                    <button
                        onClick={handleKevTechLayout}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer border border-red-400/30"
                        title="Launch KevTech Full Setup (10 widgets, Spider-Man wallpaper)"
                    >
                        <span>🕷️</span>
                        <span>KevTech</span>
                    </button>
                    <button
                        onClick={handleMacBookLayout}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-slate-600 to-blue-700 hover:from-slate-500 hover:to-blue-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer border border-blue-400/30"
                        title="Launch MacBook Mountain Layout (Image 2 style)"
                    >
                        <span>🏔️</span>
                        <span>MacBook</span>
                    </button>
                    <div className="h-4 w-[1px] bg-white/20" />
                    <button
                        onClick={() => {
                            const list: DesktopWallpaper[] = ['spiderman', 'sonoma', 'sequoia', 'mountains', 'forest', 'cyber']
                            const idx = list.indexOf(currentWallpaper)
                            const next = list[(idx + 1) % list.length]
                            onSelectWallpaper(next)
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium transition-colors cursor-pointer"
                        title="Change Desktop Wallpaper"
                    >
                        <span>🖼️</span>
                        <span className="capitalize">{currentWallpaper}</span>
                    </button>
                    <button
                        onClick={handleClearAll}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-rose-500/30 text-white/70 hover:text-rose-200 text-xs font-medium transition-colors cursor-pointer"
                        title="Remove all widgets from wallpaper"
                    >
                        <span>🧹</span>
                        <span>Clear</span>
                    </button>
                    <button
                        onClick={handleResetLayout}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                        title="Reset to 4 clean widgets"
                    >
                        <span>↺</span>
                        <span>Reset</span>
                    </button>
                    <div className="h-4 w-[1px] bg-white/20" />
                    <button
                        onClick={() => onModeChange('normal')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                        title="Dock as compact sidebar widget beside code editor"
                    >
                        <span>📱</span>
                        <span>Sidebar</span>
                    </button>
                </div>

                {/* Empty State / Help Pill if all widgets removed */}
                {placedWidgets.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="p-6 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/15 text-center max-w-sm pointer-events-auto shadow-2xl">
                            <div className="text-4xl mb-2">🧩</div>
                            <h3 className="text-base font-bold text-white mb-1">
                                Clean Wallpaper Canvas
                            </h3>
                            <p className="text-xs text-white/60 mb-4 leading-relaxed">
                                Pick only the widgets you want and place them anywhere on your desktop wallpaper.
                            </p>
                            <button
                                onClick={() => {
                                    setIsEditMode(true)
                                    setIsGalleryOpen(true)
                                }}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg"
                            >
                                + Open Widget Catalog
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* macOS Floating Dock (Left-aligned by default to match KevTech setup) */}
            <MacDock
                currentPage={currentPage}
                onNav={onNav}
                onStartFocus={() => onStartFocus(null, 25)}
                onOpenSpotlight={onOpenSpotlight}
                orientation={dockOrientation}
                onToggleOrientation={() =>
                    setDockOrientation((prev) => (prev === 'bottom' ? 'left' : 'bottom'))
                }
                onToggleEditWidgets={() => {
                    setIsEditMode((prev) => !prev)
                    setIsGalleryOpen((prev) => !prev)
                }}
                isEditMode={isEditMode}
            />

            {/* macOS Sonoma Widget Gallery Drawer */}
            <MacWidgetGalleryDrawer
                isOpen={isGalleryOpen}
                onClose={() => {
                    setIsGalleryOpen(false)
                    setIsEditMode(false)
                }}
                activeWidgetIds={placedWidgets.map((w) => w.id)}
                onToggleWidget={handleToggleWidget}
                onResetLayout={handleResetLayout}
                onClearAll={handleClearAll}
            />

            {/* Floating macOS App Windows */}
            <MacWindowModal
                isOpen={currentPage === 'scratchpad'}
                onClose={() => onNav('dashboard')}
                title="Notes & Scratchpad"
                icon="📝"
            >
                <Scratchpad />
            </MacWindowModal>

            <MacWindowModal
                isOpen={currentPage === 'analytics'}
                onClose={() => onNav('dashboard')}
                title="Activity & Productivity Analytics"
                icon="📈"
            >
                <Analytics />
            </MacWindowModal>

            <MacWindowModal
                isOpen={currentPage === 'settings'}
                onClose={() => onNav('dashboard')}
                title="System Settings & Preferences"
                icon="⚙️"
            >
                <SettingsPage />
            </MacWindowModal>
        </div>
    )
}
