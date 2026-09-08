import React from 'react'

interface AppLaunchpadWidgetProps {
    className?: string
    onClose?: () => void
    onOpenNotes?: () => void
    onOpenSettings?: () => void
}

interface AppItem {
    id: string
    name: string
    color: string
    icon: React.ReactNode
    url?: string
}

const APPS: AppItem[] = [
    {
        id: 'chatgpt',
        name: 'ChatGPT',
        color: 'bg-[#10a37f] shadow-[#10a37f]/30',
        url: 'https://chatgpt.com',
        icon: (
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.578 9.07a5.955 5.955 0 0 0-.48-3.666 6.046 6.046 0 0 0-4.04-3.11 6.033 6.033 0 0 0-5.32 1.258 6.038 6.038 0 0 0-4.498.053 6.048 6.048 0 0 0-3.37 3.824 6.03 6.03 0 0 0 .546 5.437 5.958 5.958 0 0 0-.48 3.667 6.047 6.047 0 0 0 4.04 3.11 6.033 6.033 0 0 0 5.32-1.258 6.04 6.04 0 0 0 4.498-.053 6.048 6.048 0 0 0 3.37-3.824 6.03 6.03 0 0 0-.546-5.438zm-8.318 11.23a4.57 4.57 0 0 1-2.91-1.042l.142-.08 3.498-2.02a.76.76 0 0 0 .383-.664v-4.94l1.488.86v4.067a4.58 4.58 0 0 1-2.6 3.82zm-7.697-3.32a4.568 4.568 0 0 1-.546-3.05l.143.085 3.497 2.02a.768.768 0 0 0 .767 0l4.278-2.47v1.72l-3.52 2.032a4.58 4.58 0 0 1-4.619-.337zm-1.12-8.37a4.569 4.569 0 0 1 2.365-2.008V9.1a.76.76 0 0 0 .383.663l4.28 2.47-1.488.86-3.52-2.033a4.583 4.583 0 0 1-2.02-4.46zm14.493 3.61l-4.278-2.47 1.488-.86 3.52 2.033a4.58 4.58 0 0 1 2.02 4.46 4.57 4.57 0 0 1-2.365 2.008v-2.498a.76.76 0 0 0-.385-.663zm2.502-3.23l-.143-.085-3.498-2.02a.768.768 0 0 0-.767 0l-4.278 2.47V7.635l3.52-2.032a4.58 4.58 0 0 1 5.165 3.385v.002zm-9.84-2.54a4.57 4.57 0 0 1 2.91 1.042l-.142.08-3.498 2.02a.76.76 0 0 0-.383.664v4.94l-1.488-.86V7.27a4.58 4.58 0 0 1 2.6-3.82z" />
            </svg>
        ),
    },
    {
        id: 'github',
        name: 'GitHub',
        color: 'bg-[#181717] border border-white/20 shadow-black/50',
        url: 'https://github.com',
        icon: (
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
        ),
    },
    {
        id: 'vscode',
        name: 'VS Code',
        color: 'bg-gradient-to-br from-[#007acc] to-[#005a9e] shadow-[#007acc]/30',
        url: 'https://vscode.dev',
        icon: (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                <path d="M17.5 2.5L7.5 11.5L4 8.5L2 9.8V14.2L4 15.5L7.5 12.5L17.5 21.5L22 19.3V4.7L17.5 2.5Z" fill="#005A9E" />
                <path d="M17.5 2.5L13.5 6.5L7.5 11.5L4 8.5L2 9.8V14.2L4 15.5L7.5 12.5L13.5 17.5L17.5 21.5V2.5Z" fill="#007ACC" />
                <path d="M22 4.7V19.3L17.5 21.5V2.5L22 4.7Z" fill="#38BDF8" />
            </svg>
        ),
    },
    {
        id: 'antigravity',
        name: 'Antigravity',
        color: 'bg-gradient-to-br from-[#7928ca] via-[#6366f1] to-[#3b82f6] shadow-purple-600/35',
        url: 'https://antigravity.google',
        icon: (
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeDasharray="3 2" />
                <path d="M12 5L16 14H8L12 5Z" fill="#ffffff" />
                <circle cx="12" cy="17" r="1.5" fill="#38bdf8" />
            </svg>
        ),
    },
    {
        id: 'edge',
        name: 'Edge',
        color: 'bg-gradient-to-br from-[#0078d7] via-[#00b4d8] to-[#10b981] shadow-[#0078d7]/30',
        url: 'https://www.bing.com',
        icon: (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                <path d="M21.8 11.2C21.4 6.8 17.7 3.4 13.1 3.4C8.2 3.4 4.2 7.4 4.2 12.3C4.2 13.9 4.6 15.4 5.4 16.7C5.1 16 4.9 15.2 4.9 14.3C4.9 11 7.6 8.3 109 8.3C15.2 8.3 17.8 11.5 17.8 15C17.8 18.2 15.4 20.6 12.4 20.6C10.7 20.6 9.1 19.8 8.1 18.5C9.4 19.8 11.2 20.6 13.1 20.6C17.8 20.6 21.6 16.9 21.8 11.2Z" fill="#ffffff" />
            </svg>
        ),
    },
    {
        id: 'brave',
        name: 'Brave',
        color: 'bg-gradient-to-br from-[#fb542b] to-[#ff7a00] shadow-[#fb542b]/35',
        url: 'https://search.brave.com',
        icon: (
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6V11.5C4 16.5 7.5 21 12 22C16.5 21 20 16.5 20 11.5V6L12 2Z" fill="#ffffff" />
                <path d="M12 5L6.5 7.5V11.5C6.5 14.8 9 18.2 12 19.5C15 18.2 17.5 14.8 17.5 11.5V7.5L12 5Z" fill="#FB542B" />
                <path d="M12 8L10 10.5L10.8 14L12 13.2L13.2 14L14 10.5L12 8Z" fill="#ffffff" />
            </svg>
        ),
    },
    {
        id: 'terminal',
        name: 'Terminal',
        color: 'bg-[#18181b] border border-white/20 shadow-black/50',
        icon: (
            <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24" fill="none">
                <path d="M5 8L9.5 12L5 16" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="16" x2="18" y2="16" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 'settings',
        name: 'Settings',
        color: 'bg-gradient-to-br from-[#4b5563] to-[#1f2937] shadow-slate-900/50',
        icon: (
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="#ffffff" strokeWidth="2" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
]

export function AppLaunchpadWidget({
    className = '',
    onClose,
    onOpenSettings,
}: AppLaunchpadWidgetProps) {
    const [activeAppId, setActiveAppId] = useState<string | null>(null)

    const handleAppClick = (app: AppItem) => {
        // Immediate visual press & glow feedback
        setActiveAppId(app.id)
        setTimeout(() => setActiveAppId(null), 350)

        if (app.id === 'settings') {
            if (onOpenSettings) {
                onOpenSettings()
            } else if (window.electronAPI?.widgets?.openSettings) {
                window.electronAPI.widgets.openSettings()
            } else if (window.electronAPI?.widgets?.openManager) {
                window.electronAPI.widgets.openManager('settings')
            } else if (window.electronAPI?.launchApp) {
                window.electronAPI.launchApp('settings')
            }
            return
        }

        if (window.electronAPI?.launchApp) {
            window.electronAPI.launchApp(app.id)
        } else if (app.url) {
            if (window.electronAPI?.openExternal) {
                window.electronAPI.openExternal(app.url)
            } else {
                window.open(app.url, '_blank')
            }
        }
    }

    return (
        <div
            className={`w-[320px] h-[164px] bg-[#1a1a1c] rounded-[28px] p-4 flex flex-col justify-center select-none relative group border border-white/[0.08] shadow-[0_16px_36px_rgba(0,0,0,0.7)] overflow-hidden font-sans ${className}`}
            style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif',
                WebkitAppRegion: 'drag',
            } as React.CSSProperties}
        >
            {/* Red Close Button on Hover */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#ff453a] hover:bg-[#ff3b30] text-white font-bold text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-pointer shadow"
                    title="Close Launcher"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                    ✕
                </button>
            )}

            {/* EXACT MATCH TO USER REFERENCE IMAGE: Pure 4x2 Squircle App Grid */}
            <div
                className="grid grid-cols-4 gap-x-4 gap-y-3.5 items-center justify-items-center w-full"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
                {APPS.map((app) => {
                    const isPressed = activeAppId === app.id
                    return (
                        <button
                            key={app.id}
                            onClick={() => handleAppClick(app)}
                            className={`group/btn relative flex items-center justify-center cursor-pointer transition-all duration-150 ${
                                isPressed ? 'scale-90 brightness-125' : 'hover:scale-108 active:scale-95'
                            }`}
                            title={`Open ${app.name}`}
                        >
                            <div
                                className={`w-[52px] h-[52px] rounded-[16px] ${app.color} flex items-center justify-center shadow-lg transition-all duration-200 group-hover/btn:shadow-2xl overflow-hidden relative ${
                                    isPressed ? 'ring-2 ring-white/60' : ''
                                }`}
                            >
                                {app.icon}
                                {isPressed && (
                                    <div className="absolute inset-0 bg-white/20 animate-ping rounded-[16px] pointer-events-none" />
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

