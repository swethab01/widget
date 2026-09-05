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
    const dragOffsetRef = useRef({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    // Keep state synchronized with prop updates if changed externally
    useEffect(() => {
        setPos({ x: initialX, y: initialY })
    }, [initialX, initialY])

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            // Only drag on left click and avoid inner inputs or buttons
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
            const maxX = Math.max(0, window.innerWidth - 300)
            const maxY = Math.max(0, window.innerHeight - 150)

            const rawX = e.clientX - dragOffsetRef.current.x
            const rawY = e.clientY - dragOffsetRef.current.y

            // Constrain within visible screen bounds (allowing smooth movement)
            const clampedX = Math.max(10, Math.min(maxX, rawX))
            const clampedY = Math.max(36, Math.min(maxY, rawY)) // 36px below Mac Menu Bar

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

    return (
        <div
            ref={containerRef}
            style={{
                transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
                zIndex: isDragging ? 100 : zIndex,
            }}
            onMouseDown={() => onBringToFront(id)}
            className={`absolute top-0 left-0 transition-shadow duration-150 ${
                isDragging
                    ? 'cursor-grabbing scale-[1.02] shadow-2xl ring-1 ring-white/30'
                    : 'cursor-grab'
            } ${
                isEditMode
                    ? 'ring-1 ring-blue-400/40 hover:ring-blue-400/80 rounded-[22px]'
                    : ''
            }`}
        >
            {/* Top Drag Handle Grip Bar */}
            <div
                onMouseDown={handleMouseDown}
                className={`flex items-center justify-between px-3 py-1 bg-black/40 backdrop-blur-md border-t border-x border-white/10 rounded-t-[20px] text-[10px] font-mono text-white/50 select-none ${
                    isDragging ? 'bg-blue-600/30 text-white' : 'hover:text-white/80'
                }`}
            >
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-white/40 tracking-tighter">⋮⋮</span>
                    <span className="font-medium text-white/70">{title}</span>
                </div>

                <div className="flex items-center gap-2">
                    {isEditMode ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onClose(id)
                            }}
                            className="w-4 h-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center cursor-pointer shadow"
                            title="Remove Widget from Desktop"
                        >
                            ✕
                        </button>
                    ) : (
                        <span className="text-[9px] text-white/30 opacity-0 group-hover:opacity-100 transition-opacity">
                            drag to move
                        </span>
                    )}
                </div>
            </div>

            {/* Render Actual Widget Component */}
            <div className="rounded-b-[20px] overflow-hidden">{children}</div>
        </div>
    )
}
