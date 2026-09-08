import path from 'path'
import fs from 'fs'
import { app } from 'electron'
import type Database from 'better-sqlite3'

let db: any

export function getDB(): Database.Database {
    return db
}

export function initDatabase() {
    const userDataPath = app.getPath('userData')
    if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true })
    }
    const dbPath = path.join(userDataPath, 'devpulse.db')
    const jsonPath = path.join(userDataPath, 'devpulse-data.json')

    try {
        // Attempt to load native better-sqlite3
        const BetterSqlite3 = require('better-sqlite3')
        db = new BetterSqlite3(dbPath)
        db.pragma('journal_mode = WAL')
        db.pragma('foreign_keys = ON')
    } catch {
        // High-performance resilient JSON-backed SQLite fallback
        db = createFallbackDB(jsonPath)
    }

    createSchema()
    seedDefaultSettings()
    seedDefaultGoals()
    seedDefaultLeetCodeProblems()
}

function createSchema() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      title         TEXT NOT NULL,
      priority      TEXT CHECK(priority IN ('high','medium','low')) DEFAULT 'medium',
      category      TEXT DEFAULT 'General',
      status        TEXT CHECK(status IN ('todo','done')) DEFAULT 'todo',
      due_time      TEXT,
      est_minutes   INTEGER DEFAULT 25,
      actual_minutes INTEGER DEFAULT 0,
      created_at    TEXT DEFAULT (datetime('now','localtime')),
      completed_at  TEXT
    );

    CREATE TABLE IF NOT EXISTS focus_sessions (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id         INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
      task_title      TEXT,
      duration_minutes INTEGER NOT NULL,
      started_at      TEXT NOT NULL,
      ended_at        TEXT,
      completed       INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS app_usage (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      app_name        TEXT NOT NULL,
      window_title    TEXT DEFAULT '',
      category        TEXT DEFAULT 'Other',
      date            TEXT NOT NULL,
      duration_seconds INTEGER DEFAULT 0,
      last_seen       TEXT
    );

    CREATE TABLE IF NOT EXISTS daily_scores (
      date            TEXT PRIMARY KEY,
      score           INTEGER DEFAULT 0,
      tasks_pts       INTEGER DEFAULT 0,
      focus_pts       INTEGER DEFAULT 0,
      coding_pts      INTEGER DEFAULT 0,
      distraction_pts INTEGER DEFAULT 0,
      github_pts      INTEGER DEFAULT 0,
      leetcode_pts    INTEGER DEFAULT 0,
      momentum_pts    INTEGER DEFAULT 0,
      breakdown       TEXT DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS goals (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      type            TEXT UNIQUE NOT NULL,
      label           TEXT NOT NULL,
      target          INTEGER NOT NULL,
      unit            TEXT DEFAULT '',
      period          TEXT DEFAULT 'weekly',
      current         INTEGER DEFAULT 0,
      created_at      TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS scratchpad (
      id         INTEGER PRIMARY KEY CHECK (id = 1),
      content    TEXT DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS leetcode_problems (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      frontend_id   TEXT,
      title         TEXT NOT NULL,
      title_slug    TEXT,
      difficulty    TEXT CHECK(difficulty IN ('Easy','Medium','Hard')) DEFAULT 'Medium',
      category      TEXT DEFAULT 'General',
      url           TEXT NOT NULL,
      completed     INTEGER DEFAULT 0,
      completed_at  TEXT,
      created_at    TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at);
    CREATE INDEX IF NOT EXISTS idx_app_usage_date ON app_usage(date);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_app_usage_app_date ON app_usage(app_name, date);
    CREATE INDEX IF NOT EXISTS idx_focus_started ON focus_sessions(started_at);
    CREATE INDEX IF NOT EXISTS idx_leetcode_completed ON leetcode_problems(completed);
  `)

    db.prepare(`
    INSERT OR IGNORE INTO scratchpad (id, content) VALUES (1, '# Developer Scratchpad\n- [ ] Quick thought\n- [ ] Snippet / Command')
  `).run()

    migrateSchema()
}

function migrateSchema() {
    try {
        const cols = db.prepare('PRAGMA table_info(daily_scores)').all() as { name: string }[]
        if (cols && !cols.some((c) => c.name === 'momentum_pts')) {
            db.exec('ALTER TABLE daily_scores ADD COLUMN momentum_pts INTEGER DEFAULT 0')
        }
    } catch {
        // ignore
    }
}

interface SeedLeetCodeProblem {
    frontend_id: string
    title: string
    title_slug: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    category: string
    url: string
}

const DEFAULT_LEETCODE_PROBLEMS: SeedLeetCodeProblem[] = [
    { frontend_id: '1', title: 'Two Sum', title_slug: 'two-sum', difficulty: 'Easy', category: 'Arrays & Hashing', url: 'https://leetcode.com/problems/two-sum/' },
    { frontend_id: '20', title: 'Valid Parentheses', title_slug: 'valid-parentheses', difficulty: 'Easy', category: 'Stack', url: 'https://leetcode.com/problems/valid-parentheses/' },
    { frontend_id: '21', title: 'Merge Two Sorted Lists', title_slug: 'merge-two-sorted-lists', difficulty: 'Easy', category: 'Linked List', url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
    { frontend_id: '121', title: 'Best Time to Buy and Sell Stock', title_slug: 'best-time-to-buy-and-sell-stock', difficulty: 'Easy', category: 'Sliding Window', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
    { frontend_id: '125', title: 'Valid Palindrome', title_slug: 'valid-palindrome', difficulty: 'Easy', category: 'Two Pointers', url: 'https://leetcode.com/problems/valid-palindrome/' },
    { frontend_id: '226', title: 'Invert Binary Tree', title_slug: 'invert-binary-tree', difficulty: 'Easy', category: 'Trees', url: 'https://leetcode.com/problems/invert-binary-tree/' },
    { frontend_id: '242', title: 'Valid Anagram', title_slug: 'valid-anagram', difficulty: 'Easy', category: 'Arrays & Hashing', url: 'https://leetcode.com/problems/valid-anagram/' },
    { frontend_id: '704', title: 'Binary Search', title_slug: 'binary-search', difficulty: 'Easy', category: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/' },
    { frontend_id: '3', title: 'Longest Substring Without Repeating Characters', title_slug: 'longest-substring-without-repeating-characters', difficulty: 'Medium', category: 'Sliding Window', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
    { frontend_id: '11', title: 'Container With Most Water', title_slug: 'container-with-most-water', difficulty: 'Medium', category: 'Two Pointers', url: 'https://leetcode.com/problems/container-with-most-water/' },
    { frontend_id: '15', title: '3Sum', title_slug: '3sum', difficulty: 'Medium', category: 'Two Pointers', url: 'https://leetcode.com/problems/3sum/' },
    { frontend_id: '33', title: 'Search in Rotated Sorted Array', title_slug: 'search-in-rotated-sorted-array', difficulty: 'Medium', category: 'Binary Search', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
    { frontend_id: '49', title: 'Group Anagrams', title_slug: 'group-anagrams', difficulty: 'Medium', category: 'Arrays & Hashing', url: 'https://leetcode.com/problems/group-anagrams/' },
    { frontend_id: '53', title: 'Maximum Subarray', title_slug: 'maximum-subarray', difficulty: 'Medium', category: 'Dynamic Programming', url: 'https://leetcode.com/problems/maximum-subarray/' },
    { frontend_id: '102', title: 'Binary Tree Level Order Traversal', title_slug: 'binary-tree-level-order-traversal', difficulty: 'Medium', category: 'Trees', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
    { frontend_id: '128', title: 'Longest Consecutive Sequence', title_slug: 'longest-consecutive-sequence', difficulty: 'Medium', category: 'Arrays & Hashing', url: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
    { frontend_id: '198', title: 'House Robber', title_slug: 'house-robber', difficulty: 'Medium', category: 'Dynamic Programming', url: 'https://leetcode.com/problems/house-robber/' },
    { frontend_id: '200', title: 'Number of Islands', title_slug: 'number-of-islands', difficulty: 'Medium', category: 'Graphs', url: 'https://leetcode.com/problems/number-of-islands/' },
    { frontend_id: '300', title: 'Longest Increasing Subsequence', title_slug: 'longest-increasing-subsequence', difficulty: 'Medium', category: 'Dynamic Programming', url: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
    { frontend_id: '42', title: 'Trapping Rain Water', title_slug: 'trapping-rain-water', difficulty: 'Hard', category: 'Two Pointers', url: 'https://leetcode.com/problems/trapping-rain-water/' },
]

function seedDefaultLeetCodeProblems() {
    try {
        const countRow = db.prepare('SELECT COUNT(*) as count FROM leetcode_problems').get() as { count: number }
        if (countRow && countRow.count === 0) {
            const insert = db.prepare(`
                INSERT INTO leetcode_problems (frontend_id, title, title_slug, difficulty, category, url, completed)
                VALUES (@frontend_id, @title, @title_slug, @difficulty, @category, @url, 0)
            `)
            const insertMany = db.transaction((problems: SeedLeetCodeProblem[]) => {
                for (const p of problems) insert.run(p)
            })
            insertMany(DEFAULT_LEETCODE_PROBLEMS)
        }
    } catch (e) {
        console.error('Error seeding leetcode problems:', e)
    }
}

function seedDefaultSettings() {
    const defaults: Record<string, string> = {
        screenTimeTracking: 'true',
        githubIntegration: 'false',
        leetcodeIntegration: 'true',
        leetcode_username: 's4njay',
        gmailIntegration: 'false',
        calendarIntegration: 'false',
        aiAnalysis: 'false',
        theme: 'dark',
        widgetMode: 'normal',
        alwaysOnTop: 'false',
        startWithWindows: 'true',
        dailyCodingGoalMinutes: '120',
        dailyFocusTarget: '4',
        entertainmentLimitMinutes: '60',
        focusDuration: '25',
        username: 'sanjay',
        notificationsEnabled: 'true',
    }

    const insert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
    const insertMany = db.transaction((entries: [string, string][]) => {
        for (const [k, v] of entries) insert.run(k, v)
    })
    insertMany(Object.entries(defaults))
}

function seedDefaultGoals() {
    const defaults = [
        { type: 'leetcode', label: 'LeetCode Problems', target: 20, unit: 'problems', period: 'weekly' },
        { type: 'github', label: 'GitHub Commits', target: 20, unit: 'commits', period: 'weekly' },
        { type: 'focus', label: 'Focus Sessions', target: 10, unit: 'sessions', period: 'weekly' },
        { type: 'tasks', label: 'Tasks Completed', target: 30, unit: 'tasks', period: 'weekly' },
        { type: 'reading', label: 'Reading', target: 100, unit: 'pages', period: 'weekly' },
    ]

    const insert = db.prepare(`
    INSERT OR IGNORE INTO goals (type, label, target, unit, period)
    VALUES (@type, @label, @target, @unit, @period)
  `)
    const insertMany = db.transaction((rows: typeof defaults) => {
        for (const row of rows) insert.run(row)
    })
    insertMany(defaults)
}

// Resilient Fallback Database Engine
function createFallbackDB(storageFilePath: string) {
    let state = {
        tasks: [] as any[],
        focus_sessions: [] as any[],
        app_usage: [] as any[],
        daily_scores: {} as Record<string, any>,
        goals: [] as any[],
        leetcode_problems: [] as any[],
        settings: {} as Record<string, string>,
        scratchpad: { id: 1, content: '# Developer Scratchpad\n- [ ] Quick thought\n- [ ] Snippet / Command', updated_at: new Date().toISOString() },
        nextId: { tasks: 1, focus_sessions: 1, goals: 1, leetcode_problems: 1 },
    }

    if (fs.existsSync(storageFilePath)) {
        try {
            const raw = fs.readFileSync(storageFilePath, 'utf-8')
            const loaded = JSON.parse(raw)
            state = { ...state, ...loaded }
        } catch {
            // ignore
        }
    }

    const save = () => {
        try {
            fs.writeFileSync(storageFilePath, JSON.stringify(state, null, 2), 'utf-8')
        } catch {
            // ignore
        }
    }

    const nowStr = () => new Date().toLocaleString()

    return {
        pragma: (_cmd: string) => {},
        exec: (_sql: string) => {},
        transaction: (fn: Function) => {
            return (...args: any[]) => fn(...args)
        },
        prepare: (sql: string) => {
            const cleanSql = sql.replace(/\s+/g, ' ').trim()

            return {
                run: (...args: any[]) => {
                    const arg0 = args[0]

                    // Scratchpad
                    if (cleanSql.includes('INSERT INTO scratchpad') || cleanSql.includes('INSERT OR IGNORE INTO scratchpad')) {
                        const content = typeof arg0 === 'object' ? arg0.content : args[1] || ''
                        state.scratchpad = { id: 1, content, updated_at: nowStr() }
                        save()
                        return { lastInsertRowid: 1, changes: 1 }
                    }

                    // Tasks insert
                    if (cleanSql.includes('INSERT INTO tasks')) {
                        const t = arg0 || {}
                        const id = state.nextId.tasks++
                        const newTask = {
                            id,
                            title: t.title || '',
                            priority: t.priority || 'medium',
                            category: t.category || 'General',
                            status: 'todo',
                            due_time: t.due_time || null,
                            est_minutes: t.est_minutes || 25,
                            actual_minutes: 0,
                            created_at: nowStr(),
                            completed_at: null,
                        }
                        state.tasks.unshift(newTask)
                        save()
                        return { lastInsertRowid: id, changes: 1 }
                    }

                    // Tasks update
                    if (cleanSql.includes('UPDATE tasks SET status = \'done\'')) {
                        const id = typeof arg0 === 'number' ? arg0 : args[0]
                        const task = state.tasks.find((t) => t.id === id)
                        if (task) {
                            task.status = 'done'
                            task.completed_at = nowStr()
                            save()
                        }
                        return { lastInsertRowid: id, changes: 1 }
                    }

                    if (cleanSql.includes('UPDATE tasks SET')) {
                        const patch = arg0 || {}
                        const id = patch.id || args[0]
                        const task = state.tasks.find((t) => t.id === id)
                        if (task) {
                            Object.assign(task, patch)
                            save()
                        }
                        return { lastInsertRowid: id, changes: 1 }
                    }

                    // Tasks delete
                    if (cleanSql.includes('DELETE FROM tasks WHERE id = ?')) {
                        const id = args[0]
                        state.tasks = state.tasks.filter((t) => t.id !== id)
                        save()
                        return { lastInsertRowid: id, changes: 1 }
                    }

                    // Focus session start
                    if (cleanSql.includes('INSERT INTO focus_sessions')) {
                        const [taskId, taskTitle, durationMinutes] = args
                        const id = state.nextId.focus_sessions++
                        state.focus_sessions.unshift({
                            id,
                            task_id: taskId,
                            task_title: taskTitle,
                            duration_minutes: durationMinutes,
                            started_at: new Date().toISOString(),
                            ended_at: null,
                            completed: 0,
                        })
                        save()
                        return { lastInsertRowid: id, changes: 1 }
                    }

                    // Focus session update
                    if (cleanSql.includes('UPDATE focus_sessions SET ended_at =')) {
                        const isCompleted = cleanSql.includes('completed = 1') ? 1 : 0
                        const id = args[0]
                        const session = state.focus_sessions.find((s) => s.id === id)
                        if (session) {
                            session.ended_at = new Date().toISOString()
                            session.completed = isCompleted
                            save()
                        }
                        return { lastInsertRowid: id, changes: 1 }
                    }

                    // App usage upsert
                    if (cleanSql.includes('INSERT INTO app_usage')) {
                        const row = arg0 || {}
                        const existing = state.app_usage.find(
                            (u) => u.app_name.toLowerCase() === (row.appName || '').toLowerCase() && u.date === row.date
                        )
                        if (existing) {
                            existing.duration_seconds += row.durationSeconds || 0
                            existing.window_title = row.windowTitle || ''
                            existing.last_seen = nowStr()
                        } else {
                            state.app_usage.push({
                                id: state.app_usage.length + 1,
                                app_name: row.appName,
                                window_title: row.windowTitle,
                                category: row.category,
                                date: row.date,
                                duration_seconds: row.durationSeconds,
                                last_seen: nowStr(),
                            })
                        }
                        save()
                        return { lastInsertRowid: 1, changes: 1 }
                    }

                    // Daily scores upsert
                    if (cleanSql.includes('INSERT OR REPLACE INTO daily_scores') || cleanSql.includes('UPDATE daily_scores')) {
                        if (cleanSql.includes('github_pts = ?')) {
                            const [githubPts, date] = args
                            if (state.daily_scores[date]) {
                                state.daily_scores[date].github_pts = githubPts
                                save()
                            }
                            return { lastInsertRowid: 1, changes: 1 }
                        }
                        const [date, score, tasks_pts, focus_pts, coding_pts, distraction_pts, momentum_pts] = args
                        state.daily_scores[date] = {
                            date,
                            score,
                            tasks_pts,
                            focus_pts,
                            coding_pts,
                            distraction_pts,
                            momentum_pts: momentum_pts || 0,
                            github_pts: state.daily_scores[date]?.github_pts || 0,
                        }
                        save()
                        return { lastInsertRowid: 1, changes: 1 }
                    }

                    // Goals
                    if (cleanSql.includes('UPDATE goals SET current = ? WHERE type = ?') || cleanSql.includes('UPDATE goals SET current = MAX')) {
                        const [current, type] = args
                        const g = state.goals.find((g) => g.type === type)
                        if (g) {
                            g.current = cleanSql.includes('MAX') ? Math.max(g.current || 0, current) : current
                            save()
                        }
                        return { lastInsertRowid: 1, changes: 1 }
                    }
                    if (cleanSql.includes('UPDATE goals SET target = ? WHERE type = ?')) {
                        const [target, type] = args
                        const g = state.goals.find((g) => g.type === type)
                        if (g) {
                            g.target = target
                            save()
                        }
                        return { lastInsertRowid: 1, changes: 1 }
                    }
                    if (cleanSql.includes('INSERT OR IGNORE INTO goals')) {
                        const g = arg0 || {}
                        if (!state.goals.some((x) => x.type === g.type)) {
                            state.goals.push({ id: state.nextId.goals++, ...g, current: 0 })
                            save()
                        }
                        return { lastInsertRowid: 1, changes: 1 }
                    }

                    // Settings
                    if (cleanSql.includes('INSERT OR IGNORE INTO settings') || cleanSql.includes('INSERT OR REPLACE INTO settings')) {
                        const [k, v] = args
                        if (cleanSql.includes('IGNORE') && state.settings[k] !== undefined) {
                            return { lastInsertRowid: 1, changes: 0 }
                        }
                        state.settings[k] = String(v)
                        save()
                        return { lastInsertRowid: 1, changes: 1 }
                    }

                    // LeetCode problems
                    if (cleanSql.includes('INSERT INTO leetcode_problems')) {
                        const row = arg0 || {}
                        const id = (state.nextId as any).leetcode_problems = ((state.nextId as any).leetcode_problems || 1) + 1
                        state.leetcode_problems = state.leetcode_problems || []
                        state.leetcode_problems.unshift({
                            id,
                            frontend_id: row.frontend_id || '',
                            title: row.title || '',
                            title_slug: row.title_slug || '',
                            difficulty: row.difficulty || 'Medium',
                            category: row.category || 'General',
                            url: row.url || '',
                            completed: 0,
                            completed_at: null,
                            created_at: nowStr(),
                        })
                        save()
                        return { lastInsertRowid: id, changes: 1 }
                    }
                    if (cleanSql.includes('UPDATE leetcode_problems SET completed =')) {
                        const id = args[1] !== undefined ? args[1] : (typeof arg0 === 'number' ? arg0 : args[0])
                        const problem = (state.leetcode_problems || []).find((p) => p.id === id)
                        if (problem) {
                            problem.completed = problem.completed ? 0 : 1
                            problem.completed_at = problem.completed ? nowStr() : null
                            save()
                        }
                        return { lastInsertRowid: id, changes: 1 }
                    }
                    if (cleanSql.includes('DELETE FROM leetcode_problems WHERE id = ?')) {
                        const id = args[0]
                        state.leetcode_problems = (state.leetcode_problems || []).filter((p) => p.id !== id)
                        save()
                        return { lastInsertRowid: id, changes: 1 }
                    }

                    return { lastInsertRowid: 0, changes: 0 }
                },

                get: (...args: any[]) => {
                    const arg0 = args[0]

                    // Scratchpad
                    if (cleanSql.includes('FROM scratchpad')) {
                        return state.scratchpad
                    }

                    // Tasks get by ID
                    if (cleanSql.includes('SELECT * FROM tasks WHERE id = ?')) {
                        return state.tasks.find((t) => t.id === arg0)
                    }
                    if (cleanSql.includes('SELECT title FROM tasks WHERE id = ?')) {
                        const t = state.tasks.find((t) => t.id === arg0)
                        return t ? { title: t.title } : undefined
                    }

                    // Tasks count
                    if (cleanSql.includes('FROM tasks WHERE date(created_at) = ? OR date(completed_at) = ?')) {
                        const date = arg0
                        const relevant = state.tasks.filter(
                            (t) => (t.created_at && t.created_at.includes(date)) || (t.completed_at && t.completed_at.includes(date))
                        )
                        return {
                            total: relevant.length,
                            done: relevant.filter((t) => t.status === 'done').length,
                        }
                    }
                    if (cleanSql.includes("FROM tasks WHERE status = 'done'")) {
                        const date = arg0
                        const filtered = state.tasks.filter((t) => {
                            if (t.status !== 'done') return false
                            if (cleanSql.includes("category) = 'leetcode'")) {
                                if (t.category?.toLowerCase() !== 'leetcode') return false
                            }
                            if (cleanSql.includes("category) = 'github'")) {
                                if (t.category?.toLowerCase() !== 'github') return false
                            }
                            return t.completed_at && t.completed_at >= date
                        })
                        return { c: filtered.length }
                    }

                    // Focus sessions count
                    if (cleanSql.includes('FROM focus_sessions WHERE date(started_at) = ? AND completed = 1')) {
                        const date = arg0
                        const cnt = state.focus_sessions.filter((s) => s.completed === 1 && s.started_at?.includes(date)).length
                        return { cnt, c: cnt }
                    }
                    if (cleanSql.includes('FROM focus_sessions WHERE completed = 1 AND date(started_at) >= ?')) {
                        const date = arg0
                        const cnt = state.focus_sessions.filter((s) => s.completed === 1 && s.started_at >= date).length
                        return { c: cnt }
                    }

                    // App usage aggregates
                    if (cleanSql.includes('FROM app_usage WHERE date = ?')) {
                        const date = arg0
                        const rows = state.app_usage.filter((u) => u.date === date)
                        if (cleanSql.includes('coding') && cleanSql.includes('entertainment')) {
                            const coding = rows.filter((r) => r.category === 'Development').reduce((s, r) => s + r.duration_seconds, 0)
                            const entertainment = rows.filter((r) => r.category === 'Entertainment').reduce((s, r) => s + r.duration_seconds, 0)
                            return { coding, entertainment }
                        }
                        if (cleanSql.includes('category = \'Development\'') || cleanSql.includes('category=\'Development\'')) {
                            const secs = rows.filter((r) => r.category === 'Development').reduce((s, r) => s + r.duration_seconds, 0)
                            return { secs, total: rows.reduce((s, r) => s + r.duration_seconds, 0), coding: secs }
                        }
                        if (cleanSql.includes('category = \'Entertainment\'')) {
                            const secs = rows.filter((r) => r.category === 'Entertainment').reduce((s, r) => s + r.duration_seconds, 0)
                            return { secs }
                        }
                        return {
                            total: rows.reduce((s, r) => s + r.duration_seconds, 0),
                            coding: rows.filter((r) => r.category === 'Development').reduce((s, r) => s + r.duration_seconds, 0),
                        }
                    }

                    // Daily scores
                    if (cleanSql.includes('FROM daily_scores WHERE date = ?')) {
                        return state.daily_scores[arg0]
                    }

                    // Settings
                    if (cleanSql.includes('FROM settings WHERE key = ?')) {
                        const val = state.settings[arg0]
                        return val !== undefined ? { value: val } : undefined
                    }

                    return undefined
                },

                all: (...args: any[]) => {
                    const arg0 = args[0]

                    // PRAGMA
                    if (cleanSql.includes('PRAGMA table_info')) {
                        return [{ name: 'momentum_pts' }]
                    }

                    // Tasks get all / get today
                    if (cleanSql.includes('FROM tasks')) {
                        if (cleanSql.includes('status = \'todo\'')) {
                            return state.tasks.filter((t) => t.status === 'todo')
                        }
                        if (cleanSql.includes('date(created_at) = ? OR status = \'todo\'')) {
                            const today = arg0
                            return state.tasks.filter((t) => (t.created_at && t.created_at.includes(today)) || t.status === 'todo')
                        }
                        return state.tasks
                    }

                    // Focus sessions history
                    if (cleanSql.includes('FROM focus_sessions')) {
                        if (cleanSql.includes('ORDER BY started_at DESC LIMIT 8')) {
                            return state.focus_sessions.slice(0, 8)
                        }
                        if (cleanSql.includes('date(started_at) = ?')) {
                            const today = arg0
                            return state.focus_sessions.filter((s) => s.started_at && s.started_at.includes(today))
                        }
                        return state.focus_sessions
                    }

                    // App usage
                    if (cleanSql.includes('FROM app_usage WHERE date = ?')) {
                        const today = arg0
                        return state.app_usage
                            .filter((u) => u.date === today)
                            .sort((a, b) => b.duration_seconds - a.duration_seconds)
                    }

                    // Goals
                    if (cleanSql.includes('FROM goals')) {
                        return state.goals
                    }

                    // LeetCode practice problems
                    if (cleanSql.includes('FROM leetcode_problems')) {
                        return state.leetcode_problems || []
                    }

                    // Settings
                    if (cleanSql.includes('FROM settings')) {
                        return Object.entries(state.settings).map(([key, value]) => ({ key, value }))
                    }

                    return []
                },
            }
        },
    }
}
