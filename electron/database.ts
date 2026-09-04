import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'

let db: Database.Database

export function getDB(): Database.Database {
    return db
}

export function initDatabase() {
    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, 'devpulse.db')

    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')

    createSchema()
    seedDefaultSettings()
    seedDefaultGoals()
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

    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at);
    CREATE INDEX IF NOT EXISTS idx_app_usage_date ON app_usage(date);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_app_usage_app_date ON app_usage(app_name, date);
    CREATE INDEX IF NOT EXISTS idx_focus_started ON focus_sessions(started_at);
  `)

    migrateSchema()
}

function migrateSchema() {
    const cols = db.prepare('PRAGMA table_info(daily_scores)').all() as { name: string }[]
    if (!cols.some((c) => c.name === 'momentum_pts')) {
        db.exec('ALTER TABLE daily_scores ADD COLUMN momentum_pts INTEGER DEFAULT 0')
    }
}

function seedDefaultSettings() {
    const defaults: Record<string, string> = {
        screenTimeTracking: 'true',
        githubIntegration: 'false',
        leetcodeIntegration: 'false',
        gmailIntegration: 'false',
        calendarIntegration: 'false',
        aiAnalysis: 'false',
        theme: 'dark',
        widgetMode: 'normal',
        alwaysOnTop: 'false',
        startWithWindows: 'false',
        dailyCodingGoalMinutes: '120',
        dailyFocusTarget: '4',
        entertainmentLimitMinutes: '60',
        focusDuration: '25',
        username: 'Developer',
        notificationsEnabled: 'true',
    }

    const insert = db.prepare(
        'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
    )
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
