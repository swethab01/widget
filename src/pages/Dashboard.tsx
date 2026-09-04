import { useState, useEffect } from 'react'
import { TaskWidget } from '../components/TaskWidget'
import { FocusWidget } from '../components/FocusWidget'
import { ScreenTimeWidget } from '../components/ScreenTimeWidget'
import { ProductivityScore } from '../components/ProductivityScore'
import { DeveloperGoals } from '../components/DeveloperGoals'
import { QuickCapture } from '../components/QuickCapture'
import { useTasks } from '../hooks/useTasks'
import { useFocus } from '../hooks/useFocus'
import { useScreenTime } from '../hooks/useScreenTime'
import type { DailyScore } from '../types'

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
}

export function Dashboard({ onTriggerAddTask }: DashboardProps) {
    const tasks = useTasks()
    const focus = useFocus()
    const screenTime = useScreenTime()
    const [score, setScore] = useState<DailyScore>(EMPTY_SCORE)

    useEffect(() => {
        window.electronAPI.score.getToday().then((s) => {
            if (s) setScore(s)
        })
        // Refresh score every 2 minutes
        const id = setInterval(() => {
            window.electronAPI.score.getToday().then((s) => { if (s) setScore(s) })
        }, 120000)
        return () => clearInterval(id)
    }, [])

    // Refresh score when a task is toggled
    const handleToggle = async (id: number) => {
        await tasks.toggleTask(id)
        const s = await window.electronAPI.score.getToday()
        if (s) setScore(s)
    }

    // Smart recommendation
    const getRecommendation = () => {
        const highPriorityTodo = tasks.todoTasks.find((t) => t.priority === 'high')
        if (highPriorityTodo) {
            return `💡 Start with "${highPriorityTodo.title}" — it's high priority and due${highPriorityTodo.due_time ? ` at ${highPriorityTodo.due_time}` : ' today'} (est. ${highPriorityTodo.est_minutes}min)`
        }
        if (tasks.todoTasks.length > 0) {
            const next = tasks.todoTasks[0]
            return `✨ Next up: "${next.title}" (est. ${next.est_minutes}min)`
        }
        if (tasks.tasks.length > 0 && tasks.completionRate === 100) {
            return '🎉 All tasks complete! Great work today.'
        }
        return '💡 Add tasks to get smart recommendations.'
    }

    return (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide animate-fade-in">
            {/* Quick capture */}
            <QuickCapture onAdd={tasks.addTask} />

            {/* Smart recommendation */}
            {tasks.tasks.length > 0 && (
                <div className="px-3 py-2 bg-accent/10 border border-accent/20 rounded-xl">
                    <p className="text-[11px] text-text-secondary leading-relaxed">{getRecommendation()}</p>
                </div>
            )}

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

            {/* Productivity Score */}
            <ProductivityScore score={score} />

            {/* Developer Goals */}
            <DeveloperGoals />

            {/* DevPulse branding footer */}
            <div className="text-center pb-1">
                <span className="text-[9px] text-text-muted">DevPulse • Your coding. Your day.</span>
            </div>
        </div>
    )
}
