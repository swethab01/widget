import { useState, useEffect, useCallback } from 'react'
import type { ScreenTimeSummary } from '../types'

const EMPTY: ScreenTimeSummary = {
    totalSeconds: 0,
    codingSeconds: 0,
    entertainmentSeconds: 0,
    communicationSeconds: 0,
    productiveSeconds: 0,
    apps: [],
}

export function useScreenTime() {
    const [summary, setSummary] = useState<ScreenTimeSummary>(EMPTY)
    const [loading, setLoading] = useState(true)

    const fetchSummary = useCallback(async () => {
        try {
            const data = await window.electronAPI.screenTime.getToday()
            setSummary(data || EMPTY)
        } catch {
            setSummary(EMPTY)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchSummary()

        const handleUpdate = (...args: unknown[]) => {
            const data = args[0] as ScreenTimeSummary
            if (data) setSummary(data)
        }

        window.electronAPI.on('screenTime:update', handleUpdate)
        return () => {
            window.electronAPI.off('screenTime:update', handleUpdate)
        }
    }, [fetchSummary])

    return { summary, loading, refresh: fetchSummary }
}
