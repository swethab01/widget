import { useState } from 'react'
import { AppleLogoIcon } from './MacMenuBar'

interface MacDockProps {
    currentPage: string
    onNav: (page: string) => void
    onStartFocus?: () => void
    onOpenSpotlight?: () => void
    onToggleEditWidgets?: () => void
    isEditMode?: boolean
    orientation?: 'bottom' | 'left'
    onToggleOrientation?: () => void
}

interface DockApp {
    id: string
    name: string
    icon: string | 'apple'
    bgGradient: string
    page?: string
    action?: 'focus' | 'spotlight' | 'widgets'
}

const DOCK_APPS: DockApp[] = [
    {
        id: 'finder',
        name: 'Dashboard',
        icon: 'apple',
        bgGradient: 'from-blue-500 to-indigo-600',
        page: 'dashboard',
    },
    {
        id: 'focus',
        name: 'Deep Work Sprint',
        icon: '⚡',
        bgGradient: 'from-amber-400 to-orange-600',
        action: 'focus',
    },
    {
        id: 'notes',
        name: 'Scratchpad',
        icon: '📝',
        bgGradient: 'from-yellow-400 to-amber-600',
        page: 'scratchpad',
    },
    {
        id: 'analytics',
        name: 'Activity & Heatmap',
        icon: '📈',
        bgGradient: 'from-emerald-400 to-teal-600',
        page: 'analytics',
    },
    {
        id: 'spotlight',
        name: 'Spotlight Search (⌘K)',
        icon: '🔍',
        bgGradient: 'from-violet-500 to-purple-700',
        action: 'spotlight',
    },
    {
        id: 'widgets',
        name: 'Edit Widgets',
        icon: '🧩',
        bgGradient: 'from-cyan-500 to-blue-600',
        action: 'widgets',
    },
    {
        id: 'settings',
        name: 'Settings',
        icon: '⚙️',
        bgGradient: 'from-slate-400 to-zinc-600',
        page: 'settings',
    },
]

export function MacDock({
    currentPage,
    onNav,
    onStartFocus,
    onOpenSpotlight,
    onToggleEditWidgets,
    isEditMode = false,
    orientation = 'bottom',
    onToggleOrientation,
}: MacDockProps) {
    const [hoveredApp, setHoveredApp] = useState<string | null>(null)

    const handleClick = (app: DockApp) => {
        if (app.action === 'widgets' && onToggleEditWidgets) {
            onToggleEditWidgets()
        } else if (app.page) {
            onNav(app.page)
        } else if (app.action === 'focus' && onStartFocus) {
            onStartFocus()
        } else if (app.action === 'spotlight' && onOpenSpotlight) {
            onOpenSpotlight()
        }
    }

    const isVertical = orientation === 'left'

    return (
        <div
            className={`z-40 transition-all select-none ${
                isVertical
                    ? 'fixed left-4 top-1/2 -translate-y-1/2'
                    : 'fixed bottom-4 left-1/2 -translate-x-1/2'
            }`}
        >
            <div
                className={`mac-dock-container p-2 flex items-center gap-2 ${
                    isVertical ? 'flex-col' : 'flex-row'
                }`}
            >
                {DOCK_APPS.map((app) => {
                    const isActive = app.page === currentPage
                    const isHovered = hoveredApp === app.id

                    return (
                        <div
                            key={app.id}
                            className="relative flex flex-col items-center group"
                            onMouseEnter={() => setHoveredApp(app.id)}
                            onMouseLeave={() => setHoveredApp(null)}
                        >
                            {/* App Icon Button */}
                            <button
                                onClick={() => handleClick(app)}
                                className={`w-11 h-11 rounded-[14px] bg-gradient-to-br ${app.bgGradient} flex items-center justify-center text-white text-lg shadow-lg border border-white/20 mac-dock-item cursor-pointer`}
                                title={app.name}
                            >
                                {app.icon === 'apple' ? (
                                    <AppleLogoIcon className="w-5 h-5 fill-white" />
                                ) : (
                                    <span>{app.icon}</span>
                                )}
                            </button>

                            {/* Active running dot */}
                            <span
                                className={`w-1 h-1 rounded-full bg-white transition-opacity mt-1 ${
                                    isActive ? 'opacity-90' : 'opacity-0'
                                }`}
                            />

                            {/* Tooltip on hover */}
                            {isHovered && (
                                <div
                                    className={`absolute ${
                                        isVertical
                                            ? 'left-14 top-1/2 -translate-y-1/2'
                                            : '-top-9 left-1/2 -translate-x-1/2'
                                    } bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-medium px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap pointer-events-none`}
                                >
                                    {app.name}
                                </div>
                            )}
                        </div>
                    )
                })}

                {/* Separator */}
                <div
                    className={`${
                        isVertical ? 'w-6 h-[1px] my-1' : 'w-[1px] h-6 mx-1'
                    } bg-white/20`}
                />

                {/* Dock Position / Orientation Switcher */}
                {onToggleOrientation && (
                    <button
                        onClick={onToggleOrientation}
                        className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-xs text-white/70 hover:text-white transition-all hover:scale-110 active:scale-95"
                        title={`Dock Position: currently ${orientation}. Click to toggle`}
                    >
                        {isVertical ? '⬇' : '⬅'}
                    </button>
                )}
            </div>
        </div>
    )
}
