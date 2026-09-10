import { useState, useEffect } from 'react'
import { MacTasksWidget } from './MacTasksWidget'
import { LeetCodeWidget } from './LeetCodeWidget'
import { MacGoalsWidget } from './MacGoalsWidget'
import { ChatGPTSearchWidget } from './ChatGPTSearchWidget'
import { ScreenTimeWidget } from '../ScreenTimeWidget'
import { RetroFlipClockWidget } from './RetroFlipClockWidget'
import { AppLaunchpadWidget } from './AppLaunchpadWidget'
import { KevClockWidget } from './KevClockWidget'
import { KevBatteryWidget } from './KevBatteryWidget'
import { KevWeatherWidget } from './KevWeatherWidget'
import { useTasks } from '../../hooks/useTasks'
import { useScreenTime } from '../../hooks/useScreenTime'

type ActiveView = 'focus' | 'tasks' | 'leetcode' | 'goals' | 'chatgpt' | 'screentime' | 'clock' | 'all'

export function DesktopWidgetDeck() {
    const [view, setView] = useState<ActiveView>('focus')
    const [activeDesktopWidgets, setActiveDesktopWidgets] = useState<string[]>([])
    const tasks = useTasks()
    const screenTime = useScreenTime()

    // Sync active widgets floating on desktop via Electron
    useEffect(() => {
        if (window.electronAPI?.widgets?.getActive) {
            window.electronAPI.widgets.getActive().then((list) => {
                if (Array.isArray(list)) setActiveDesktopWidgets(list)
            })
        }
        const handleActiveChanged = (...args: unknown[]) => {
            const list = args[0]
            if (Array.isArray(list)) setActiveDesktopWidgets(list as string[])
        }
        window.electronAPI?.on?.('widgets:activeChanged', handleActiveChanged)
        return () => window.electronAPI?.off?.('widgets:activeChanged', handleActiveChanged)
    }, [])

    const handlePopOut = async (widgetId: string) => {
        if (window.electronAPI?.widgets?.open) {
            await window.electronAPI.widgets.open(widgetId)
        }
    }

    const handleLaunchFocusOnDesktop = async () => {
        if (window.electronAPI?.widgets?.launchFocus) {
            await window.electronAPI.widgets.launchFocus()
        }
    }

    const handleCloseAllDesktop = async () => {
        if (window.electronAPI?.widgets?.closeAll) {
            await window.electronAPI.widgets.closeAll()
        }
    }

    return (
        <div className="min-h-screen w-full bg-[#0a0c12] text-white flex flex-col items-center select-none font-sans overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {/* Top Compact Widget Navigation Bar (NO fake OS website chrome) */}
            <header className="w-full sticky top-0 z-40 bg-[#0e1017]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 py-2.5 flex items-center justify-between shadow-lg">
                {/* Brand & Widget Badge */}
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center text-sm font-black shadow-md shadow-blue-500/25">
                        ⚡
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs tracking-wider uppercase text-white">
                                DevPulse
                            </span>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                WIDGET SUITE
                            </span>
                        </div>
                        <p className="text-[10px] text-white/40 font-mono hidden sm:block">
                            Compact desktop developer widgets
                        </p>
                    </div>
                </div>

                {/* Widget View Switcher Pills */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5 px-2 bg-black/40 rounded-xl border border-white/[0.08]">
                    <button
                        onClick={() => setView('focus')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            view === 'focus'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                        }`}
                        title="Display the 4 core developer widgets side by side"
                    >
                        <span>🎯</span>
                        <span>Dev Focus</span>
                    </button>

                    <button
                        onClick={() => setView('tasks')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            view === 'tasks'
                                ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40 font-bold shadow-sm'
                                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                        }`}
                        title="Today's Task Manager Checklist"
                    >
                        <span>📋</span>
                        <span>Tasks</span>
                        <span className="text-[10px] font-mono opacity-70">
                            ({tasks.doneTasks.length}/{tasks.tasks.length})
                        </span>
                    </button>

                    <button
                        onClick={() => setView('leetcode')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            view === 'leetcode'
                                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                        }`}
                        title="LeetCode Daily Problem & Stats"
                    >
                        <span>⚡</span>
                        <span>LeetCode</span>
                    </button>

                    <button
                        onClick={() => setView('goals')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            view === 'goals'
                                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold shadow-sm'
                                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                        }`}
                        title="Habits and Goals Tracker"
                    >
                        <span>🎯</span>
                        <span>Goals</span>
                    </button>

                    <button
                        onClick={() => setView('chatgpt')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            view === 'chatgpt'
                                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                        }`}
                        title="ChatGPT Search Box"
                    >
                        <span>🤖</span>
                        <span>ChatGPT</span>
                    </button>

                    <button
                        onClick={() => setView('screentime')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            view === 'screentime'
                                ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-bold shadow-sm'
                                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                        }`}
                        title="Laptop Screen Time & Apps"
                    >
                        <span>⏱</span>
                        <span>Screen Time</span>
                    </button>

                    <button
                        onClick={() => setView('clock')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            view === 'clock'
                                ? 'bg-white/20 text-white font-bold shadow-sm'
                                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                        }`}
                        title="Retro Flip Clock"
                    >
                        <span>⌚</span>
                        <span>Clock</span>
                    </button>

                    <button
                        onClick={() => setView('all')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            view === 'all'
                                ? 'bg-white/20 text-white font-bold shadow-sm'
                                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                        }`}
                        title="View all widgets in a compact grid"
                    >
                        <span>🧩</span>
                        <span>All</span>
                    </button>
                </div>

                {/* Desktop Float Actions (for Electron) */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleLaunchFocusOnDesktop}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                        title="Float all 4 focus widgets directly on your Windows desktop wallpaper"
                    >
                        <span>🪟</span>
                        <span className="hidden md:inline">Float on Desktop</span>
                    </button>

                    {activeDesktopWidgets.length > 0 && (
                        <button
                            onClick={handleCloseAllDesktop}
                            className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-rose-500/20 text-white/60 hover:text-rose-300 border border-white/10 text-xs transition-all cursor-pointer"
                            title="Hide floating widgets from desktop wallpaper"
                        >
                            <span>✕ Clear Desktop</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Main Widget Canvas — Pure, Clean Compact Widgets */}
            <main className="flex-1 w-full max-w-7xl px-4 py-6 flex flex-col items-center justify-start">
                {/* 1. DEV FOCUS MODE: 4 Core Widgets Side-by-Side in Clean Deck */}
                {view === 'focus' && (
                    <div className="w-full flex flex-col items-center gap-6">
                        <div className="text-center space-y-1">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-white/80 font-mono flex items-center justify-center gap-2">
                                <span>🎯</span>
                                <span>Developer Focus Suite</span>
                            </h2>
                            <p className="text-xs text-white/40">
                                Compact desktop cards — tick tasks, solve daily LeetCode, track streaks, and search with AI
                            </p>
                        </div>

                        {/* Responsive Compact Row/Grid of authentic 320-330px widget tiles */}
                        <div className="w-full flex flex-wrap items-start justify-center gap-5">
                            {/* Card 1: Today's Tasks Manager Widget */}
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-full flex items-center justify-between px-2 text-[11px] font-mono text-white/50">
                                    <span className="font-semibold text-blue-400">📋 Tasks Checklist</span>
                                    <button
                                        onClick={() => handlePopOut('tasks')}
                                        className="text-[10px] text-white/40 hover:text-white hover:underline cursor-pointer"
                                        title="Open as individual floating desktop window"
                                    >
                                        ↗ Float
                                    </button>
                                </div>
                                <MacTasksWidget
                                    tasks={tasks.tasks}
                                    doneTasks={tasks.doneTasks}
                                    completionRate={tasks.completionRate}
                                    onAdd={tasks.addTask}
                                    onToggle={tasks.toggleTask}
                                    onDelete={tasks.deleteTask}
                                    onTickAll={tasks.tickAllTasks}
                                    onFocusTask={async (taskId, minutes) => {
                                        if (window.electronAPI?.focus?.start) {
                                            await window.electronAPI.focus.start(taskId, minutes)
                                        }
                                    }}
                                    className="w-[330px] max-w-[330px]"
                                />
                            </div>

                            {/* Card 2: LeetCode Daily Widget */}
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-full flex items-center justify-between px-2 text-[11px] font-mono text-white/50">
                                    <span className="font-semibold text-amber-400">⚡ LeetCode Daily</span>
                                    <button
                                        onClick={() => handlePopOut('leetcode')}
                                        className="text-[10px] text-white/40 hover:text-white hover:underline cursor-pointer"
                                        title="Open as individual floating desktop window"
                                    >
                                        ↗ Float
                                    </button>
                                </div>
                                <LeetCodeWidget className="w-[330px] max-w-[330px]" />
                            </div>

                            {/* Card 3: Daily Habits & Goals Widget */}
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-full flex items-center justify-between px-2 text-[11px] font-mono text-white/50">
                                    <span className="font-semibold text-purple-400">🎯 Habits & Goals</span>
                                    <button
                                        onClick={() => handlePopOut('goals')}
                                        className="text-[10px] text-white/40 hover:text-white hover:underline cursor-pointer"
                                        title="Open as individual floating desktop window"
                                    >
                                        ↗ Float
                                    </button>
                                </div>
                                <MacGoalsWidget className="w-[330px] max-w-[330px]" />
                            </div>

                            {/* Card 4: ChatGPT Search Widget */}
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-full flex items-center justify-between px-2 text-[11px] font-mono text-white/50">
                                    <span className="font-semibold text-emerald-400">🤖 ChatGPT Box</span>
                                    <button
                                        onClick={() => handlePopOut('chatgpt')}
                                        className="text-[10px] text-white/40 hover:text-white hover:underline cursor-pointer"
                                        title="Open as individual floating desktop window"
                                    >
                                        ↗ Float
                                    </button>
                                </div>
                                <div className="w-[330px] max-w-[330px]">
                                    <ChatGPTSearchWidget className="w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. SINGLE TASKS WIDGET VIEW */}
                {view === 'tasks' && (
                    <div className="w-full flex flex-col items-center justify-center my-auto py-6 gap-3">
                        <div className="flex items-center justify-between w-[330px] px-1 text-xs font-mono text-white/60">
                            <span className="text-blue-400 font-bold">📋 Tasks Manager</span>
                            <button
                                onClick={() => handlePopOut('tasks')}
                                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] text-white/80 cursor-pointer"
                            >
                                ↗ Pop Out to Desktop
                            </button>
                        </div>
                        <MacTasksWidget
                            tasks={tasks.tasks}
                            doneTasks={tasks.doneTasks}
                            completionRate={tasks.completionRate}
                            onAdd={tasks.addTask}
                            onToggle={tasks.toggleTask}
                            onDelete={tasks.deleteTask}
                            onTickAll={tasks.tickAllTasks}
                            onFocusTask={async (taskId, minutes) => {
                                if (window.electronAPI?.focus?.start) {
                                    await window.electronAPI.focus.start(taskId, minutes)
                                }
                            }}
                            className="w-[330px] max-w-[330px]"
                        />
                    </div>
                )}

                {/* 3. SINGLE LEETCODE WIDGET VIEW */}
                {view === 'leetcode' && (
                    <div className="w-full flex flex-col items-center justify-center my-auto py-6 gap-3">
                        <div className="flex items-center justify-between w-[330px] px-1 text-xs font-mono text-white/60">
                            <span className="text-amber-400 font-bold">⚡ LeetCode Tracker</span>
                            <button
                                onClick={() => handlePopOut('leetcode')}
                                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] text-white/80 cursor-pointer"
                            >
                                ↗ Pop Out to Desktop
                            </button>
                        </div>
                        <LeetCodeWidget className="w-[330px] max-w-[330px]" />
                    </div>
                )}

                {/* 4. SINGLE GOALS WIDGET VIEW */}
                {view === 'goals' && (
                    <div className="w-full flex flex-col items-center justify-center my-auto py-6 gap-3">
                        <div className="flex items-center justify-between w-[330px] px-1 text-xs font-mono text-white/60">
                            <span className="text-purple-400 font-bold">🎯 Habits Tracker</span>
                            <button
                                onClick={() => handlePopOut('goals')}
                                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] text-white/80 cursor-pointer"
                            >
                                ↗ Pop Out to Desktop
                            </button>
                        </div>
                        <MacGoalsWidget className="w-[330px] max-w-[330px]" />
                    </div>
                )}

                {/* 5. SINGLE CHATGPT WIDGET VIEW */}
                {view === 'chatgpt' && (
                    <div className="w-full flex flex-col items-center justify-center my-auto py-6 gap-3">
                        <div className="flex items-center justify-between w-[330px] px-1 text-xs font-mono text-white/60">
                            <span className="text-emerald-400 font-bold">🤖 ChatGPT Assistant</span>
                            <button
                                onClick={() => handlePopOut('chatgpt')}
                                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] text-white/80 cursor-pointer"
                            >
                                ↗ Pop Out to Desktop
                            </button>
                        </div>
                        <div className="w-[330px] max-w-[330px]">
                            <ChatGPTSearchWidget className="w-full" />
                        </div>
                    </div>
                )}

                {/* 6. SINGLE SCREEN TIME WIDGET VIEW */}
                {view === 'screentime' && (
                    <div className="w-full flex flex-col items-center justify-center my-auto py-6 gap-3">
                        <div className="flex items-center justify-between w-[176px] px-1 text-xs font-mono text-white/60">
                            <span className="text-indigo-400 font-bold">⏱ Screen Time</span>
                            <button
                                onClick={() => handlePopOut('screentime')}
                                className="px-1.5 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] text-white/80 cursor-pointer"
                            >
                                ↗ Float
                            </button>
                        </div>
                        <ScreenTimeWidget
                            summary={screenTime.summary}
                            loading={screenTime.loading}
                            className="w-[176px] h-[176px]"
                        />
                    </div>
                )}

                {/* 7. SINGLE FLIP CLOCK WIDGET VIEW */}
                {view === 'clock' && (
                    <div className="w-full flex flex-col items-center justify-center my-auto py-6 gap-3">
                        <div className="flex items-center justify-between w-[280px] px-1 text-xs font-mono text-white/60">
                            <span className="text-white/90 font-bold">⌚ Retro Flip Clock</span>
                            <button
                                onClick={() => handlePopOut('clock')}
                                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] text-white/80 cursor-pointer"
                            >
                                ↗ Pop Out to Desktop
                            </button>
                        </div>
                        <div className="w-[280px]">
                            <RetroFlipClockWidget />
                        </div>
                    </div>
                )}

                {/* 8. ALL WIDGETS GALLERY */}
                {view === 'all' && (
                    <div className="w-full flex flex-col items-center gap-6">
                        <div className="text-center space-y-1">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-white/80 font-mono">
                                All Desktop Widgets
                            </h2>
                            <p className="text-xs text-white/40">
                                Click ↗ Float on any widget to pop it out as an independent window
                            </p>
                        </div>

                        <div className="w-full flex flex-wrap items-start justify-center gap-6">
                            {/* Tasks */}
                            <div className="flex flex-col items-center gap-1.5">
                                <span className="text-[11px] font-mono text-blue-400">📋 Tasks Checklist</span>
                                <MacTasksWidget
                                    tasks={tasks.tasks}
                                    doneTasks={tasks.doneTasks}
                                    completionRate={tasks.completionRate}
                                    onAdd={tasks.addTask}
                                    onToggle={tasks.toggleTask}
                                    onDelete={tasks.deleteTask}
                                    onTickAll={tasks.tickAllTasks}
                                    className="w-[330px] max-w-[330px]"
                                />
                            </div>

                            {/* LeetCode */}
                            <div className="flex flex-col items-center gap-1.5">
                                <span className="text-[11px] font-mono text-amber-400">⚡ LeetCode Daily</span>
                                <LeetCodeWidget className="w-[330px] max-w-[330px]" />
                            </div>

                            {/* Goals */}
                            <div className="flex flex-col items-center gap-1.5">
                                <span className="text-[11px] font-mono text-purple-400">🎯 Habits & Goals</span>
                                <MacGoalsWidget className="w-[330px] max-w-[330px]" />
                            </div>

                            {/* ChatGPT */}
                            <div className="flex flex-col items-center gap-1.5">
                                <span className="text-[11px] font-mono text-emerald-400">🤖 ChatGPT Box</span>
                                <div className="w-[330px]">
                                    <ChatGPTSearchWidget className="w-full" />
                                </div>
                            </div>

                            {/* App Launcher */}
                            <div className="flex flex-col items-center gap-1.5">
                                <span className="text-[11px] font-mono text-blue-400">🚀 App Launchpad</span>
                                <div className="w-[320px]">
                                    <AppLaunchpadWidget />
                                </div>
                            </div>

                            {/* Screen Time */}
                            <div className="flex flex-col items-center gap-1.5">
                                <span className="text-[11px] font-mono text-indigo-400">⏱ Screen Time</span>
                                <ScreenTimeWidget
                                    summary={screenTime.summary}
                                    loading={screenTime.loading}
                                    className="w-[176px] h-[176px]"
                                />
                            </div>

                            {/* Clock */}
                            <div className="flex flex-col items-center gap-1.5">
                                <span className="text-[11px] font-mono text-white/70">⌚ Retro Flip Clock</span>
                                <div className="w-[280px]">
                                    <RetroFlipClockWidget />
                                </div>
                            </div>

                            {/* Apple Clock */}
                            <div className="flex flex-col items-center gap-1.5">
                                <span className="text-[11px] font-mono text-white/70">⌚ Minimal Clock</span>
                                <div className="w-[176px]">
                                    <KevClockWidget />
                                </div>
                            </div>

                            {/* Battery */}
                            <div className="flex flex-col items-center gap-1.5">
                                <span className="text-[11px] font-mono text-emerald-400">🔋 Battery Monitor</span>
                                <div className="w-[176px]">
                                    <KevBatteryWidget />
                                </div>
                            </div>

                            {/* Weather */}
                            <div className="flex flex-col items-center gap-1.5">
                                <span className="text-[11px] font-mono text-cyan-400">🌦 Weather</span>
                                <div className="w-[320px]">
                                    <KevWeatherWidget />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
