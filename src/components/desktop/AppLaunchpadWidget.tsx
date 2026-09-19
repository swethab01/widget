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
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z" />
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
                <path d="M96.46 10.8L75.86.88C73.47-.27 70.62.21 68.75 2.08L1.3 63.58c-1.81 1.66-1.81 4.51 0 6.17l5.51 5.01c1.49 1.35 3.73 1.45 5.33.24L93.36 13.37c2.73-2.07 6.64-.12 6.64 3.3V16.43c0-2.4-1.38-4.59-3.54-5.63z" fill="#0065A9" />
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
        id: 'leetcode',
        name: 'LeetCode',
        color: 'bg-gradient-to-br from-[#ffa116] via-[#ff9500] to-[#ea580c] shadow-[#ffa116]/35',
        url: 'https://leetcode.com',
        icon: (
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
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

