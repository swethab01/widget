import { contextBridge, ipcRenderer } from 'electron'

// Typed API exposed to renderer via window.electronAPI
const electronAPI = {
    // Window controls
    window: {
        minimize: () => ipcRenderer.send('window:minimize'),
        hide: () => ipcRenderer.send('window:hide'),
        close: () => ipcRenderer.send('window:close'),
        setMode: (mode: 'compact' | 'normal' | 'expanded' | 'canvas') =>
            ipcRenderer.send('window:setMode', mode),
        setAlwaysOnTop: (flag: boolean) =>
            ipcRenderer.send('window:setAlwaysOnTop', flag),
        getMode: () => ipcRenderer.invoke('window:getMode'),
    },

    // Tasks
    tasks: {
        getAll: () => ipcRenderer.invoke('tasks:getAll'),
        getToday: () => ipcRenderer.invoke('tasks:getToday'),
        add: (task: unknown) => ipcRenderer.invoke('tasks:add', task),
        update: (id: number, patch: unknown) =>
            ipcRenderer.invoke('tasks:update', id, patch),
        delete: (id: number) => ipcRenderer.invoke('tasks:delete', id),
        complete: (id: number) => ipcRenderer.invoke('tasks:complete', id),
    },

    // Focus timer
    focus: {
        start: (taskId: number | null, minutes: number) =>
            ipcRenderer.invoke('focus:start', taskId, minutes),
        pause: () => ipcRenderer.invoke('focus:pause'),
        resume: () => ipcRenderer.invoke('focus:resume'),
        stop: () => ipcRenderer.invoke('focus:stop'),
        getActive: () => ipcRenderer.invoke('focus:getActive'),
        getHistory: () => ipcRenderer.invoke('focus:getHistory'),
    },

    // Screen time
    screenTime: {
        getToday: () => ipcRenderer.invoke('screenTime:getToday'),
        getSummary: () => ipcRenderer.invoke('screenTime:getSummary'),
    },

    // Productivity score
    score: {
        getToday: () => ipcRenderer.invoke('score:getToday'),
        getHistory: (days: number) => ipcRenderer.invoke('score:getHistory', days),
    },

    // Settings
    settings: {
        get: (key: string) => ipcRenderer.invoke('settings:get', key),
        getAll: () => ipcRenderer.invoke('settings:getAll'),
        set: (key: string, value: string) =>
            ipcRenderer.invoke('settings:set', key, value),
    },

    // Pulse insight
    pulse: {
        getInsight: () => ipcRenderer.invoke('pulse:insight'),
    },

    // Git intelligence
    git: {
        getRepoInfo: (customPath?: string) =>
            ipcRenderer.invoke('git:getRepoInfo', customPath),
    },

    // Scratchpad
    scratchpad: {
        get: () => ipcRenderer.invoke('scratchpad:get'),
        save: (content: string) => ipcRenderer.invoke('scratchpad:save', content),
    },

    // Goals
    goals: {
        getAll: () => ipcRenderer.invoke('goals:getAll'),
        set: (type: string, target: number) =>
            ipcRenderer.invoke('goals:set', type, target),
    },

    // LeetCode Integration
    leetcode: {
        getProfile: (username?: string) => ipcRenderer.invoke('leetcode:getProfile', username),
        getDaily: () => ipcRenderer.invoke('leetcode:getDaily'),
        getProblems: () => ipcRenderer.invoke('leetcode:getProblems'),
        toggleProblem: (id: number) => ipcRenderer.invoke('leetcode:toggleProblem', id),
        addProblem: (problem: {
            frontend_id?: string
            title: string
            difficulty?: 'Easy' | 'Medium' | 'Hard'
            category?: string
            url?: string
        }) => ipcRenderer.invoke('leetcode:addProblem', problem),
        deleteProblem: (id: number) => ipcRenderer.invoke('leetcode:deleteProblem', id),
    },

    // ChatGPT Integration
    chatgpt: {
        getConfig: () => ipcRenderer.invoke('chatgpt:getConfig'),
        saveConfig: (config: { apiKey?: string; accountId?: string; model?: string }) =>
            ipcRenderer.invoke('chatgpt:saveConfig', config),
        verifyKey: (apiKey: string) => ipcRenderer.invoke('chatgpt:verifyKey', apiKey),
        ask: (params: { prompt: string; model?: string }) =>
            ipcRenderer.invoke('chatgpt:ask', params),
        openApp: (prompt?: string) => ipcRenderer.invoke('chatgpt:openApp', prompt),
        openDesktopWeb: (prompt?: string) => ipcRenderer.invoke('chatgpt:openDesktopWeb', prompt),
        isAppInstalled: () => ipcRenderer.invoke('chatgpt:isAppInstalled'),
    },

    // Desktop Widgets system
    widgets: {
        getActive: () => ipcRenderer.invoke('widgets:getActive'),
        toggle: (widgetId: string) => ipcRenderer.invoke('widgets:toggle', widgetId),
        open: (widgetId: string) => ipcRenderer.invoke('widgets:open', widgetId),
        close: (widgetId: string) => ipcRenderer.invoke('widgets:close', widgetId),
        closeCurrent: () => ipcRenderer.send('widgets:closeCurrent'),
        openManager: (tab?: string) => ipcRenderer.send('widgets:openManager', tab),
        openSettings: () => ipcRenderer.send('widgets:openSettings'),
        launchFocus: () => ipcRenderer.invoke('widgets:launchFocus'),
        launchEssentials: () => ipcRenderer.invoke('widgets:launchEssentials'),
        launchKevTech: () => ipcRenderer.invoke('widgets:launchKevTech'),
        launchMacBook: () => ipcRenderer.invoke('widgets:launchMacBook'),
        closeAll: () => ipcRenderer.invoke('widgets:closeAll'),
    },

    // Shell
    openExternal: (url: string) => ipcRenderer.send('shell:openExternal', url),
    openTerminal: () => ipcRenderer.send('shell:openTerminal'),
    launchApp: (appKey: string) => ipcRenderer.send('shell:launchApp', appKey),

    // Event listeners (main → renderer)
    on: (
        channel: string,
        callback: (...args: unknown[]) => void
    ) => {
        const validChannels = [
            'focus:tick',
            'focus:complete',
            'screenTime:update',
            'pulse:refresh',
            'tray:startFocus',
            'tray:addTask',
            'tray:settings',
            'widgets:activeChanged',
            'manager:setTab',
        ]
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (_event, ...args) => callback(...args))
        }
    },
    off: (channel: string, callback: (...args: unknown[]) => void) => {
        ipcRenderer.removeListener(channel, callback)
    },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
