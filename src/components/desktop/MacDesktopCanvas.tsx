import { useState } from 'react'
import { MacMenuBar } from './MacMenuBar'
import { RetroFlipClockWidget } from './RetroFlipClockWidget'
import { BatteryRingsWidget } from './BatteryRingsWidget'
import { WeatherWidget } from './WeatherWidget'
import { VinylPlayerWidget } from './VinylPlayerWidget'
import { AIPromptWidget } from './AIPromptWidget'
import { AppLaunchpadWidget } from './AppLaunchpadWidget'
import { MacCalendarWidget } from './MacCalendarWidget'
import { InspirationalQuoteWidget } from './InspirationalQuoteWidget'
import { MacDock } from './MacDock'
import { ScreenTimeWidget } from '../ScreenTimeWidget'
import { FlowGuardianHUD } from '../FlowGuardianHUD'
import { useScreenTime } from '../../hooks/useScreenTime'
import type { DesktopWallpaper, WidgetMode } from '../../types'

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
    const [dockOrientation, setDockOrientation] = useState<'bottom' | 'left'>('bottom')

    // Wallpaper background classes and decorative overlays
    const getWallpaperStyle = () => {
        switch (currentWallpaper) {
            case 'spiderman':
                return {
                    background: 'radial-gradient(circle at 50% 35%, #881337 0%, #3f0a15 35%, #100408 70%, #050508 100%)',
                }
            case 'mountains':
                return {
                    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 40%, #020617 100%)',
                }
            case 'forest':
                return {
                    background: 'linear-gradient(180deg, #064e3b 0%, #022c22 45%, #030712 100%)',
                }
            case 'cyber':
            default:
                return {
                    background: 'radial-gradient(circle at 50% 50%, #0f172a 0%, #0b0f19 50%, #030712 100%)',
                }
        }
    }

    return (
        <div
            className="flex flex-col h-screen w-full select-none overflow-hidden relative font-sans transition-all duration-700"
            style={getWallpaperStyle()}
        >
            {/* Ambient Lighting Gradients */}
            {currentWallpaper === 'spiderman' && (
                <>
                    <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none" />
                    <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-red-800/10 rounded-full blur-[120px] pointer-events-none" />
                </>
            )}
            {currentWallpaper === 'forest' && (
                <div className="absolute top-1/3 right-1/4 w-[600px] h-[400px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
            )}
            {currentWallpaper === 'mountains' && (
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[400px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
            )}

            {/* Top macOS Menu Bar */}
            <MacMenuBar
                currentWallpaper={currentWallpaper}
                onSelectWallpaper={onSelectWallpaper}
                currentMode={currentMode}
                onModeChange={onModeChange}
                onOpenSpotlight={onOpenSpotlight}
                onCloseWindow={() => window.electronAPI.window.hide()}
                onMinimizeWindow={() => window.electronAPI.window.minimize()}
            />

            {/* Desktop Widget Canvas Workspace */}
            <main
                className={`flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-hide z-10 ${
                    dockOrientation === 'left' ? 'pl-20' : 'pb-24'
                }`}
            >
                <div className="max-w-7xl mx-auto space-y-4">
                    {/* Top Smart Flow Guardian Pill */}
                    <div className="max-w-2xl mx-auto">
                        <FlowGuardianHUD
                            onStartFocus={(taskId, min) => onStartFocus(taskId, min)}
                            onAddTask={() => onNav('dashboard')}
                        />
                    </div>

                    {/* Desktop Widgets Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Widget 1: Retro Split-Flap Clock */}
                        <RetroFlipClockWidget className="shadow-2xl" />

                        {/* Widget 2: Apple Battery & System Rings */}
                        <BatteryRingsWidget className="shadow-2xl" />

                        {/* Widget 3: Weather Forecast */}
                        <WeatherWidget className="shadow-2xl" />

                        {/* Widget 4: Vinyl HiFi Record Player */}
                        <VinylPlayerWidget className="shadow-2xl" />
                    </div>

                    {/* Secondary Widgets Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Widget 5: Minimal Quote */}
                        <InspirationalQuoteWidget className="shadow-2xl" />

                        {/* Widget 6: AI Search & Code Prompts */}
                        <AIPromptWidget
                            className="shadow-2xl"
                            onSendPrompt={() => onNav('scratchpad')}
                        />

                        {/* Widget 7: App Launchpad Grid */}
                        <AppLaunchpadWidget
                            className="shadow-2xl"
                            onOpenNotes={() => onNav('scratchpad')}
                            onOpenSettings={() => onNav('settings')}
                        />

                        {/* Widget 8: Calendar Tile */}
                        <MacCalendarWidget className="shadow-2xl" />
                    </div>

                    {/* Screen Time & Detailed Activity Widget */}
                    <div className="max-w-2xl mx-auto pt-1">
                        <ScreenTimeWidget
                            summary={screenTime.summary}
                            loading={screenTime.loading}
                            className="shadow-2xl"
                        />
                    </div>
                </div>
            </main>

            {/* macOS Floating Dock */}
            <MacDock
                currentPage={currentPage}
                onNav={onNav}
                onStartFocus={() => onStartFocus(null, 25)}
                onOpenSpotlight={onOpenSpotlight}
                orientation={dockOrientation}
                onToggleOrientation={() =>
                    setDockOrientation((prev) => (prev === 'bottom' ? 'left' : 'bottom'))
                }
            />
        </div>
    )
}
