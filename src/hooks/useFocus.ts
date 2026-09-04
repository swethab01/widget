import { useState, useEffect, useCallback } from 'react'
import type { FocusState } from '../types'

export function useFocus() {
    const [focusState, setFocusState] = useState<FocusState | null>(null)
    const [sessions, setSessions] = useState<number>(0)
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        // Fetch any active session on mount
        window.electronAPI.focus.getActive().then((active) => {
            if (active) setFocusState(active)
        })

        // Count today's sessions
        window.electronAPI.focus.getHistory().then((history) => {
            setSessions(history.filter((s) => s.completed).length)
        })

        const handleTick = (...args: unknown[]) => {
            const data = args[0] as FocusState
            setFocusState(data)
        }

        const handleComplete = () => {
            setFocusState(null)
            setIsComplete(true)
            setSessions((s) => s + 1)
            setTimeout(() => setIsComplete(false), 4000)
        }

        window.electronAPI.on('focus:tick', handleTick)
        window.electronAPI.on('focus:complete', handleComplete)

        return () => {
            window.electronAPI.off('focus:tick', handleTick)
            window.electronAPI.off('focus:complete', handleComplete)
        }
    }, [])

    const start = useCallback(async (taskId: number | null, minutes: number) => {
        await window.electronAPI.focus.start(taskId, minutes)
        setFocusState({
            remainingSeconds: minutes * 60,
            durationMinutes: minutes,
            taskTitle: 'Focus Session',
            paused: false,
        })
    }, [])

    const pause = useCallback(async () => {
        await window.electronAPI.focus.pause()
        setFocusState((s) => s ? { ...s, paused: true } : s)
    }, [])

    const resume = useCallback(async () => {
        await window.electronAPI.focus.resume()
        setFocusState((s) => s ? { ...s, paused: false } : s)
    }, [])

    const stop = useCallback(async () => {
        await window.electronAPI.focus.stop()
        setFocusState(null)
    }, [])

    const progress = focusState
        ? 1 - focusState.remainingSeconds / (focusState.durationMinutes * 60)
        : 0

    return { focusState, sessions, isComplete, start, pause, resume, stop, progress }
}
