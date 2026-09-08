import { useState, useEffect } from 'react'
import { WIDGET_CATALOG, WidgetCatalogItem, WidgetCategory } from './MacWidgetGalleryDrawer'
import { SettingsPage } from '../../pages/Settings'

export function WidgetHub() {
    const [activeTab, setActiveTab] = useState<'widgets' | 'settings'>('widgets')
    const [activeWidgets, setActiveWidgets] = useState<string[]>([])
    const [selectedCategory, setSelectedCategory] = useState<WidgetCategory>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const refreshActive = async () => {
        if (window.electronAPI?.widgets?.getActive) {
            const list = await window.electronAPI.widgets.getActive()
            setActiveWidgets(list || [])
        }
    }

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('tab') === 'settings') {
            setActiveTab('settings')
        }

        refreshActive()
        const handler = () => refreshActive()
        window.electronAPI?.on('widgets:activeChanged', handler)

        const tabHandler = (...args: unknown[]) => {
            const tab = args[0]
            if (tab === 'settings' || tab === 'widgets') {
                setActiveTab(tab)
            }
        }
        window.electronAPI?.on('manager:setTab', tabHandler)

        return () => {
            window.electronAPI?.off('widgets:activeChanged', handler)
            window.electronAPI?.off('manager:setTab', tabHandler)
        }
    }, [])

    const handleToggle = async (widgetId: string) => {
        // Optimistic 0ms UI update
        setActiveWidgets((prev) =>
            prev.includes(widgetId) ? prev.filter((id) => id !== widgetId) : [...prev, widgetId]
        )
        if (window.electronAPI?.widgets?.toggle) {
            await window.electronAPI.widgets.toggle(widgetId)
            await refreshActive()
        }
    }

    const handleCloseAll = async () => {
        setActiveWidgets([])
        if (window.electronAPI?.widgets?.closeAll) {
            await window.electronAPI.widgets.closeAll()
            await refreshActive()
        }
    }

    const handleLaunchFocus = async () => {
        if (window.electronAPI?.widgets?.launchFocus) {
            await window.electronAPI.widgets.launchFocus()
            await refreshActive()
        }
    }

    const handleLaunchKevTech = async () => {
        if (window.electronAPI?.widgets?.launchKevTech) {
            await window.electronAPI.widgets.launchKevTech()
            await refreshActive()
        }
    }

    const handleLaunchMacBook = async () => {
        if (window.electronAPI?.widgets?.launchMacBook) {
            await window.electronAPI.widgets.launchMacBook()
            await refreshActive()
        }
    }

    const handleLaunchEssentials = async () => {
        if (window.electronAPI?.widgets?.launchEssentials) {
            await window.electronAPI.widgets.launchEssentials()
            await refreshActive()
        }
    }

    const filteredWidgets = WIDGET_CATALOG.filter((w) => {
        const matchesCategory =
            selectedCategory === 'all' || w.category === selectedCategory
        const matchesSearch =
            w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const PRESETS = [
        {
            key: 'focus',
            title: '🎯 Dev Focus Setup (Recommended)',
            emoji: '🔥',
            description: 'LeetCode Daily (@s4njay) + Today’s Tasks + Habits & Goals + ChatGPT Box + Laptop Screen Time & Apps.',
            icons: ['⚡', '📋', '🎯', '🤖', '⏱'],
            badge: '5 Core Widgets',
            badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            borderColor: 'border-amber-500/40 hover:border-amber-400/80 ring-1 ring-amber-500/20',
            bgColor: 'from-amber-950/60 via-purple-950/40 to-black/60 hover:from-amber-900/60',
            glowColor: 'from-amber-600/20',
            onClick: handleLaunchFocus,
        },
        {
            key: 'kevtech',
            title: 'KevTech Full Setup',
            emoji: '🕷️',
            description: '10 widgets: Clock, Weather, Calendar, Battery, Music, CD, Comic, Quote, Photo & Date tile — Spider-Man wallpaper',
            icons: ['⌚', '🌦', '📅', '🔋', '🎵', '💿', '🕷️', '💡', '📸'],
            badge: 'Spider-Man WP',
            badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
            borderColor: 'border-red-500/30 hover:border-red-400/60',
            bgColor: 'from-red-950/60 via-rose-950/40 to-black/60 hover:from-red-900/60',
            glowColor: 'from-red-600/10',
            onClick: handleLaunchKevTech,
        },
        {
            key: 'macbook',
            title: 'MacBook Minimal',
            emoji: '🏔️',
            description: 'Clean layout: App Stack grid, Clock, Weather, Calendar, Battery — mountains wallpaper',
            icons: ['📱', '⌚', '🌦', '📅', '🔋'],
            badge: 'Mountains WP',
            badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            borderColor: 'border-blue-500/30 hover:border-blue-400/60',
            bgColor: 'from-slate-900/60 via-blue-950/40 to-black/60 hover:from-slate-800/60',
            glowColor: 'from-blue-600/10',
            onClick: handleLaunchMacBook,
        },
        {
            key: 'essentials',
            title: 'Essentials Only',
            emoji: '⚡',
            description: 'Clock + Battery + Weather + Calendar. Fast, minimal, always useful.',
            icons: ['⌚', '🔋', '🌦', '📅'],
            badge: '4 Widgets',
            badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            borderColor: 'border-emerald-500/30 hover:border-emerald-400/60',
            bgColor: 'from-emerald-950/60 via-teal-950/40 to-black/60 hover:from-emerald-900/60',
            glowColor: 'from-emerald-600/10',
            onClick: handleLaunchEssentials,
        },
    ]

    return (
        <div className="w-full h-screen bg-[#0d0f17] text-white p-6 select-none font-sans overflow-y-auto scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <span className="text-2xl">{activeTab === 'widgets' ? '🧩' : '⚙️'}</span>
                            <h1 className="text-xl font-bold tracking-tight text-white">
                                {activeTab === 'widgets' ? 'DevPulse Desktop Widgets' : 'DevPulse Preferences & Settings'}
                            </h1>
                            {activeTab === 'widgets' && (
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                                    {activeWidgets.length} Active
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-white/50">
                            {activeTab === 'widgets'
                                ? 'Pick widgets to place directly on your laptop desktop wallpaper. Drag to position them anywhere.'
                                : 'Configure daily goals, screen time tracking, API integrations, and system startup.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="flex bg-white/[0.06] p-1 rounded-xl border border-white/10">
                            <button
                                onClick={() => setActiveTab('widgets')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    activeTab === 'widgets'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-white/60 hover:text-white'
                                }`}
                            >
                                <span>🧩</span>
                                <span>Widgets</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    activeTab === 'settings'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-white/60 hover:text-white'
                                }`}
                            >
                                <span>⚙️</span>
                                <span>Settings</span>
                            </button>
                        </div>

                        {activeTab === 'widgets' && (
                            <button
                                onClick={handleCloseAll}
                                className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 hover:text-rose-200 text-white/70 font-semibold text-xs border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer shrink-0"
                            >
                                🧹 Clear All
                            </button>
                        )}
                    </div>
                </div>

                {activeTab === 'settings' ? (
                    <div className="pt-2">
                        <SettingsPage />
                    </div>
                ) : (
                    <>
                        {/* ── PRESET LAUNCH CARDS ── */}
                        <div>
                            <div className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-3">
                                Quick Presets — One Click to Launch
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {PRESETS.map((preset) => (
                                    <button
                                        key={preset.key}
                                        onClick={preset.onClick}
                                        className={`group relative p-4 rounded-2xl border ${preset.borderColor} bg-gradient-to-br ${preset.bgColor} transition-all text-left cursor-pointer overflow-hidden shadow-lg`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${preset.glowColor} to-transparent pointer-events-none`} />
                                        <div className="text-2xl mb-1.5">{preset.emoji}</div>
                                        <div className="text-sm font-bold text-white mb-0.5">{preset.title}</div>
                                        <div className="text-[11px] text-white/60 leading-relaxed mb-3">
                                            {preset.description}
                                        </div>
                                        <div className="flex gap-1">
                                            {preset.icons.map((icon, i) => (
                                                <span key={i} className="text-[13px]">{icon}</span>
                                            ))}
                                        </div>
                                        <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold border ${preset.badgeColor}`}>
                                            {preset.badge}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filters & Search */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-2xl border border-white/10">
                                {(
                                    [
                                        { id: 'all', label: '🌟 All' },
                                        { id: 'utilities', label: '⌚ Utilities' },
                                        { id: 'developer', label: '💻 Developer' },
                                        { id: 'productivity', label: '⚡ Focus' },
                                        { id: 'ai', label: '🤖 AI' },
                                    ] as const
                                ).map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-3 py-1 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                                            selectedCategory === cat.id
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-white/60 hover:text-white'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search widgets..."
                                className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400 font-sans w-full sm:w-56"
                            />
                        </div>

                        {/* Grid of Widgets */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {filteredWidgets.map((item) => {
                                const isActive = activeWidgets.includes(item.id)
                                return (
                                    <div
                                        key={item.id}
                                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                                            isActive
                                                ? 'bg-blue-600/10 border-blue-500/40 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/20'
                                                : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{item.icon}</span>
                                                    <div>
                                                        <h3 className="text-xs font-bold text-white tracking-tight">
                                                            {item.name}
                                                        </h3>
                                                        <span className="text-[10px] font-mono text-white/40 uppercase">
                                                            {item.size}
                                                        </span>
                                                    </div>
                                                </div>
                                                {isActive && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                        LIVE
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-white/60 leading-relaxed mb-4">
                                                {item.description}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleToggle(item.id)}
                                            className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow flex items-center justify-center gap-1.5 ${
                                                isActive
                                                    ? 'bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30'
                                                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                                            }`}
                                        >
                                            {isActive ? (
                                                <>
                                                    <span>✕</span>
                                                    <span>Remove from Desktop</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>+</span>
                                                    <span>Place on Desktop</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Footer Tips */}
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-xs text-white/50 space-y-1">
                            <div className="font-semibold text-white/70">💡 Tips:</div>
                            <div>• <strong>Drag anywhere:</strong> Hover over any widget → drag handle appears → drag to reposition.</div>
                            <div>• <strong>Position saved:</strong> DevPulse remembers exactly where you placed each widget.</div>
                            <div>• <strong>Tray icon:</strong> Right-click the system tray icon to launch presets or toggle individual widgets.</div>
                            <div>• <strong>Canvas mode:</strong> Inside the app, press 🕷️ KevTech or 🏔️ MacBook buttons in the bottom bar.</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
