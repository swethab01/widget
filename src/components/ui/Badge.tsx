interface BadgeProps {
    children: React.ReactNode
    variant?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
    size?: 'sm' | 'xs'
}

const VARIANTS = {
    blue: 'bg-accent-dim text-accent',
    green: 'bg-green-900/40 text-accent-green',
    yellow: 'bg-yellow-900/40 text-yellow-400',
    red: 'bg-red-900/40 text-red-400',
    purple: 'bg-purple-900/40 text-accent-purple',
    gray: 'bg-surface-border text-text-secondary',
}

export function Badge({ children, variant = 'blue', size = 'sm' }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center rounded-md font-medium ${VARIANTS[variant]} ${size === 'xs' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs'}`}
        >
            {children}
        </span>
    )
}
