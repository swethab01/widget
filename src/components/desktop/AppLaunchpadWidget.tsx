interface AppLaunchpadWidgetProps {
    className?: string
    onOpenNotes?: () => void
    onOpenSettings?: () => void
}

interface AppIcon {
    name: string
    color: string
    icon: string
    url?: string
    action?: 'notes' | 'settings'
}

const APPS: AppIcon[] = [
    { name: 'VS Code', color: 'bg-gradient-to-br from-blue-500 to-sky-700', icon: '💻', url: 'vscode://' },
    { name: 'Terminal', color: 'bg-gradient-to-br from-neutral-800 to-neutral-950 border border-white/20', icon: '⚡' },
    { name: 'GitHub', color: 'bg-gradient-to-br from-purple-600 to-indigo-900', icon: '🐙', url: 'https://github.com' },
    { name: 'Browser', color: 'bg-gradient-to-br from-cyan-500 to-blue-600', icon: '🌐', url: 'https://google.com' },
    { name: 'Slack', color: 'bg-gradient-to-br from-rose-500 to-purple-700', icon: '💬' },
    { name: 'Spotify', color: 'bg-gradient-to-br from-emerald-500 to-green-700', icon: '🎵', url: 'spotify://' },
    { name: 'Notes', color: 'bg-gradient-to-br from-amber-400 to-yellow-600', icon: '📝', action: 'notes' },
    { name: 'Settings', color: 'bg-gradient-to-br from-slate-400 to-zinc-600', icon: '⚙️', action: 'settings' },
]

export function AppLaunchpadWidget({ className = '', onOpenNotes, onOpenSettings }: AppLaunchpadWidgetProps) {
    const handleAppClick = (app: AppIcon) => {
        if (app.action === 'notes' && onOpenNotes) {
            onOpenNotes()
            return
        }
        if (app.action === 'settings' && onOpenSettings) {
            onOpenSettings()
            return
        }
        if (app.url) {
            window.electronAPI.openExternal(app.url)
        }
    }

    return (
        <div className={`mac-widget-tile p-4 flex flex-col justify-between select-none ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-white/50 mb-2">
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mac-pulse-dot" />
                    <span className="font-semibold text-white/70">LAUNCHPAD</span>
                </div>
                <span className="text-[10px] text-white/40">DEV SUITE</span>
            </div>

            {/* 8-App Grid */}
            <div className="grid grid-cols-4 gap-3 py-1">
                {APPS.map((app, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAppClick(app)}
                        className="flex flex-col items-center group cursor-pointer"
                        title={`Open ${app.name}`}
                    >
                        <div
                            className={`w-11 h-11 rounded-[14px] ${app.color} flex items-center justify-center text-lg shadow-md transition-all duration-200 group-hover:scale-115 group-hover:shadow-lg group-active:scale-95`}
                        >
                            {app.icon}
                        </div>
                        <span className="text-[9px] text-white/70 font-medium tracking-tight mt-1 truncate max-w-[48px] group-hover:text-white transition-colors">
                            {app.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-white/40">
                <span>Quick Launch</span>
                <span className="text-blue-400">8 Apps</span>
            </div>
        </div>
    )
}
