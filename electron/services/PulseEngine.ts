import { getDB } from '../database'
import { localDate, weekStartDate } from '../lib/dates'

export type PulseMode = 'idle' | 'flow' | 'drift' | 'deep' | 'recovery'
export type PulseAction =
    | 'start-focus'
    | 'keep-going'
    | 'take-break'
    | 'switch-task'
    | 'add-task'
    | 'protect-flow'

export interface PulseInsight {
    mode: PulseMode
    headline: string
    reason: string
    action: PulseAction
    suggestedMinutes: number
    nextTaskId: number | null
    nextTaskTitle: string | null
    streakDays: number
    focusCompletionRate: number
    entertainmentOverLimit: boolean
}

interface TaskRow {
    id: number
    title: string
    priority: 'high' | 'medium' | 'low'
    category: string
    status: string
    due_time: string | null
    est_minutes: number
}

interface SessionRow {
    duration_minutes: number
    completed: number
}

function settingNumber(key: string, fallback: number): number {
    const row = getDB()
        .prepare('SELECT value FROM settings WHERE key = ?')
        .get(key) as { value: string } | undefined
    const n = Number(row?.value)
    return Number.isFinite(n) && n > 0 ? n : fallback
}

export function computeStreakDays(): number {
    const db = getDB()
    let streak = 0
    for (let i = 0; i < 30; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const date = localDate(d)
        const score = db.prepare('SELECT score FROM daily_scores WHERE date = ?').get(date) as
            | { score: number }
            | undefined
        const focus = db.prepare(
            `SELECT COUNT(*) as c FROM focus_sessions WHERE date(started_at) = ? AND completed = 1`
        ).get(date) as { c: number }
        const tasks = db.prepare(
            `SELECT COUNT(*) as c FROM tasks WHERE status = 'done' AND date(completed_at) = ?`
        ).get(date) as { c: number }
        const active = (score?.score ?? 0) >= 40 || focus.c > 0 || tasks.c > 0
        if (!active) {
            if (i === 0) continue
            break
        }
        streak += 1
    }
    return streak
}

export function syncWeeklyGoals() {
    const db = getDB()
    const start = weekStartDate()

    const focusCnt = db.prepare(
        `SELECT COUNT(*) as c FROM focus_sessions WHERE completed = 1 AND date(started_at) >= ?`
    ).get(start) as { c: number }
    db.prepare(`UPDATE goals SET current = ? WHERE type = 'focus'`).run(focusCnt.c)

    const taskCnt = db.prepare(
        `SELECT COUNT(*) as c FROM tasks WHERE status = 'done' AND date(completed_at) >= ?`
    ).get(start) as { c: number }
    db.prepare(`UPDATE goals SET current = ? WHERE type = 'tasks'`).run(taskCnt.c)

    const lc = db.prepare(
        `SELECT COUNT(*) as c FROM tasks
         WHERE status = 'done' AND lower(category) = 'leetcode' AND date(completed_at) >= ?`
    ).get(start) as { c: number }
    db.prepare(`UPDATE goals SET current = ? WHERE type = 'leetcode'`).run(lc.c)

    const gh = db.prepare(
        `SELECT COUNT(*) as c FROM tasks
         WHERE status = 'done' AND lower(category) = 'github' AND date(completed_at) >= ?`
    ).get(start) as { c: number }
    db.prepare(`UPDATE goals SET current = ? WHERE type = 'github'`).run(gh.c)
}

export function adaptiveFocusMinutes(): number {
    const db = getDB()
    const fallback = settingNumber('focusDuration', 25)
    const recent = db.prepare(
        `SELECT duration_minutes, completed FROM focus_sessions ORDER BY started_at DESC LIMIT 8`
    ).all() as SessionRow[]

    if (recent.length < 3) return fallback

    const completed = recent.filter((s) => s.completed === 1)
    const rate = completed.length / recent.length
    const avgCompleted = completed.length
        ? Math.round(completed.reduce((a, s) => a + s.duration_minutes, 0) / completed.length)
        : fallback

    const hour = new Date().getHours()

    if (rate < 0.4) {
        return Math.max(15, Math.min(25, Math.round(avgCompleted * 0.7) || 15))
    }
    if (hour >= 13 && hour <= 15) {
        return Math.min(fallback, 25)
    }
    if (rate >= 0.8 && avgCompleted >= 45) return 90
    if (rate >= 0.8 && avgCompleted >= 25) return 50
    return fallback
}

function pickNextTask(todos: TaskRow[], minutes: number): TaskRow | null {
    if (todos.length === 0) return null
    const pri = { high: 30, medium: 12, low: 4 }
    let best = todos[0]
    let bestScore = -Infinity
    for (const t of todos) {
        const fit = Math.max(0, 18 - Math.abs((t.est_minutes || 25) - minutes) * 0.35)
        const dueBoost = t.due_time ? 8 : 0
        const score = (pri[t.priority] ?? 10) + fit + dueBoost
        if (score > bestScore) {
            bestScore = score
            best = t
        }
    }
    return best
}

export function getPulseInsight(opts?: { focusActive?: boolean }): PulseInsight {
    const db = getDB()
    const today = localDate()
    const hour = new Date().getHours()
    const suggestedMinutes = adaptiveFocusMinutes()
    const streakDays = computeStreakDays()
    const entertainmentLimit = settingNumber('entertainmentLimitMinutes', 60)
    const codingGoal = settingNumber('dailyCodingGoalMinutes', 120)

    const todos = db.prepare(`
      SELECT id, title, priority, category, status, due_time, est_minutes
      FROM tasks WHERE status = 'todo'
      ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, est_minutes ASC
    `).all() as TaskRow[]

    const next = pickNextTask(todos, suggestedMinutes)

    const recent = db.prepare(
        `SELECT duration_minutes, completed FROM focus_sessions ORDER BY started_at DESC LIMIT 8`
    ).all() as SessionRow[]
    const focusCompletionRate =
        recent.length === 0
            ? 1
            : recent.filter((s) => s.completed === 1).length / recent.length

    const usage = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN category = 'Development' THEN duration_seconds ELSE 0 END), 0) as coding,
        COALESCE(SUM(CASE WHEN category = 'Entertainment' THEN duration_seconds ELSE 0 END), 0) as entertainment
      FROM app_usage WHERE date = ?
    `).get(today) as { coding: number; entertainment: number }

    const codingMin = Math.round(usage.coding / 60)
    const entertainmentMin = Math.round(usage.entertainment / 60)
    const entertainmentOverLimit = entertainmentMin >= entertainmentLimit

    const todayFocus = db.prepare(
        `SELECT COUNT(*) as c FROM focus_sessions WHERE date(started_at) = ? AND completed = 1`
    ).get(today) as { c: number }
    const focusTarget = settingNumber('dailyFocusTarget', 4)

    let mode: PulseMode = 'idle'
    let action: PulseAction = 'start-focus'
    let headline = 'Ready when you are'
    let reason = 'Start a short focus block to lock in the day.'

    if (opts?.focusActive) {
        mode = 'flow'
        action = 'keep-going'
        headline = 'Protect this block'
        reason = next
            ? `Stay on "${next.title}". Switching now would break the streak you are building.`
            : 'You are in a timed block. Ride it out — the score ticks when you finish.'
    } else if (entertainmentOverLimit && entertainmentMin > codingMin) {
        mode = 'drift'
        action = 'start-focus'
        headline = 'Attention is leaking'
        reason = `Entertainment is at ${entertainmentMin}m (limit ${entertainmentLimit}m). A ${suggestedMinutes}m block will pull you back.`
    } else if (codingMin >= codingGoal && todayFocus.c >= focusTarget) {
        mode = 'deep'
        action = 'take-break'
        headline = 'You already hit the bar'
        reason = `${codingMin}m of coding and ${todayFocus.c} focus sessions. Take a real break so tomorrow still has gas.`
    } else if (hour >= 22 || hour < 6) {
        mode = 'recovery'
        action = todos.length ? 'start-focus' : 'take-break'
        headline = hour < 6 ? 'Quiet hours' : 'Wind down'
        reason =
            todos.length > 0
                ? `One last ${Math.min(suggestedMinutes, 25)}m pass on "${next?.title ?? 'a small task'}", then stop.`
                : 'No open tasks. Sleep beats another half-finished session.'
        if (action === 'start-focus') {
            /* keep */
        }
    } else if (todos.length === 0) {
        mode = 'idle'
        action = 'add-task'
        headline = 'Nothing to aim at'
        reason = 'Capture one concrete task (use !!! for high priority) and Pulse will pick a duration for it.'
    } else if (codingMin >= 45 && entertainmentMin < 15 && focusCompletionRate >= 0.6) {
        mode = 'deep'
        action = 'start-focus'
        headline = 'You are already in motion'
        reason = `${codingMin}m of coding today. Queue "${next?.title}" for ${suggestedMinutes}m and keep the chain.`
    } else if (focusCompletionRate < 0.4 && recent.length >= 3) {
        mode = 'recovery'
        action = 'start-focus'
        headline = 'Sessions keep slipping'
        reason = `Only ${Math.round(focusCompletionRate * 100)}% of recent blocks were finished. Drop to ${suggestedMinutes}m so a win is likely.`
    } else if (next?.priority === 'high') {
        mode = 'flow'
        action = 'start-focus'
        headline = 'High-priority is waiting'
        reason = `"${next.title}" fits a ${suggestedMinutes}m block${next.due_time ? ` (due ${next.due_time})` : ''}. Start before the day fragments.`
    } else {
        mode = 'flow'
        action = 'start-focus'
        headline = 'Best next move'
        reason = `Work "${next?.title}" for ${suggestedMinutes}m — closest match to your energy and estimate.`
        if (todos.length > 1 && next && Math.abs((next.est_minutes || 25) - suggestedMinutes) > 40) {
            action = 'switch-task'
        }
    }

    if (streakDays >= 3 && action === 'start-focus') {
        reason += ` ${streakDays}-day momentum is live.`
    }

    return {
        mode,
        headline,
        reason,
        action,
        suggestedMinutes: mode === 'recovery' && hour >= 22 ? Math.min(suggestedMinutes, 25) : suggestedMinutes,
        nextTaskId: next?.id ?? null,
        nextTaskTitle: next?.title ?? null,
        streakDays,
        focusCompletionRate,
        entertainmentOverLimit,
    }
}
