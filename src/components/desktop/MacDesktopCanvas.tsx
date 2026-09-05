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

const DEFAULT_PLACED_WIDGETS: PlacedWidget[] = [
    // Top Row - Column 1
    { id: 'kev-cd', type: 'kev-cd', title: 'Spider-Man Web CD', x: 490, y: 55, zIndex: 10 },
    { id: 'kev-photo', type: 'kev-photo', title: 'Photo Tile', x: 490, y: 215, zIndex: 10 },

    // Top Row - Column 2 (Tall 2x4 Comic)
    { id: 'kev-comic', type: 'kev-comic', title: 'Spider-Man Comic Poster', x: 650, y: 55, zIndex: 11 },

    // Top Row - Column 3 (Weather)
    { id: 'kev-weather', type: 'kev-weather', title: 'Doha 23° Weather', x: 810, y: 55, zIndex: 10 },

    // Top Row - Column 4 (Minimal Clock + Spider-Man Date)
    { id: 'kev-clock', type: 'kev-clock', title: 'Minimal Digital Clock', x: 1140, y: 55, zIndex: 10 },
    { id: 'kev-date', type: 'kev-date', title: 'Wednesday March 25', x: 1140, y: 215, zIndex: 10 },

    // Bottom Row - Column 1
    { id: 'kev-quote', type: 'kev-quote', title: 'Daniel 3:18 Quote', x: 490, y: 380, zIndex: 10 },
    { id: 'kev-date-2', type: 'kev-date', title: 'Spider-Man Comic Tile', x: 490, y: 540, zIndex: 10 },

    // Bottom Row - Column 2 (Tall 2x4 Battery)
    { id: 'kev-battery', type: 'kev-battery', title: 'Apple Battery Monitor', x: 650, y: 380, zIndex: 11 },

    // Bottom Row - Column 3 (Music + ChatGPT Omnibar)
    { id: 'kev-music', type: 'kev-music', title: 'Mona Lisa - Dominic Fike', x: 810, y: 380, zIndex: 10 },
    { id: 'chatgpt', type: 'chatgpt', title: 'ChatGPT Omnibar', x: 810, y: 540, zIndex: 12 },

    // Bottom Row - Column 4 (Calendar + LeetCode Search)
    { id: 'kev-calendar', type: 'kev-calendar', title: 'March 25 Calendar', x: 1140, y: 380, zIndex: 10 },
    { id: 'leetcode', type: 'leetcode', title: 'LeetCode Daily & Search', x: 1140, y: 540, zIndex: 12 },
]

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

    // Load saved widgets and positions
    const [placedWidgets, setPlacedWidgets] = useState<PlacedWidget[]>(() => {
        try {
            const saved = localStorage.getItem('devpulse_placed_widgets_v4')
            if (saved) {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed) && parsed.length > 0) return parsed
            }
        } catch {
            // fallback
        }
        return DEFAULT_PLACED_WIDGETS
    })

    // Save positions whenever placedWidgets change
    useEffect(() => {
        localStorage.setItem('devpulse_placed_widgets_v4', JSON.stringify(placedWidgets))
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

    const handleResetLayout = () => {
        setPlacedWidgets(DEFAULT_PLACED_WIDGETS)
        localStorage.setItem(
            'devpulse_placed_widgets_v4',
            JSON.stringify(DEFAULT_PLACED_WIDGETS)
        )
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
                        'linear-gradient(180deg, #1e293b 0%, #0f172a 40%, #020617 100%)',
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
                        className="w-80 md:w-96"
                    />
                )
            case 'goals':
                return <MacGoalsWidget className="w-80 md:w-96" />
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

                {/* Empty State / Help Pill if all widgets removed */}
                {placedWidgets.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="p-6 rounded-3xl bg-black/50 backdrop-blur-2xl border border-white/10 text-center max-w-sm pointer-events-auto">
                            <div className="text-4xl mb-2">🕷️</div>
                            <h3 className="text-sm font-bold text-white mb-1">
                                No Widgets on Screen
                            </h3>
                            <p className="text-xs text-white/50 mb-3 leading-relaxed">
                                Open the Widget Gallery below to pick widgets and place them on your screen.
                            </p>
                            <button
                                onClick={() => {
                                    setIsEditMode(true)
                                    setIsGalleryOpen(true)
                                }}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                            >
                                + Open Widget Gallery
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
