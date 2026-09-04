// Shared TypeScript types for DevPulse

export type Priority = 'high' | 'medium' | 'low'
export type TaskStatus = 'todo' | 'done'
export type WidgetMode = 'compact' | 'normal' | 'expanded' | 'canvas'
export type DesktopWallpaper = 'spiderman' | 'mountains' | 'forest' | 'cyber'

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
    openExternal: (url: string) => void
    on: (channel: string, callback: (...args: unknown[]) => void) => void
    off: (channel: string, callback: (...args: unknown[]) => void) => void
}

declare global {
    interface Window {
        electronAPI: ElectronAPI
    }
}

