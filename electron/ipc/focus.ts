import { ipcMain, BrowserWindow } from 'electron'
import { getDB } from '../database'
import { localDate } from '../lib/dates'
import { notify } from '../lib/notify'
import { recalculateScore } from './tasks'

interface FocusSession {
    taskId: number | null
    taskTitle: string
    durationMinutes: number
    startedAt: string
    remainingSeconds: number
    paused: boolean
    sessionId?: number
}

let activeSession: FocusSession | null = null
let tickInterval: ReturnType<typeof setInterval> | null = null

export function isFocusActive(): boolean {
    return Boolean(activeSession && !activeSession.paused)
}

function broadcastToWindows(channel: string, payload: unknown) {
    for (const win of BrowserWindow.getAllWindows()) {
        if (!win.isDestroyed()) {
            try {
                win.webContents.send(channel, payload)
            } catch {}
        }
    }
}

export function registerFocusIPC(_win?: BrowserWindow) {
    const db = getDB()

    ipcMain.handle('focus:start', (_e, taskId: number | null, minutes: number) => {
        if (tickInterval) clearInterval(tickInterval)

        let taskTitle = 'Focus Session'
        if (taskId) {
            const task = db.prepare('SELECT title FROM tasks WHERE id = ?').get(taskId) as { title: string } | undefined
            if (task) taskTitle = task.title
        }

        const startedAt = new Date().toISOString()
        const result = db.prepare(`
      INSERT INTO focus_sessions (task_id, task_title, duration_minutes, started_at)
      VALUES (?, ?, ?, datetime('now','localtime'))
    `).run(taskId, taskTitle, minutes)

        activeSession = {
            taskId,
            taskTitle,
            durationMinutes: minutes,
            startedAt,
            remainingSeconds: minutes * 60,
            paused: false,
            sessionId: result.lastInsertRowid as number,
        }

        startTick()
        return { success: true, session: activeSession }
    })

    ipcMain.handle('focus:pause', () => {
        if (!activeSession) return { success: false }
        activeSession.paused = true
        if (tickInterval) clearInterval(tickInterval)
        return { success: true }
    })

    ipcMain.handle('focus:resume', () => {
        if (!activeSession) return { success: false }
        activeSession.paused = false
        startTick()
        return { success: true }
    })

    ipcMain.handle('focus:stop', () => {
        if (!activeSession) return { success: false }
        if (tickInterval) clearInterval(tickInterval)
        const elapsed = Math.round(
            (activeSession.durationMinutes * 60 - activeSession.remainingSeconds) / 60
        )
        db.prepare(`
      UPDATE focus_sessions
      SET ended_at = datetime('now','localtime'), completed = 0
      WHERE id = ?
    `).run(activeSession.sessionId)
        const session = { ...activeSession, elapsed }
        activeSession = null
        recalculateScore()
        return { success: true, session }
    })

    ipcMain.handle('focus:getActive', () => activeSession)

    ipcMain.handle('focus:getHistory', () => {
        const today = localDate()
        return db.prepare(`
      SELECT * FROM focus_sessions
      WHERE date(started_at) = ?
      ORDER BY started_at DESC
    `).all(today)
    })
}

function startTick() {
    tickInterval = setInterval(() => {
        if (!activeSession || activeSession.paused) return

        activeSession.remainingSeconds -= 1

        broadcastToWindows('focus:tick', {
            remainingSeconds: activeSession.remainingSeconds,
            durationMinutes: activeSession.durationMinutes,
            taskTitle: activeSession.taskTitle,
            paused: false,
        })

        if (activeSession.remainingSeconds <= 0) {
            clearInterval(tickInterval!)
            const db = getDB()
            db.prepare(`
        UPDATE focus_sessions
        SET ended_at = datetime('now','localtime'), completed = 1
        WHERE id = ?
      `).run(activeSession.sessionId)
            const title = activeSession.taskTitle
            broadcastToWindows('focus:complete', { taskTitle: title })
            notify('Focus session complete', title ? `Finished: ${title}` : 'Nice work. Take a short break.')
            activeSession = null
            recalculateScore()
        }
    }, 1000)
}
