// KevAppStackWidget — macOS Sonoma-style App Stack / Folder Grid
// Matches the app-grid widget visible in Image 2 (MacBook desktop layout)

import { useState } from 'react'

interface AppItem {
    icon: string
    color: string
    label: string
}

const APP_ROWS: AppItem[][] = [
    [
        { icon: '📁', color: 'from-blue-500 to-blue-700', label: 'Files' },
        { icon: '📝', color: 'from-yellow-400 to-amber-600', label: 'Notes' },
        { icon: '📈', color: 'from-emerald-500 to-teal-700', label: 'Stats' },
        { icon: '🔍', color: 'from-gray-500 to-gray-700', label: 'Search' },
    ],
    [
        { icon: '⚡', color: 'from-orange-500 to-red-600', label: 'Focus' },
        { icon: '🎵', color: 'from-pink-500 to-rose-700', label: 'Music' },
        { icon: '📅', color: 'from-red-500 to-rose-700', label: 'Calendar' },
        { icon: '🎯', color: 'from-violet-500 to-purple-700', label: 'Goals' },
    ],
    [
        { icon: '🖥️', color: 'from-slate-500 to-slate-700', label: 'Code' },
        { icon: '🌐', color: 'from-cyan-500 to-blue-600', label: 'Web' },
        { icon: '⚙️', color: 'from-zinc-500 to-zinc-700', label: 'Settings' },
        { icon: '📊', color: 'from-indigo-500 to-indigo-700', label: 'Analytics' },
    ],
]

interface KevAppStackWidgetProps {
    className?: string
    title?: string
}

export function KevAppStackWidget({ className = '', title = 'Productivity' }: KevAppStackWidgetProps) {
    const [hoveredApp, setHoveredApp] = useState<string | null>(null)
    const [clickedLabel, setClickedLabel] = useState<string | null>(null)

    const handleItemClick = (label: string) => {
        setClickedLabel(label)
        setTimeout(() => setClickedLabel(null), 300)

        switch (label.toLowerCase()) {
            case 'files':
                window.electronAPI?.launchApp?.('files')
                break
            case 'notes':
                window.electronAPI?.launchApp?.('notes')
                break
            case 'stats':
                window.electronAPI?.widgets?.open?.('score')
                break
            case 'search':
                window.electronAPI?.launchApp?.('search')
                break
            case 'focus':
                window.electronAPI?.widgets?.open?.('focus')
                break
            case 'music':
                window.electronAPI?.widgets?.open?.('kev-music')
                break
            case 'calendar':
                window.electronAPI?.widgets?.open?.('kev-calendar')
                break
            case 'goals':
                window.electronAPI?.widgets?.open?.('goals')
                break
            case 'code':
                window.electronAPI?.launchApp?.('vscode')
                break
            case 'web':
                window.electronAPI?.launchApp?.('edge')
                break
            case 'settings':
                if (window.electronAPI?.widgets?.openSettings) {
                    window.electronAPI.widgets.openSettings()
                } else if (window.electronAPI?.widgets?.openManager) {
                    window.electronAPI.widgets.openManager('settings')
                } else if (window.electronAPI?.launchApp) {
                    window.electronAPI.launchApp('settings')
                }
                break
            case 'analytics':
                window.electronAPI?.widgets?.open?.('screentime')
                break
            default:
                break
        }
    }

    return (
        <div
            className={`w-52 bg-black/50 backdrop-blur-2xl border border-white/20 rounded-[24px] p-3.5 shadow-2xl select-none ${className}`}
        >
            {/* Stack Header */}
            <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-white/80 tracking-tight">{title}</span>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60" />
                    <span className="text-[9px] text-white/40 font-mono">stack</span>
                </div>
            </div>

            {/* App Grid — 4 columns x 3 rows */}
            <div className="flex flex-col gap-2">
                {APP_ROWS.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex items-center gap-2 justify-between">
                        {row.map((app) => {
                            const isHovered = hoveredApp === `${rowIdx}-${app.label}`
                            const isPressed = clickedLabel === app.label
                            return (
                                <button
                                    key={app.label}
                                    onClick={() => handleItemClick(app.label)}
                                    className="flex flex-col items-center gap-0.5 cursor-pointer group bg-transparent border-0 p-0 focus:outline-none"
                                    onMouseEnter={() => setHoveredApp(`${rowIdx}-${app.label}`)}
                                    onMouseLeave={() => setHoveredApp(null)}
                                    title={`Launch ${app.label}`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-[12px] bg-gradient-to-br ${app.color} flex items-center justify-center text-base shadow-lg border border-white/20 transition-all duration-150 ${
                                            isPressed
                                                ? 'scale-90 brightness-125 ring-2 ring-white/50'
                                                : isHovered
                                                ? 'scale-110 shadow-xl brightness-110'
                                                : ''
                                        }`}
                                    >
                                        {app.icon}
                                    </div>
                                    <span className="text-[8px] text-white/50 font-medium leading-tight truncate w-10 text-center">
                                        {app.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                ))}
            </div>

            {/* Subtle bottom shine */}
            <div className="absolute inset-x-4 bottom-0 h-px bg-white/10 rounded-full pointer-events-none" />
        </div>
    )
}
