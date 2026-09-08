// Shared TypeScript types for DevPulse

export type Priority = 'high' | 'medium' | 'low'
export type TaskStatus = 'todo' | 'done'
export type WidgetMode = 'compact' | 'normal' | 'expanded' | 'canvas'
export type DesktopWallpaper = 'sonoma' | 'sequoia' | 'spiderman' | 'mountains' | 'forest' | 'cyber'

export interface Task {
    id: number
    title: string
    priority: Priority
    category: string
    status: TaskStatus
    due_time: string | null
    est_minutes: number
    actual_minutes: number
    created_at: string
    completed_at: string | null
}

export interface NewTask {
    title: string
    priority?: Priority
    category?: string
    due_time?: string
    est_minutes?: number
}

export interface FocusState {
    remainingSeconds: number
    durationMinutes: number
    taskTitle: string
    paused: boolean
}

export interface FocusSession {
    id: number
    task_id: number | null
    task_title: string
    duration_minutes: number
    started_at: string
    ended_at: string | null
    completed: number
}

export interface AppUsage {
    appName: string
    app_name?: string
    windowTitle?: string
    category: string
    durationSeconds: number
    duration_seconds?: number
}

export interface ScreenTimeSummary {
    totalSeconds: number
    codingSeconds: number
    entertainmentSeconds: number
    communicationSeconds: number
    productiveSeconds: number
    apps: AppUsage[]
}

export interface DailyScore {
    date: string
    score: number
    tasks_pts: number
    focus_pts: number
    coding_pts: number
    distraction_pts: number
    github_pts?: number
    leetcode_pts?: number
    momentum_pts?: number
}

export interface Goal {
    id: number
    type: string
    label: string
    target: number
    unit: string
    period: string
    current: number
}

export interface Settings {
    screenTimeTracking: string
    githubIntegration: string
    leetcodeIntegration: string
    gmailIntegration: string
    calendarIntegration: string
    aiAnalysis: string
    theme: string
    widgetMode: string
    alwaysOnTop: string
    startWithWindows: string
    dailyCodingGoalMinutes: string
    dailyFocusTarget: string
    entertainmentLimitMinutes: string
    focusDuration: string
    username: string
    notificationsEnabled: string
    [key: string]: string
}

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

export interface GitCommit {
    hash: string
    author: string
    message: string
    time: string
}

export interface GitRepoInfo {
    repoName: string
    repoPath: string
    branch: string
    todayCommitCount: number
    commits: GitCommit[]
    isGitRepo: boolean
}

export interface ScratchpadData {
    content: string
    updated_at: string
}

// Electron API typings (matches preload.ts)
export interface ElectronAPI {
    window: {
        minimize: () => void
        hide: () => void
        close: () => void
        setMode: (mode: WidgetMode) => void
        setAlwaysOnTop: (flag: boolean) => void
        getMode: () => Promise<WidgetMode>
    }
    tasks: {
        getAll: () => Promise<Task[]>
        getToday: () => Promise<Task[]>
        add: (task: NewTask) => Promise<Task>
        update: (id: number, patch: Partial<Task>) => Promise<Task>
        delete: (id: number) => Promise<{ success: boolean }>
        complete: (id: number) => Promise<Task>
    }
    focus: {
        start: (taskId: number | null, minutes: number) => Promise<{ success: boolean }>
        pause: () => Promise<{ success: boolean }>
        resume: () => Promise<{ success: boolean }>
        stop: () => Promise<{ success: boolean }>
        getActive: () => Promise<FocusState | null>
        getHistory: () => Promise<FocusSession[]>
    }
    screenTime: {
        getToday: () => Promise<ScreenTimeSummary>
        getSummary: () => Promise<{ date: string; totalSeconds: number; codingSeconds: number }[]>
    }
    pulse: {
        getInsight: () => Promise<PulseInsight>
    }
    git: {
        getRepoInfo: (customPath?: string) => Promise<GitRepoInfo>
    }
    scratchpad: {
        get: () => Promise<ScratchpadData>
        save: (content: string) => Promise<{ success: boolean }>
    }
    score: {
        getToday: () => Promise<DailyScore>
        getHistory: (days: number) => Promise<DailyScore[]>
    }
    settings: {
        get: (key: string) => Promise<string | null>
        getAll: () => Promise<Settings>
        set: (key: string, value: string) => Promise<{ success: boolean }>
    }
    goals: {
        getAll: () => Promise<Goal[]>
        set: (type: string, target: number) => Promise<{ success: boolean }>
    }
    leetcode: {
        getProfile: (username?: string) => Promise<{
            success: boolean
            data?: LeetCodeProfileData
            error?: string
            message?: string
        }>
        getDaily: () => Promise<{
            success: boolean
            data?: LeetCodeDailyQuestion
            error?: string
        }>
    }
    chatgpt: {
        getConfig: () => Promise<ChatGPTConfig>
        saveConfig: (config: { apiKey?: string; accountId?: string; model?: string }) => Promise<{ success: boolean }>
        verifyKey: (apiKey: string) => Promise<{ valid: boolean; error?: string }>
        ask: (params: { prompt: string; model?: string }) => Promise<{
            success: boolean
            text?: string
            model?: string
            error?: string
            message?: string
        }>
        openApp: (prompt?: string) => Promise<{ success: boolean; copied?: boolean }>
        openDesktopWeb: (prompt?: string) => Promise<{ success: boolean }>
        isAppInstalled: () => Promise<boolean>
    }
    widgets: {
        getActive: () => Promise<string[]>
        toggle: (widgetId: string) => Promise<{ active: boolean }>
        open: (widgetId: string) => Promise<{ success: boolean }>
        close: (widgetId: string) => Promise<{ success: boolean }>
        closeCurrent: () => void
        openManager: (tab?: string) => void
        openSettings?: () => void
        launchFocus?: () => Promise<void>
        launchEssentials: () => Promise<void>
        launchKevTech: () => Promise<void>
        launchMacBook?: () => Promise<void>
        closeAll: () => Promise<void>
    }
    openExternal: (url: string) => void
    openTerminal?: () => void
    launchApp?: (appKey: string) => void
    on: (channel: string, callback: (...args: unknown[]) => void) => void
    off: (channel: string, callback: (...args: unknown[]) => void) => void
}

export interface LeetCodeProfileData {
    username: string
    realName?: string
    avatar?: string
    ranking?: number
    streak: number
    maxStreak?: number
    totalActiveDays: number
    solved: {
        all: number
        easy: number
        medium: number
        hard: number
    }
    allQuestionsCount?: {
        all: number
        easy: number
        medium: number
        hard: number
    }
    submissionCalendar?: Record<string, number>
    daily?: LeetCodeDailyQuestion
}

export interface LeetCodeDailyQuestion {
    id: string
    title: string
    slug: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    link: string
    tags: string[]
    acceptance: string
}

export interface ChatGPTConfig {
    accountId: string | null
    hasKey: boolean
    maskedKey: string
    model: string
    isAppInstalled?: boolean
}

declare global {
    interface Window {
        electronAPI: ElectronAPI
    }
}

