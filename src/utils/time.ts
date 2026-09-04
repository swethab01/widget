export function formatSeconds(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m`
    return `${s}s`
}

export function formatSecondsShort(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`
    return `${m}m`
}

export function formatTimer(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function getGreeting(name: string = 'Developer'): string {
    const hour = new Date().getHours()
    if (hour < 12) return `Good Morning, ${name}`
    if (hour < 17) return `Good Afternoon, ${name}`
    if (hour < 21) return `Good Evening, ${name}`
    return `Good Night, ${name}`
}

export function formatDate(date: Date = new Date()): string {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export function formatShortDate(date: Date = new Date()): string {
    return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
    })
}

export function timeAgo(dateStr: string): string {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH}h ago`
    return `${Math.floor(diffH / 24)}d ago`
}

export function getPriorityColor(priority: string): string {
    switch (priority) {
        case 'high': return 'text-red-400'
        case 'medium': return 'text-yellow-400'
        case 'low': return 'text-green-400'
        default: return 'text-gray-400'
    }
}

export function getPriorityDot(priority: string): string {
    switch (priority) {
        case 'high': return '🔴'
        case 'medium': return '🟡'
        case 'low': return '🟢'
        default: return '⚪'
    }
}
