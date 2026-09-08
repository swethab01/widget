import { useState, useEffect } from 'react'
import { TaskWidget } from '../components/TaskWidget'
import { FocusWidget } from '../components/FocusWidget'
import { ScreenTimeWidget } from '../components/ScreenTimeWidget'
import { ProductivityScore } from '../components/ProductivityScore'
import { DeveloperGoals } from '../components/DeveloperGoals'
import { QuickCapture } from '../components/QuickCapture'
import { FlowGuardianHUD } from '../components/FlowGuardianHUD'
import { GitPulseCard } from '../components/GitPulseCard'
import { useTasks } from '../hooks/useTasks'
import { useFocus } from '../hooks/useFocus'
import { useScreenTime } from '../hooks/useScreenTime'
import type { DailyScore, WidgetMode } from '../types'

const EMPTY_SCORE: DailyScore = {
    date: '',
    score: 0,
    tasks_pts: 0,
    focus_pts: 0,
    coding_pts: 0,
    distraction_pts: 0,
}

interface DashboardProps {
    onTriggerAddTask?: boolean
    mode?: WidgetMode
    onSwitchToCanvas?: () => void
}

export function Dashboard({ onTriggerAddTask, mode = 'normal', onSwitchToCanvas }: DashboardProps) {
    const tasks = useTasks()
    const focus = useFocus()
    const screenTime = useScreenTime()
    const [score, setScore] = useState<DailyScore>(EMPTY_SCORE)
    const [pulseRefreshTrigger, setPulseRefreshTrigger] = useState(0)

    useEffect(() => {
        window.electronAPI.score.getToday().then((s) => {
            if (s) setScore(s)
        })
        const id = setInterval(() => {
            window.electronAPI.score.getToday().then((s) => {
                if (s) setScore(s)
            })
        }, 60000)
        return () => clearInterval(id)
    }, [])

    // Refresh score and pulse when a task is toggled
    const handleToggle = async (id: number) => {
        await tasks.toggleTask(id)
        const s = await window.electronAPI.score.getToday()
        if (s) setScore(s)
        setPulseRefreshTrigger((prev) => prev + 1)
    }

    const handleStartFocusFromHUD = (taskId: number | null, minutes: number) => {
        focus.start(taskId, minutes)
    }

    const isExpanded = mode === 'expanded'

    return (
        <div className="flex-1 h-full overflow-y-auto p-3 scrollbar-hide animate-fade-in">
            {isExpanded ? (
                /* Dual-Pane Cockpit Layout for Expanded Mode (960px width) */
                <div className="grid grid-cols-12 gap-3 max-w-7xl mx-auto">
                    {/* Left Cockpit Column */}
                    <div className="col-span-6 space-y-3">
                        <FlowGuardianHUD
                            onStartFocus={handleStartFocusFromHUD}
                            onAddTask={() => {}}
                            refreshTrigger={pulseRefreshTrigger}
                        />
                        <QuickCapture onAdd={tasks.addTask} />
                        <TaskWidget
                            tasks={tasks.tasks}
                            doneTasks={tasks.doneTasks}
                            completionRate={tasks.completionRate}
                            onAdd={tasks.addTask}
                            onToggle={handleToggle}
                            onDelete={tasks.deleteTask}
                            onUpdate={tasks.updateTask}
                            showQuickAdd={onTriggerAddTask}
                            onFocusTask={(taskId, minutes) => focus.start(taskId, minutes)}
                        />
                        <FocusWidget
                            focusState={focus.focusState}
                            sessions={focus.sessions}
                            isComplete={focus.isComplete}
                            progress={focus.progress}
                            onStart={focus.start}
                            onPause={focus.pause}
                            onResume={focus.resume}
                            onStop={focus.stop}
                        />
                    </div>

                    {/* Right Cockpit Column */}
                    <div className="col-span-6 space-y-3">
                        <ProductivityScore score={score} />
                        <GitPulseCard />
                        <ScreenTimeWidget
                            summary={screenTime.summary}
                            loading={screenTime.loading}
                        />
                        <DeveloperGoals />
                    </div>
                </div>
            ) : (
                /* Sleek Single Column Layout for Normal Mode (440px width) */
                <div className="space-y-3 max-w-md mx-auto">
                    {onSwitchToCanvas && (
                        <div
                            onClick={onSwitchToCanvas}
                            className="p-3 rounded-2xl bg-gradient-to-r from-blue-600/25 via-purple-600/20 to-blue-600/15 border border-blue-500/40 flex items-center justify-between cursor-pointer hover:border-blue-400 hover:from-blue-600/35 transition-all shadow-lg group select-none"
                        >
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl">🖥️</span>
                                <div>
                                    <div className="text-xs font-bold text-white group-hover:text-blue-200 transition-colors">
                                        Desktop Wallpaper Canvas
                                    </div>
                                    <div className="text-[10px] text-white/60">
                                        Pick & place individual widgets on wallpaper
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-600 text-white font-semibold group-hover:bg-blue-500 shadow transition-colors">
                                Open ➔
                            </span>
                        </div>
                    )}

                    {/* Real-time Flow Guardian HUD */}
                    <FlowGuardianHUD
                        onStartFocus={handleStartFocusFromHUD}
                        onAddTask={() => {}}
                        refreshTrigger={pulseRefreshTrigger}
                    />

                    {/* Quick capture */}
                    <QuickCapture onAdd={tasks.addTask} />

                    {/* Tasks */}
                    <TaskWidget
                        tasks={tasks.tasks}
                        doneTasks={tasks.doneTasks}
                        completionRate={tasks.completionRate}
                        onAdd={tasks.addTask}
                        onToggle={handleToggle}
                        onDelete={tasks.deleteTask}
                        onUpdate={tasks.updateTask}
                        showQuickAdd={onTriggerAddTask}
                        onFocusTask={(taskId, minutes) => focus.start(taskId, minutes)}
                    />

                    {/* Focus + Screen Time row */}
                    <div className="grid grid-cols-2 gap-3">
                        <FocusWidget
                            focusState={focus.focusState}
                            sessions={focus.sessions}
                            isComplete={focus.isComplete}
                            progress={focus.progress}
                            onStart={focus.start}
                            onPause={focus.pause}
                            onResume={focus.resume}
                            onStop={focus.stop}
                        />
                        <ScreenTimeWidget
                            summary={screenTime.summary}
                            loading={screenTime.loading}
                        />
                    </div>

                    {/* Git Pulse */}
                    <GitPulseCard />

                    {/* Productivity Score */}
                    <ProductivityScore score={score} />

                    {/* Developer Goals */}
                    <DeveloperGoals />

                    {/* Footer */}
                    <div className="text-center pb-1">
                        <span className="text-[9px] text-text-muted font-mono">DevPulse • Deep Work Cockpit</span>
                    </div>
                </div>
            )}
        </div>
    )
}
