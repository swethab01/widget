import React, { useState } from 'react'

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
            <svg className="w-7 h-7 text-white" viewBox="0 0 41 41" fill="currentColor">
                <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.239-3.593 10.078 10.078 0 0 0-11.562 4.134 9.963 9.963 0 0 0-3.244 6.605 10.078 10.078 0 0 0-6.699 4.492 9.963 9.963 0 0 0 1.24 11.817 9.964 9.964 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.239 3.592 10.078 10.078 0 0 0 11.563-4.134 9.963 9.963 0 0 0 3.243-6.604 10.079 10.079 0 0 0 6.7-4.493 9.963 9.963 0 0 0-1.241-11.817zM22.498 37.886a7.474 7.474 0 0 1-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.49 7.496zM6.392 31.006a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744zM4.297 13.62A7.469 7.469 0 0 1 8.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.012L7.044 23.86a7.504 7.504 0 0 1-2.747-10.24zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 0 1 .114-.012l8.048 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.293 1.293 0 0 0-.647-1.13zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.0-4.645a7.497 7.497 0 0 1 11.135 7.763zm-21.063 6.929l-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.497v4.998l-4.331 2.5-4.331-2.5z" />
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
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
        ),
    },
    {
        id: 'vscode',
        name: 'VS Code',
        color: 'bg-[#181f30] border border-[#007acc]/40 shadow-[#007acc]/25',
        url: 'https://vscode.dev',
        icon: (
            <svg className="w-7 h-7" viewBox="0 0 100 100" fill="none">
                <path d="M70.91 99.32c1.58.61 3.37.57 4.96-.19l20.59-9.91C98.62 88.18 100 85.99 100 83.59V16.41c0-2.4-1.38-4.59-3.54-5.63L75.87.87C73.79-.13 71.34.12 69.51 1.45c-.26.19-.51.4-.74.63L29.36 38.04 12.19 25.01c-1.6-1.21-3.83-1.11-5.32.24L1.36 30.25c-1.81 1.66-1.82 4.51-.01 6.17L16.25 50 1.36 63.58c-1.81 1.66-1.81 4.51.01 6.17l5.51 5.01c1.48 1.35 3.72 1.45 5.32.24l17.16-13.04 39.42 35.96c.62.62 1.35 1.09 2.14 1.4zM75.02 27.3L45.11 50l29.91 22.7V27.3z" fill="white" opacity="0.08" />
                <path d="M96.46 10.8L75.86.88C73.47-.27 70.62.21 68.75 2.08L1.3 63.58c-1.81 1.65-1.81 4.51 0 6.17l5.51 5.01c1.49 1.35 3.73 1.45 5.33.24L93.36 13.37c2.73-2.07 6.64-.12 6.64 3.3V16.43c0-2.4-1.38-4.59-3.54-5.63z" fill="#0065A9" />
                <path d="M96.46 89.2L75.86 99.12c-2.39 1.15-5.24.67-7.11-1.2L1.3 36.42c-1.81-1.65-1.81-4.51 0-6.16l5.51-5.01c1.49-1.35 3.73-1.45 5.33-.24l81.22 61.62c2.73 2.07 6.64.13 6.64-3.29v.24c0 2.4-1.38 4.59-3.54 5.63z" fill="#007ACC" />
                <path d="M75.86 99.13c-2.39 1.15-5.24.66-7.11-1.21 2.31 2.31 6.25.67 6.25-2.59V4.67c0-3.26-3.94-4.9-6.25-2.59 1.87-1.87 4.72-2.35 7.11-1.21l20.6 9.91C98.62 11.82 100 14.01 100 16.41v67.18c0 2.4-1.38 4.59-3.54 5.63l-20.6 9.91z" fill="#1F9CF0" />
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
        color: 'bg-gradient-to-br from-[#0078d4] via-[#0091ea] to-[#00b4d8] shadow-[#0078d4]/40',
        url: 'https://www.microsoft.com/edge',
        icon: (
            <svg className="w-[30px] h-[30px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="edgeGrad1" x1="3.0" y1="10.234" x2="21.0" y2="10.234" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#1988D9" />
                        <stop offset="0.9" stopColor="#54B2E8" />
                    </linearGradient>
                    <linearGradient id="edgeGrad2" x1="11.174" y1="22.831" x2="11.174" y2="11.537" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#2AC3A2" />
                        <stop offset="1" stopColor="#10A589" />
                    </linearGradient>
                    <linearGradient id="edgeGrad3" x1="12" y1="2.5" x2="12" y2="21.0" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0C59A4" />
                        <stop offset="1" stopColor="#114A8B" />
                    </linearGradient>
                    <linearGradient id="edgeGrad4" x1="7.5" y1="14.5" x2="20.5" y2="7.0" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#53B4DF" />
                        <stop offset="0.7" stopColor="#9CEBFF" />
                    </linearGradient>
                </defs>
                {/* Outer e shape (dark blue base) */}
                <path d="M21.2 15.4c-.3.8-.8 1.5-1.4 2.1-1.5 1.5-3.5 2.4-5.8 2.5-.6 0-1.1 0-1.7-.1-1.1-.2-2.1-.7-3-1.3-.4-.3-.4-.8-.1-1.1.2-.2.5-.3.8-.2.6.2 1.3.4 2 .4 2.1.1 4.1-.7 5.5-2.2.7-.7 1.2-1.6 1.5-2.5.1-.4.5-.6.9-.5.4.1.5.5.3.9z" fill="url(#edgeGrad4)" />
                {/* Main E letter shape */}
                <path d="M12 2.5C7.3 2.5 3.5 6.3 3.5 11c0 2.6 1.2 4.9 3 6.4.4.3 1 .3 1.3-.1.3-.4.2-1-.1-1.3-1.4-1.2-2.2-2.9-2.2-4.9 0-3.6 2.9-6.5 6.5-6.5 3 0 5.6 2 6.3 4.8H14c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5h5.5c.3 0 .5-.2.5-.5 0-5.2-3.8-9.4-8-9.4z" fill="url(#edgeGrad3)" />
                {/* Green wave bottom */}
                <path d="M7.5 14.5c.5 1.5 1.6 2.8 3 3.6.8.5 1.7.8 2.6.9.4.1.9.1 1.3.1 3.1-.1 5.8-1.8 7.1-4.3.2-.5.1-1-.4-1.3s-1-.1-1.3.4c-1 1.9-3 3.2-5.4 3.2-.6 0-1.1-.1-1.7-.3-.8-.3-1.5-.8-2-1.5-.4-.6-1.1-.7-1.7-.3-.6.3-.7 1-.5 1.5z" fill="url(#edgeGrad2)" />
                {/* Light blue highlight */}
                <path d="M3.5 11c0-1.3.3-2.5.8-3.5C5.5 5.5 7.6 4 10 3.7c.5-.1.9-.5.9-1s-.4-.9-1-.9c-2.9.4-5.4 2.1-6.8 4.8-.7 1.3-1.1 2.8-1.1 4.4 0 4 2.4 7.5 5.9 9.1.5.2 1 0 1.3-.5.2-.5 0-1-.5-1.3C5.3 16.9 3.5 14.1 3.5 11z" fill="url(#edgeGrad1)" />
            </svg>
        ),
    },
    {
        id: 'brave',
        name: 'Brave',
        color: 'bg-gradient-to-br from-[#fb542b] via-[#ff6000] to-[#ff7a00] shadow-[#fb542b]/35',
        url: 'https://search.brave.com',
        icon: (
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.68 0l2.096 2.38s1.84-.512 2.709.358c.868.87 1.584 1.638 1.584 1.638l-.562 1.381.715 2.047s-2.104 7.98-2.35 8.955c-.486 1.919-.818 2.66-2.198 3.633-1.38.972-3.884 2.66-4.293 2.916-.409.256-.92.692-1.38.692-.46 0-.97-.436-1.38-.692a185.796 185.796 0 01-4.293-2.916c-1.38-.973-1.712-1.714-2.197-3.633-.247-.975-2.351-8.955-2.351-8.955l.715-2.047-.562-1.381s.716-.768 1.585-1.638c.868-.87 2.708-.358 2.708-.358L8.321 0h7.36zm-3.679 14.936c-.14 0-1.038.317-1.758.69-.72.373-1.242.637-1.409.742-.167.104-.065.301.087.409.152.107 2.194 1.69 2.393 1.866.198.175.489.464.687.464.198 0 .49-.29.688-.464.198-.175 2.24-1.759 2.392-1.866.152-.108.254-.305.087-.41-.167-.104-.689-.368-1.41-.741-.72-.373-1.617-.69-1.757-.69zm0-11.278s-.409.001-1.022.206-1.278.46-1.584.46c-.307 0-2.581-.434-2.581-.434S4.119 7.152 4.119 7.849c0 .697.339.881.68 1.243l2.02 2.149c.192.203.59.511.356 1.066-.235.555-.58 1.26-.196 1.977.384.716 1.042 1.194 1.464 1.115.421-.08 1.412-.598 1.776-.834.364-.237 1.518-1.19 1.518-1.554 0-.365-1.193-1.02-1.413-1.168-.22-.15-1.226-.725-1.247-.95-.02-.227-.012-.293.284-.851.297-.559.831-1.304.742-1.8-.089-.495-.95-.753-1.565-.986-.615-.232-1.799-.671-1.947-.74-.148-.068-.11-.133.339-.175.448-.043 1.719-.212 2.292-.052.573.16 1.552.403 1.632.532.079.13.149.134.067.579-.081.445-.5 2.581-.541 2.96-.04.38-.12.63.288.724.409.094 1.097.256 1.333.256s.924-.162 1.333-.256c.408-.093.329-.344.288-.723-.04-.38-.46-2.516-.541-2.961-.082-.445-.012-.45.067-.579.08-.129 1.059-.372 1.632-.532.573-.16 1.845.009 2.292.052.449.042.487.107.339.175-.148.069-1.332.508-1.947.74-.615.233-1.476.49-1.565.986-.09.496.445 1.241.742 1.8.297.558.304.624.284.85-.02.226-1.026.802-1.247.95-.22.15-1.413.804-1.413 1.169 0 .364 1.154 1.317 1.518 1.554.364.236 1.355.755 1.776.834.422.079 1.08-.4 1.464-1.115.384-.716.039-1.422-.195-1.977-.235-.555.163-.863.355-1.066l2.02-2.149c.341-.362.68-.546.68-1.243 0-.697-2.695-3.96-2.695-3.96s-2.274.436-2.58.436c-.307 0-.972-.256-1.585-.461-.613-.205-1.022-.206-1.022-.206z" />
            </svg>
        ),
    },
    {
        id: 'terminal',
        name: 'Terminal',
        color: 'bg-[#18181b] border border-white/20 shadow-black/50',
        icon: (
            <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none">
                <path d="M0 13h16V6H2C.9 6 0 6.9 0 8v5z" fill="#a1a1aa" />
                <path d="M32 6H16v7h16V6z" fill="#71717a" />
                <path d="M48 13H32V6h14c1.1 0 2 .9 2 2v5z" fill="#52525b" />
                <path d="M46 42H2c-1.1 0-2-.9-2-2V12h48v28c0 1.1-.9 2-2 2z" fill="#141416" />
                <path d="M15.2 24.3L6.4 33.1c-.5.5-.5 1.2 0 1.6l1.8 1.8c.5.5 1.2.5 1.6 0l8.8-8.8c.5-.5.5-1.2 0-1.6l-1.8-1.8c-.4-.4-1.2-.4-1.6 0z" fill="#38bdf8" />
                <path d="M9.8 17.3l8.8 8.8c.5.5.5 1.2 0 1.6l-1.8 1.8c-.5.5-1.2.5-1.6 0L6.4 20.7c-.5-.5-.5-1.2 0-1.6l1.8-1.8c.4-.4 1.2-.4 1.6 0z" fill="#0284c7" />
                <path d="M40 32H24c-.6 0-1 .4-1 1v3c0 .6.4 1 1 1h16c.6 0 1-.4 1-1v-3c0-.6-.4-1-1-1z" fill="#f4f4f5" />
            </svg>
        ),
    },
    {
        id: 'settings',
        name: 'Settings',
        color: 'bg-gradient-to-br from-[#475569] to-[#1e293b] border border-white/10 shadow-slate-900/50',
        icon: (
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L8.914 5.7c-.36.148-.704.325-1.028.528l-1.776-.872a1.875 1.875 0 00-2.317.587l-1.21 1.748a1.875 1.875 0 00.323 2.379l1.455 1.348a8.318 8.318 0 000 1.164l-1.455 1.348a1.875 1.875 0 00-.323 2.379l1.21 1.748c.552.797 1.616 1.05 2.317.587l1.776-.872c.324.203.668.38 1.028.528l.314 1.883c.151.904.933 1.567 1.85 1.567h2.42c.917 0 1.699-.663 1.85-1.567l.314-1.883c.36-.148.704-.325 1.028-.528l1.776.872a1.875 1.875 0 002.317-.587l1.21-1.748a1.875 1.875 0 00-.323-2.379l-1.455-1.348c.033-.385.033-.779 0-1.164l1.455-1.348a1.875 1.875 0 00.323-2.379l-1.21-1.748a1.875 1.875 0 00-2.317-.587l-1.776.872a8.317 8.317 0 00-1.028-.528l-.314-1.883a1.875 1.875 0 00-1.85-1.567h-2.42zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
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

