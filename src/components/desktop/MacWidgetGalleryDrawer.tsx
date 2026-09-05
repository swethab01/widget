import { useState } from 'react'

export type WidgetCategory = 'all' | 'developer' | 'ai' | 'productivity' | 'utilities'

export interface WidgetCatalogItem {
    id: string
    name: string
    category: WidgetCategory
    icon: string
    size: 'Small' | 'Medium' | 'Large'
    description: string
}

export const WIDGET_CATALOG: WidgetCatalogItem[] = [
    {
        id: 'kev-clock',
        name: 'Apple Minimal Clock (White)',
        category: 'utilities',
        icon: '⌚',
        size: 'Small',
        description: 'Clean white watch face with perimeter tick marks and bold digital time.',
    },
    {
        id: 'kev-weather',
        name: 'Doha 23° Weather Card',
        category: 'utilities',
        icon: '🌦',
        size: 'Medium',
        description: 'Navy blue weather widget with Doha 23°, mostly clear, and hourly forecast.',
    },
    {
        id: 'kev-battery',
        name: 'Vertical 4-Ring Battery',
        category: 'utilities',
        icon: '🔋',
        size: 'Medium',
        description: 'Dark charcoal Apple battery widget with 4 concentric rings and Mac 94%.',
    },
    {
        id: 'kev-music',
        name: 'Dominic Fike - Mona Lisa (Now Playing)',
        category: 'utilities',
        icon: '🎵',
        size: 'Medium',
        description: 'Warm cream Now Playing widget with Across the Spider-Verse soundtrack.',
    },
    {
        id: 'kev-quote',
        name: 'Daniel 3:18 White Quote',
        category: 'utilities',
        icon: '💡',
        size: 'Small',
        description: '"AND IF NOT, HE IS STILL GOOD." DANIEL 3:18 white minimal quote card.',
    },
    {
        id: 'kev-calendar',
        name: 'Dark March 25 Calendar',
        category: 'utilities',
        icon: '📅',
        size: 'Medium',
        description: 'Dark theme calendar card with WEDNESDAY 25 and red circled date.',
    },
    {
        id: 'kev-cd',
        name: 'Transparent CD Jewel Case',
        category: 'utilities',
        icon: '💿',
        size: 'Small',
        description: 'Clear plastic jewel case with spinning red Spider-Man web disc.',
    },
    {
        id: 'kev-comic',
        name: 'Tall Spider-Man Comic Poster',
        category: 'utilities',
        icon: '🕷️',
        size: 'Medium',
        description: 'Vertical 2x4 dynamic comic art of Spider-Man swinging through skyscrapers.',
    },
    {
        id: 'kev-date',
        name: 'Spider-Man March 25 Tile',
        category: 'utilities',
        icon: '🕷️',
        size: 'Small',
        description: 'Spider-Man comic photo tile with neon green WEDNESDAY MARCH 25.',
    },
    {
        id: 'kev-photo',
        name: 'Sweet Recipe Photo Tile',
        category: 'utilities',
        icon: '📸',
        size: 'Small',
        description: 'Vintage photo card with red gradient and sweet recipe aesthetic.',
    },
    {
        id: 'leetcode',
        name: 'LeetCode Daily & Search',
        category: 'developer',
        icon: '⚡',
        size: 'Medium',
        description: 'Problem of the day, difficulty pill, streak counter, and LeetCode search.',
    },
    {
        id: 'chatgpt',
        name: 'ChatGPT Search Omnibar',
        category: 'ai',
        icon: '✦',
        size: 'Medium',
        description: 'Instant AI code questions, model selection, regex generator & search.',
    },
    {
        id: 'clock',
        name: 'Retro Flip Clock',
        category: 'utilities',
        icon: '🕒',
        size: 'Small',
        description: 'Mechanical split-flap clock with live seconds toggle and date badge.',
    },
    {
        id: 'tasks',
        name: "Today's Tasks",
        category: 'developer',
        icon: '📋',
        size: 'Medium',
        description: 'Interactive checklist with category filters, priority dots, and sprint launcher.',
    },
    {
        id: 'focus',
        name: 'Pomodoro Focus Timer',
        category: 'productivity',
        icon: '⏱',
        size: 'Small',
        description: 'Circular countdown ring with presets, pause/play, and 40Hz binaural sound.',
    },
    {
        id: 'score',
        name: 'Apple Activity Rings',
        category: 'developer',
        icon: '⭕',
        size: 'Small',
        description: 'Concentric rings for Tasks, Focus, and Coding momentum score.',
    },
    {
        id: 'goals',
        name: 'Weekly Habits & Goals',
        category: 'developer',
        icon: '🎯',
        size: 'Medium',
        description: 'Progress bars for LeetCode, GitHub commits, Focus hours, and Tasks.',
    },
    {
        id: 'battery',
        name: 'Battery & System Rings',
        category: 'utilities',
        icon: '🔋',
        size: 'Small',
        description: 'Battery health, CPU load, RAM usage, and power condition monitor.',
    },
    {
        id: 'weather',
        name: 'Weather Forecast',
        category: 'utilities',
        icon: '🌦',
        size: 'Small',
        description: 'Live temperature, conditions, and 5-hour weather forecast.',
    },
    {
        id: 'vinyl',
        name: 'Vinyl Hi-Fi Music Player',
        category: 'utilities',
        icon: '🎵',
        size: 'Small',
        description: 'Spinning vinyl turntable with ambient lofi music playback.',
    },
    {
        id: 'calendar',
        name: 'Mac Calendar',
        category: 'utilities',
        icon: '📅',
        size: 'Small',
        description: 'Monthly calendar view with today highlighted and remaining task count.',
    },
    {
        id: 'launchpad',
        name: 'Developer Launchpad',
        category: 'developer',
        icon: '🚀',
        size: 'Small',
        description: 'Quick app launcher for VS Code, Terminal, GitHub, Notes, and Settings.',
    },
    {
        id: 'quote',
        name: 'Daily Inspiration Mantra',
        category: 'utilities',
        icon: '💡',
        size: 'Small',
        description: 'Inspiring quotes for clarity, courage, and focused deep work.',
    },
    {
        id: 'screentime',
        name: 'Screen Time Analytics',
        category: 'productivity',
        icon: '📊',
        size: 'Medium',
        description: 'Active app breakdown: coding vs communication vs entertainment.',
    },
]

interface MacWidgetGalleryDrawerProps {
    isOpen: boolean
    onClose: () => void
    activeWidgetIds: string[]
    onToggleWidget: (widgetId: string) => void
    onResetLayout: () => void
}

export function MacWidgetGalleryDrawer({
    isOpen,
    onClose,
    activeWidgetIds,
    onToggleWidget,
    onResetLayout,
}: MacWidgetGalleryDrawerProps) {
    const [selectedCategory, setSelectedCategory] = useState<WidgetCategory>('all')
    const [searchQuery, setSearchQuery] = useState('')

    if (!isOpen) return null

    const filteredWidgets = WIDGET_CATALOG.filter((w) => {
        const matchesCategory =
            selectedCategory === 'all' || w.category === selectedCategory
        const matchesSearch =
            w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up select-none">
            {/* Backdrop Blur Bar */}
            <div className="max-w-6xl mx-auto mb-3 bg-[#161822]/90 backdrop-blur-3xl border border-white/15 rounded-3xl p-5 shadow-2xl shadow-black/80">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-lg">
                            🧩
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                                macOS Widget Gallery
                                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                                    {activeWidgetIds.length} on Screen
                                </span>
                            </h2>
                            <p className="text-xs text-white/50">
                                Pick widgets to place on your laptop screen. Drag them anywhere to arrange.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onResetLayout}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition-colors cursor-pointer border border-white/10"
                        >
                            Reset Default Layout
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg"
                        >
                            Done
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-1.5 mac-segmented-pill">
                        {(
                            [
                                { id: 'all', label: '🌟 All' },
                                { id: 'developer', label: '💻 Developer' },
                                { id: 'ai', label: '🤖 AI & Search' },
                                { id: 'productivity', label: '⚡ Productivity' },
                                { id: 'utilities', label: '🎧 Utilities' },
                            ] as const
                        ).map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-3 py-1 text-xs font-medium mac-segment-item cursor-pointer ${
                                    selectedCategory === cat.id
                                        ? 'mac-segment-active'
                                        : 'text-white/60 hover:text-white'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="w-full sm:w-64 relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter widgets..."
                            className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400 font-sans"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Widget Grid Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1 scrollbar-hide">
                    {filteredWidgets.map((item) => {
                        const isPlaced = activeWidgetIds.includes(item.id)
                        return (
                            <div
                                key={item.id}
                                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                                    isPlaced
                                        ? 'bg-blue-600/10 border-blue-500/40 shadow-sm shadow-blue-500/10'
                                        : 'bg-white/[0.04] border-white/10 hover:border-white/25 hover:bg-white/[0.07]'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{item.icon}</span>
                                            <span className="text-xs font-bold text-white">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.08] text-white/60">
                                            {item.size}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed mb-3">
                                        {item.description}
                                    </p>
                                </div>

                                <button
                                    onClick={() => onToggleWidget(item.id)}
                                    className={`w-full py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                        isPlaced
                                            ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                                    }`}
                                >
                                    {isPlaced ? '— Remove from Screen' : '+ Add to Screen'}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
