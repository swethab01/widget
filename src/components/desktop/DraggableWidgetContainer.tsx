import { useState, useRef, useEffect, useCallback, ReactNode } from 'react'

interface DraggableWidgetContainerProps {
    id: string
    title: string
    initialX: number
    initialY: number
    zIndex: number
    isEditMode: boolean
    onPositionChange: (id: string, x: number, y: number) => void
    onBringToFront: (id: string) => void
    onClose: (id: string) => void
    children: ReactNode
}

export function DraggableWidgetContainer({
    id,
    title,
    initialX,
    initialY,
    zIndex,
    isEditMode,
    onPositionChange,
    onBringToFront,
    onClose,
    children,
}: DraggableWidgetContainerProps) {
    const [pos, setPos] = useState({ x: initialX, y: initialY })
    const [isDragging, setIsDragging] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const dragOffsetRef = useRef({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    // Keep state synchronized with prop updates if changed externally
    useEffect(() => {
        setPos({ x: initialX, y: initialY })
    }, [initialX, initialY])

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (e.button !== 0) return
            const target = e.target as HTMLElement
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'BUTTON' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable
            ) {
                return
            }

            onBringToFront(id)
            setIsDragging(true)
            dragOffsetRef.current = {
                x: e.clientX - pos.x,
                y: e.clientY - pos.y,
            }
            e.stopPropagation()
        },
        [id, onBringToFront, pos.x, pos.y]
    )

    useEffect(() => {
        if (!isDragging) return

        const handleMouseMove = (e: MouseEvent) => {
            const width = containerRef.current?.offsetWidth || 280
            const height = containerRef.current?.offsetHeight || 150
            const maxX = Math.max(10, window.innerWidth - width - 10)
            const maxY = Math.max(10, window.innerHeight - height - 10)

            const rawX = e.clientX - dragOffsetRef.current.x
            const rawY = e.clientY - dragOffsetRef.current.y

            const clampedX = Math.max(10, Math.min(maxX, rawX))
            const clampedY = Math.max(10, Math.min(maxY, rawY))

            setPos({ x: clampedX, y: clampedY })
        }

        const handleMouseUp = () => {
            setIsDragging(false)
            onPositionChange(id, pos.x, pos.y)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, id, onPositionChange, pos.x, pos.y])

    // Show the control handle when: hovered, dragging, or in edit mode
    const showHandle = isHovered || isDragging || isEditMode

    return (
        <div
            ref={containerRef}
            style={{
                transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
                zIndex: isDragging ? 100 : zIndex,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={() => onBringToFront(id)}
            className={`absolute top-0 left-0 group select-none ${
                isDragging
                    ? 'cursor-grabbing scale-[1.02] drop-shadow-2xl'
                    : 'cursor-grab'
            } ${
                isEditMode
                    ? 'ring-1 ring-blue-400/50 rounded-[24px] animate-widget-wiggle'
                    : ''
            }`}
        >
            {/* Hover-only floating control bar — appears above the widget */}
            <div
                className={`absolute -top-7 left-0 right-0 flex items-center justify-between px-2.5 h-7 rounded-t-[14px] z-10 transition-all duration-200 ${
                    showHandle
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-1 pointer-events-none'
                } ${
                    isDragging
                        ? 'bg-blue-600/80 backdrop-blur-xl border border-blue-400/40'
                        : 'bg-black/60 backdrop-blur-xl border border-white/15'
                }`}
                onMouseDown={handleMouseDown}
            >
                {/* Drag grip + widget name */}
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-white/40 text-[11px] leading-none">⠿</span>
                    <span className="text-[10px] font-medium text-white/70 truncate max-w-[120px]">
                        {title}
                    </span>
                </div>

                {/* Close button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onClose(id)
                    }}
                    className="w-4 h-4 rounded-full bg-rose-500 hover:bg-rose-400 text-white flex items-center justify-center text-[9px] font-bold cursor-pointer transition-all hover:scale-110 shadow-sm ml-2 shrink-0"
                    title="Remove Widget from Desktop"
                >
                    ✕
                </button>
            </div>

            {/* The actual widget content — no extra wrapper border */}
            <div className={`transition-transform duration-150 relative ${isDragging ? 'scale-[1.01]' : ''}`}>
                {children}

                {/* Floating Corner Close Button (visible on hover or edit mode) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onClose(id)
                    }}
                    className={`absolute top-2 right-2 w-5 h-5 rounded-full bg-rose-500/90 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all hover:scale-110 shadow-lg z-30 border border-white/20 ${
                        showHandle ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
                    }`}
                    title="Close and remove widget"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}
