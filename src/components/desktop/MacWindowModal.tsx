import React from 'react'

interface MacWindowModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    icon?: string
    children: React.ReactNode
}

export function MacWindowModal({
    isOpen,
    onClose,
    title,
    icon = '✦',
    children,
}: MacWindowModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/40 backdrop-blur-sm animate-fade-in select-none">
            {/* Window frame */}
            <div className="w-full max-w-4xl max-h-[85vh] bg-[#12141c]/95 backdrop-blur-3xl border border-white/15 rounded-[24px] shadow-[0_25px_70px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-scale-up">
                {/* macOS Titlebar */}
                <div className="h-10 px-4 bg-white/[0.04] border-b border-white/[0.08] flex items-center justify-between">
                    {/* Traffic Lights */}
                    <div className="flex items-center gap-2 mac-traffic-container">
                        <button
                            onClick={onClose}
                            className="mac-traffic-light traffic-red cursor-pointer"
                            title="Close window"
                        >
                            <span>✕</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="mac-traffic-light traffic-yellow cursor-pointer"
                            title="Minimize"
                        >
                            <span>−</span>
                        </button>
                        <button
                            className="mac-traffic-light traffic-green cursor-pointer"
                            title="Zoom"
                        >
                            <span>+</span>
                        </button>
                    </div>

                    {/* Window Title */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-white/90 font-sans tracking-tight">
                        <span className="opacity-70">{icon}</span>
                        <span>{title}</span>
                    </div>

                    {/* Close action button */}
                    <button
                        onClick={onClose}
                        className="px-2.5 py-0.5 rounded-full bg-white/[0.08] hover:bg-white/15 text-white/70 hover:text-white text-[10px] font-mono transition-colors cursor-pointer"
                    >
                        esc
                    </button>
                </div>

                {/* Window Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-hide text-white">
                    {children}
                </div>
            </div>
        </div>
    )
}
