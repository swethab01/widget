import { ipcMain } from 'electron'
import { getDB } from '../database'
import { localDate } from '../lib/dates'
import { computeStreakDays, syncWeeklyGoals } from '../services/PulseEngine'

interface Task {
    id: number
    title: string
    priority: 'high' | 'medium' | 'low'
    category: string
    status: 'todo' | 'done'
    due_time: string | null
    est_minutes: number
    actual_minutes: number
    created_at: string
    completed_at: string | null
}

interface NewTask {
    title: string
    priority?: 'high' | 'medium' | 'low'
    category?: string
    due_time?: string
    est_minutes?: number
}

export function registerTaskIPC() {
    const db = getDB()

    ipcMain.handle('tasks:getAll', () => {
        return db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all()
    })

    ipcMain.handle('tasks:getToday', () => {
        const today = localDate()
        return db.prepare(`
      SELECT * FROM tasks
      WHERE date(created_at) = ? OR status = 'todo'
      ORDER BY
        CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
        est_minutes ASC,
        created_at DESC
    `).all(today)
    })

    ipcMain.handle('tasks:add', (_e, task: NewTask) => {
        const stmt = db.prepare(`
      INSERT INTO tasks (title, priority, category, due_time, est_minutes)
      VALUES (@title, @priority, @category, @due_time, @est_minutes)
    `)
        const result = stmt.run({
            title: task.title,
            priority: task.priority || 'medium',
            category: task.category || 'General',
            due_time: task.due_time || null,
            est_minutes: task.est_minutes || 25,
        })
        return db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid)
    })

    ipcMain.handle('tasks:update', (_e, id: number, patch: Partial<Task>) => {
        const allowed = ['title', 'priority', 'category', 'due_time', 'est_minutes', 'status']
        const fields = Object.keys(patch).filter((k) => allowed.includes(k))
        if (fields.length === 0) return null

        const sets = fields.map((f) => `${f} = @${f}`).join(', ')
        db.prepare(`UPDATE tasks SET ${sets} WHERE id = @id`).run({ ...patch, id })
        return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    })

    ipcMain.handle('tasks:delete', (_e, id: number) => {
        db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
        return { success: true }
    })

    ipcMain.handle('tasks:complete', (_e, id: number) => {
        db.prepare(`
      UPDATE tasks
      SET status = 'done', completed_at = datetime('now','localtime')
      WHERE id = ?
    `).run(id)
        recalculateScore()
        return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    })

    // Goals IPC
    ipcMain.handle('goals:getAll', () => {
        return db.prepare('SELECT * FROM goals').all()
    })

    ipcMain.handle('goals:set', (_e, type: string, target: number) => {
        db.prepare('UPDATE goals SET target = ? WHERE type = ?').run(target, type)
        return { success: true }
    })
}

function recalculateScore() {
    const db = getDB()
    const today = localDate()
    syncWeeklyGoals()

    const tasks = db.prepare(`
    SELECT COUNT(*) as total,
           SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as done
    FROM tasks
    WHERE date(created_at) = ? OR date(completed_at) = ?
  `).get(today, today) as { total: number; done: number }

    const tasksPts = tasks.total > 0 ? Math.round((tasks.done / tasks.total) * 25) : 0

    const focusSessions = db.prepare(`
    SELECT COUNT(*) as cnt FROM focus_sessions
    WHERE date(started_at) = ? AND completed = 1
  `).get(today) as { cnt: number }
    const focusPts = Math.min(focusSessions.cnt * 5, 20)

    const appUsage = db.prepare(`
    SELECT COALESCE(SUM(duration_seconds), 0) as secs
    FROM app_usage WHERE date = ? AND category = 'Development'
  `).get(today) as { secs: number }
    const codingHours = appUsage.secs / 3600
    const codingPts = Math.min(Math.round(codingHours * 5), 20)

    const entertainment = db.prepare(`
    SELECT COALESCE(SUM(duration_seconds), 0) as secs
    FROM app_usage WHERE date = ? AND category = 'Entertainment'
  `).get(today) as { secs: number }
    const entertainHours = entertainment.secs / 3600
    const distractionPts = Math.max(0, 15 - Math.round(entertainHours * 5))

    const streak = computeStreakDays()
    const momentumPts = Math.min(20, streak * 4)

    const score = tasksPts + focusPts + codingPts + distractionPts + momentumPts
    const clampedScore = Math.min(100, Math.max(0, score))

    db.prepare(`
    INSERT OR REPLACE INTO daily_scores
    (date, score, tasks_pts, focus_pts, coding_pts, distraction_pts, momentum_pts)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(today, clampedScore, tasksPts, focusPts, codingPts, distractionPts, momentumPts)
}

export { recalculateScore }
