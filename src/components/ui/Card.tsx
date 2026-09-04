import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
    onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
    return (
        <div
            className={`relative rounded-[22px] bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.35)] p-3.5 transition-all duration-200 overflow-hidden ${
                onClick ? 'cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.14] active:scale-[0.99]' : ''
            } ${className}`}
            onClick={onClick}
        >
            {/* Top rim reflection highlight */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
            {children}
        </div>
    )
}
