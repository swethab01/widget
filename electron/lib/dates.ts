/** Calendar date in the user's local timezone (YYYY-MM-DD). */
export function localDate(d: Date = new Date()): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

/** Monday of the current local week (YYYY-MM-DD). */
export function weekStartDate(d: Date = new Date()): string {
    const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const day = copy.getDay()
    const diff = day === 0 ? 6 : day - 1
    copy.setDate(copy.getDate() - diff)
    return localDate(copy)
}

export function addDays(dateStr: string, delta: number): string {
    const [y, m, d] = dateStr.split('-').map(Number)
    const dt = new Date(y, m - 1, d + delta)
    return localDate(dt)
}
