import { useState, useEffect, useRef, useCallback } from 'react'
import type { Task, WidgetMode } from '../types'

export interface CommandItem {
    id: string
    category: string
    title: string
    subtitle?: string
    icon: string
    action: () => void
    shortcut?: string
}

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
    tasks: Task[]
    onNav: (page: string) => void
    onModeChange: (mode: WidgetMode) => void
    onStartFocus: (taskId: number | null, minutes: number) => void
    onSetSound?: (sound: 'off' | 'binaural' | 'brown' | 'rain') => void
}

export function CommandPalette({
    isOpen,
    onClose,
    tasks,
    onNav,
    onModeChange,
    onStartFocus,
}: CommandPaletteProps) {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (isOpen) {
            setQuery('')
            setSelectedIndex(0)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isOpen])

    const commands: CommandItem[] = [
        // Navigation
        { id: 'nav-today', category: 'Navigation', title: 'Go to Today Dashboard', icon: '🏠', action: () => onNav('dashboard'), shortcut: '1' },
        { id: 'nav-notes', category: 'Navigation', title: 'Open Scratchpad & Code Notes', icon: '📝', action: () => onNav('scratchpad'), shortcut: '2' },
        { id: 'nav-stats', category: 'Navigation', title: 'View Productivity Analytics', icon: '📊', action: () => onNav('analytics'), shortcut: '3' },
        { id: 'nav-settings', category: 'Navigation', title: 'Open Settings', icon: '⚙️', action: () => onNav('settings'), shortcut: '4' },

        // Focus & Timer
        { id: 'focus-25', category: 'Focus Mode', title: 'Start 25m Focus Block (Pomodoro)', subtitle: 'Standard deep work sprint', icon: '🎯', action: () => onStartFocus(null, 25) },
        { id: 'focus-50', category: 'Focus Mode', title: 'Start 50m Deep Flow Block', subtitle: 'Extended uninterrupted session', icon: '⚡', action: () => onStartFocus(null, 50) },
        { id: 'focus-90', category: 'Focus Mode', title: 'Start 90m Flow State Block', subtitle: 'Ultra-focus architecture sprint', icon: '🌊', action: () => onStartFocus(null, 90) },

        // Window Mode
        { id: 'mode-canvas', category: 'macOS Layout', title: 'Switch to Full Desktop Canvas', subtitle: 'Authentic macOS wallpaper & desktop widgets (1260×840)', icon: '🖥️', action: () => onModeChange('canvas') },
        { id: 'mode-expanded', category: 'macOS Layout', title: 'Switch to Expanded Cockpit', subtitle: 'Dual-pane desktop workspace (960×720)', icon: '🪟', action: () => onModeChange('expanded') },
        { id: 'mode-normal', category: 'macOS Layout', title: 'Switch to Sidebar Widget', subtitle: 'Compact vertical bar (440×700)', icon: '📱', action: () => onModeChange('normal') },
        { id: 'mode-compact', category: 'macOS Layout', title: 'Switch to 2×2 Floating Tile', subtitle: 'Minimalist desktop ring tile (340×240)', icon: '✨', action: () => onModeChange('compact') },
        { id: 'pin-window', category: 'macOS Layout', title: 'Toggle Pin Always-on-Top', icon: '📌', action: () => window.electronAPI?.window?.setAlwaysOnTop(true) },

        // Active Tasks
        ...tasks.filter((t) => t.status === 'todo').map((t) => ({
            id: `task-${t.id}`,
            category: 'Tasks',
            title: `Focus on "${t.title}"`,
            subtitle: `${t.priority.toUpperCase()} priority • ${t.category} • ${t.est_minutes}m est`,
            icon: t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢',
            action: () => {
                onNav('dashboard')
                onStartFocus(t.id, t.est_minutes || 25)
            },
        })),
    ]

    const filtered = commands.filter((cmd) => {
        if (!query.trim()) return true
        const text = `${cmd.title} ${cmd.category} ${cmd.subtitle || ''}`.toLowerCase()
        return text.includes(query.toLowerCase())
    })

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
            } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length))
            } else if (e.key === 'Enter') {
                e.preventDefault()
                if (filtered[selectedIndex]) {
                    filtered[selectedIndex].action()
                    onClose()
                }
            }
        },
        [filtered, selectedIndex, onClose]
    )

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-[24px] bg-[#1a1d26]/85 backdrop-blur-3xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col animate-slide-up"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                {/* Search Bar Input (macOS Spotlight style) */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
                    <span className="text-base text-white/50">🔍</span>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search tasks, start focus, switch layout (Spotlight)..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setSelectedIndex(0)
                        }}
                        className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none font-medium tracking-tight"
                    />
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-white/40 bg-white/[0.06] rounded border border-white/10">
                        ESC
                    </kbd>
                </div>

                {/* Results List */}
                <div className="max-h-80 overflow-y-auto p-2 space-y-1 scrollbar-hide">
                    {filtered.length > 0 ? (
                        filtered.map((item, idx) => {
                            const isSelected = idx === selectedIndex
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        item.action()
                                        onClose()
                                    }}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-100 ${
                                        isSelected
                                            ? 'bg-blue-600/30 text-white border border-blue-500/30 shadow-sm'
                                            : 'text-white/80 hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 truncate">
                                        <span className="text-base">{item.icon}</span>
                                        <div className="truncate">
                                            <div className="text-xs font-semibold leading-tight">{item.title}</div>
                                            {item.subtitle && (
                                                <div className="text-[10px] text-white/40 truncate mt-0.5">{item.subtitle}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                        <span className="text-[9px] uppercase tracking-wider font-mono text-white/30 bg-white/[0.04] px-1.5 py-0.5 rounded">
                                            {item.category}
                                        </span>
                                        {item.shortcut && (
                                            <kbd className="text-[9px] font-mono text-white/50 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/10">
                                                ⌘{item.shortcut}
                                            </kbd>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="py-8 text-center text-xs text-white/40 font-medium">
                            No matching actions found for "{query}"
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                <div className="flex items-center justify-between px-4 py-2 bg-black/30 border-t border-white/5 text-[10px] text-white/40 font-mono">
                    <div className="flex items-center gap-3">
                        <span>↑↓ Navigate</span>
                        <span>↵ Select</span>
                    </div>
                    <span>Spotlight Quick Launcher</span>
                </div>
            </div>
        </div>
    )
}
