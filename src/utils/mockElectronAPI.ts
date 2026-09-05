import type {
    ElectronAPI,
    Task,
    NewTask,
    TaskStatus,
    FocusState,
    FocusSession,
    ScreenTimeSummary,
    DailyScore,
    Settings,
    Goal,
    PulseInsight,
    GitRepoInfo,
    ScratchpadData,
    WidgetMode,
} from '../types'

const LISTENERS = new Map<string, Set<(...args: unknown[]) => void>>()

function emit(channel: string, ...args: unknown[]) {
    const set = LISTENERS.get(channel)
    if (set) {
        set.forEach((cb) => cb(...args))
    }
}

// Initial seed tasks
const DEFAULT_TASKS: Task[] = [
    {
        id: 1,
        title: 'macOS Sonoma interactive widget dashboard',
        priority: 'high',
        category: 'Coding',
        est_minutes: 35,
        actual_minutes: 20,
        due_time: null,
        status: 'todo',
        created_at: new Date().toISOString(),
        completed_at: null,
    },
    {
        id: 2,
        title: 'Review GitHub PR #104: Hi-Fi Vinyl Audio',
        priority: 'medium',
        category: 'GitHub',
        est_minutes: 20,
        actual_minutes: 0,
        due_time: null,
        status: 'todo',
        created_at: new Date().toISOString(),
        completed_at: null,
    },
    {
        id: 3,
        title: 'Daily LeetCode Challenge: Dynamic Programming',
        priority: 'high',
        category: 'LeetCode',
        est_minutes: 25,
        actual_minutes: 0,
        due_time: null,
        status: 'todo',
        created_at: new Date().toISOString(),
        completed_at: null,
    },
    {
        id: 4,
        title: 'Setup binaural 40Hz sound generator',
        priority: 'low',
        category: 'General',
        est_minutes: 15,
        actual_minutes: 15,
        due_time: null,
        status: 'done',
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
    },
]

const DEFAULT_GOALS: Goal[] = [
    { id: 1, type: 'leetcode', label: 'Solve LeetCode Problems', target: 5, unit: 'probs', period: 'weekly', current: 3 },
    { id: 2, type: 'github', label: 'Push GitHub Commits', target: 20, unit: 'commits', period: 'weekly', current: 14 },
    { id: 3, type: 'focus', label: 'Deep Work Focus Sprints', target: 12, unit: 'hours', period: 'weekly', current: 8 },
    { id: 4, type: 'tasks', label: 'Complete Daily Tasks', target: 25, unit: 'tasks', period: 'weekly', current: 18 },
]

export function setupMockElectronAPI(): void {
    if (typeof window === 'undefined' || window.electronAPI) return

    const storedMode = localStorage.getItem('devpulse_mode') as WidgetMode
    let currentMode: WidgetMode = storedMode && ['canvas', 'normal', 'compact'].includes(storedMode) ? storedMode : 'canvas'
    let scratchpadText = localStorage.getItem('devpulse_scratchpad') || '# Quick Dev Notes\n\n- macOS Sonoma Glass Widgets activated\n- Audio synthesis online\n- Shortcuts: Press Cmd+K for Spotlight'
    let storedTasks: Task[] = (() => {
        try {
            const raw = localStorage.getItem('devpulse_tasks')
            return raw ? JSON.parse(raw) : DEFAULT_TASKS
        } catch {
            return DEFAULT_TASKS
        }
    })()

    let storedGoals: Goal[] = (() => {
        try {
            const raw = localStorage.getItem('devpulse_goals')
            return raw ? JSON.parse(raw) : DEFAULT_GOALS
        } catch {
            return DEFAULT_GOALS
        }
    })()

    let activeFocus: FocusState | null = null
    let focusTimer: ReturnType<typeof setInterval> | null = null

    const mockAPI: ElectronAPI = {
        window: {
            minimize: () => console.log('[Mock Window] Minimize'),
            hide: () => console.log('[Mock Window] Hide'),
            close: () => console.log('[Mock Window] Close'),
            setMode: (mode: WidgetMode) => {
                currentMode = mode
                localStorage.setItem('devpulse_mode', mode)
                console.log('[Mock Window] Set Mode:', mode)
            },
            setAlwaysOnTop: (flag: boolean) => console.log('[Mock Window] AlwaysOnTop:', flag),
            getMode: async () => currentMode,
        },

        tasks: {
            getAll: async () => storedTasks,
            getToday: async () => storedTasks,
            add: async (newTask: NewTask) => {
                const task: Task = {
                    id: Date.now(),
                    title: newTask.title,
                    priority: newTask.priority || 'medium',
                    category: newTask.category || 'General',
                    est_minutes: newTask.est_minutes || 25,
                    actual_minutes: 0,
                    due_time: newTask.due_time || null,
                    status: 'todo',
                    created_at: new Date().toISOString(),
                    completed_at: null,
                }
                storedTasks = [task, ...storedTasks]
                localStorage.setItem('devpulse_tasks', JSON.stringify(storedTasks))
                return task
            },
            update: async (id: number, patch: Partial<Task>) => {
                storedTasks = storedTasks.map((t) => (t.id === id ? { ...t, ...patch } : t))
                localStorage.setItem('devpulse_tasks', JSON.stringify(storedTasks))
                const found = storedTasks.find((t) => t.id === id)
                return found || storedTasks[0]
            },
            delete: async (id: number) => {
                storedTasks = storedTasks.filter((t) => t.id !== id)
                localStorage.setItem('devpulse_tasks', JSON.stringify(storedTasks))
                return { success: true }
            },
            complete: async (id: number) => {
                storedTasks = storedTasks.map((t) => {
                    if (t.id === id) {
                        const isDone = t.status === 'done'
                        return {
                            ...t,
                            status: (isDone ? 'todo' : 'done') as TaskStatus,
                            completed_at: isDone ? null : new Date().toISOString(),
                        }
                    }
                    return t
                })
                localStorage.setItem('devpulse_tasks', JSON.stringify(storedTasks))
                return storedTasks.find((t) => t.id === id)!
            },
        },

        focus: {
            start: async (taskId: number | null, minutes: number) => {
                if (focusTimer) clearInterval(focusTimer)
                const task = storedTasks.find((t) => t.id === taskId)
                activeFocus = {
                    taskTitle: task?.title || 'Deep Work Sprint',
                    durationMinutes: minutes,
                    remainingSeconds: minutes * 60,
                    paused: false,
                }
                focusTimer = setInterval(() => {
                    if (activeFocus && !activeFocus.paused) {
                        activeFocus.remainingSeconds -= 1
                        emit('focus:tick', activeFocus)
                        if (activeFocus.remainingSeconds <= 0) {
                            clearInterval(focusTimer!)
                            emit('focus:complete', activeFocus)
                            activeFocus = null
                        }
                    }
                }, 1000)
                emit('focus:tick', activeFocus)
                return { success: true }
            },
            pause: async () => {
                if (activeFocus) {
                    activeFocus.paused = true
                    emit('focus:tick', activeFocus)
                }
                return { success: true }
            },
            resume: async () => {
                if (activeFocus) {
                    activeFocus.paused = false
                    emit('focus:tick', activeFocus)
                }
                return { success: true }
            },
            stop: async () => {
                if (focusTimer) clearInterval(focusTimer)
                activeFocus = null
                emit('focus:tick', null)
                return { success: true }
            },
            getActive: async () => activeFocus,
            getHistory: async (): Promise<FocusSession[]> => [
                {
                    id: 1,
                    task_id: 1,
                    task_title: 'macOS Sonoma interactive widget dashboard',
                    duration_minutes: 25,
                    started_at: new Date(Date.now() - 3600000).toISOString(),
                    ended_at: new Date(Date.now() - 2100000).toISOString(),
                    completed: 1,
                },
                {
                    id: 2,
                    task_id: 3,
                    task_title: 'Daily LeetCode Challenge: Dynamic Programming',
                    duration_minutes: 20,
                    started_at: new Date(Date.now() - 7200000).toISOString(),
                    ended_at: new Date(Date.now() - 6000000).toISOString(),
                    completed: 1,
                },
            ],
        },

        screenTime: {
            getToday: async (): Promise<ScreenTimeSummary> => ({
                totalSeconds: 18450,
                codingSeconds: 12600,
                entertainmentSeconds: 1200,
                communicationSeconds: 2400,
                productiveSeconds: 15600,
                apps: [
                    { appName: 'Code.exe', windowTitle: 'VS Code - devpulse', durationSeconds: 12600, category: 'coding' },
                    { appName: 'chrome.exe', windowTitle: 'Developer Docs', durationSeconds: 2400, category: 'work' },
                    { appName: 'WindowsTerminal.exe', windowTitle: 'zsh - antigravity', durationSeconds: 2250, category: 'coding' },
                    { appName: 'Spotify.exe', windowTitle: 'Lofi Chill Beats', durationSeconds: 1200, category: 'entertainment' },
                ],
            }),
            getSummary: async () => [
                { date: '2026-09-01', totalSeconds: 21600, codingSeconds: 15000 },
                { date: '2026-09-02', totalSeconds: 19800, codingSeconds: 14200 },
                { date: '2026-09-03', totalSeconds: 25200, codingSeconds: 18000 },
                { date: '2026-09-04', totalSeconds: 22400, codingSeconds: 16500 },
                { date: '2026-09-05', totalSeconds: 18450, codingSeconds: 12600 },
            ],
        },

        score: {
            getToday: async (): Promise<DailyScore> => ({
                date: new Date().toISOString().split('T')[0],
                score: 88,
                tasks_pts: 24,
                focus_pts: 28,
                coding_pts: 26,
                distraction_pts: 0,
                github_pts: 6,
                leetcode_pts: 4,
                momentum_pts: 10,
            }),
            getHistory: async (days: number) => {
                const results: DailyScore[] = []
                for (let i = 0; i < days; i++) {
                    const d = new Date()
                    d.setDate(d.getDate() - i)
                    results.push({
                        date: d.toISOString().split('T')[0],
                        score: Math.floor(70 + Math.random() * 25),
                        tasks_pts: 20,
                        focus_pts: 25,
                        coding_pts: 25,
                        distraction_pts: 2,
                        momentum_pts: 8,
                    })
                }
                return results
            },
        },

        settings: {
            get: async (key: string) => localStorage.getItem(`devpulse_setting_${key}`),
            getAll: async (): Promise<Settings> => ({
                username: localStorage.getItem('devpulse_setting_username') || 'Developer',
                dailyCodingGoalMinutes: localStorage.getItem('devpulse_setting_goal') || '120',
                dailyFocusTarget: '120',
                entertainmentLimitMinutes: '60',
                focusDuration: '25',
                alwaysOnTop: localStorage.getItem('devpulse_setting_alwaysOnTop') || 'false',
                startWithWindows: 'false',
                screenTimeTracking: 'true',
                notificationsEnabled: 'true',
                githubIntegration: 'true',
                leetcodeIntegration: 'true',
                gmailIntegration: 'false',
                calendarIntegration: 'true',
                aiAnalysis: 'true',
                theme: 'dark',
                widgetMode: currentMode,
            }),
            set: async (key: string, value: string) => {
                localStorage.setItem(`devpulse_setting_${key}`, value)
                return { success: true }
            },
        },

        pulse: {
            getInsight: async (): Promise<PulseInsight> => ({
                mode: 'flow',
                headline: 'Flow State Active',
                reason: 'Coding momentum is strong with zero context switching',
                action: 'start-focus',
                suggestedMinutes: 25,
                nextTaskId: storedTasks.find((t) => t.status === 'todo')?.id || 1,
                nextTaskTitle: storedTasks.find((t) => t.status === 'todo')?.title || 'macOS Sonoma interactive widget dashboard',
                streakDays: 4,
                focusCompletionRate: 0.92,
                entertainmentOverLimit: false,
            }),
        },

        git: {
            getRepoInfo: async (): Promise<GitRepoInfo> => ({
                repoName: 'devpulse',
                repoPath: 'd:/widget',
                branch: 'main',
                todayCommitCount: 5,
                commits: [
                    { hash: 'a8f3b21', author: 'Developer', message: 'feat: add macOS Sonoma interactive widgets', time: '15m ago' },
                    { hash: '7c2e104', author: 'Developer', message: 'feat: apple activity rings & flow guardian HUD', time: '2h ago' },
                    { hash: '4b91fd2', author: 'Developer', message: 'feat: retro split-flap mechanical clock tile', time: '5h ago' },
                ],
                isGitRepo: true,
            }),
        },

        scratchpad: {
            get: async (): Promise<ScratchpadData> => ({
                content: scratchpadText,
                updated_at: new Date().toISOString(),
            }),
            save: async (content: string) => {
                scratchpadText = content
                localStorage.setItem('devpulse_scratchpad', content)
                return { success: true }
            },
        },

        goals: {
            getAll: async () => storedGoals,
            set: async (type: string, target: number) => {
                storedGoals = storedGoals.map((g) => (g.type === type ? { ...g, target } : g))
                localStorage.setItem('devpulse_goals', JSON.stringify(storedGoals))
                return { success: true }
            },
        },

        openExternal: (url: string) => {
            window.open(url, '_blank')
        },

        on: (channel: string, callback: (...args: unknown[]) => void) => {
            if (!LISTENERS.has(channel)) {
                LISTENERS.set(channel, new Set())
            }
            LISTENERS.get(channel)!.add(callback)
        },

        off: (channel: string, callback: (...args: unknown[]) => void) => {
            LISTENERS.get(channel)?.delete(callback)
        },
    }

    window.electronAPI = mockAPI
    console.log('[DevPulse] Web preview mock ElectronAPI initialized.')
}
