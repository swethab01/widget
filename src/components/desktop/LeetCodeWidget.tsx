import { useState, useEffect, useMemo } from 'react'
import type { LeetCodeProfileData, LeetCodeDailyQuestion, LeetCodeProblemItem } from '../../types'

interface LeetCodeWidgetProps {
    className?: string
    onClose?: () => void
    isEditMode?: boolean
}

// Generate realistic sample calendar for 197 active days
const SAMPLE_CALENDAR: Record<string, number> = (() => {
    const cal: Record<string, number> = {}
    const refNow = Math.floor(Date.now() / 1000)
    for (let i = 0; i < 365; i++) {
        if ((i * 7 + 3) % 11 > 3) {
            cal[String(refNow - i * 86400)] = ((i % 4) + 1)
        }
    }
    return cal
})()

const FALLBACK_PROFILE: LeetCodeProfileData = {
    username: 's4njay',
    realName: 'sanjay',
    ranking: 477036,
    streak: 46,
    maxStreak: 46,
    totalActiveDays: 197,
    solved: {
        all: 312,
        easy: 245,
        medium: 65,
        hard: 2,
    },
    allQuestionsCount: {
        all: 4046,
        easy: 963,
        medium: 2111,
        hard: 972,
    },
    submissionCalendar: SAMPLE_CALENDAR,
}

// Curated starter practice problems
const STARTER_PROBLEMS: LeetCodeProblemItem[] = [
    { id: 1, frontend_id: '1', title: 'Two Sum', difficulty: 'Easy', category: 'Arrays', url: 'https://leetcode.com/problems/two-sum/', completed: 1 },
    { id: 2, frontend_id: '20', title: 'Valid Parentheses', difficulty: 'Easy', category: 'Stack', url: 'https://leetcode.com/problems/valid-parentheses/', completed: 1 },
    { id: 3, frontend_id: '21', title: 'Merge Two Sorted Lists', difficulty: 'Easy', category: 'Linked List', url: 'https://leetcode.com/problems/merge-two-sorted-lists/', completed: 1 },
    { id: 4, frontend_id: '121', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', category: 'Sliding Window', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', completed: 1 },
    { id: 5, frontend_id: '3', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', category: 'Sliding Window', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', completed: 0 },
    { id: 6, frontend_id: '11', title: 'Container With Most Water', difficulty: 'Medium', category: 'Two Pointers', url: 'https://leetcode.com/problems/container-with-most-water/', completed: 0 },
    { id: 7, frontend_id: '15', title: '3Sum', difficulty: 'Medium', category: 'Two Pointers', url: 'https://leetcode.com/problems/3sum/', completed: 0 },
    { id: 8, frontend_id: '33', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', category: 'Binary Search', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', completed: 0 },
    { id: 9, frontend_id: '49', title: 'Group Anagrams', difficulty: 'Medium', category: 'Hashing', url: 'https://leetcode.com/problems/group-anagrams/', completed: 0 },
    { id: 10, frontend_id: '42', title: 'Trapping Rain Water', difficulty: 'Hard', category: 'Two Pointers', url: 'https://leetcode.com/problems/trapping-rain-water/', completed: 0 },
]

export function LeetCodeWidget({
    className = '',
    onClose,
}: LeetCodeWidgetProps) {
    const [profile, setProfile] = useState<LeetCodeProfileData>(() => {
        try {
            const cached = localStorage.getItem('devpulse_leetcode_cached_profile')
            if (cached) {
                const parsed = JSON.parse(cached)
                if (parsed && typeof parsed.solved?.all === 'number') {
                    return parsed
                }
            }
        } catch {}
        return FALLBACK_PROFILE
    })

    const [dailyQuestion, setDailyQuestion] = useState<LeetCodeDailyQuestion | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'stats' | 'checklist' | 'activity'>('stats')
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [usernameInput, setUsernameInput] = useState(() => {
        try {
            return localStorage.getItem('devpulse_leetcode_username') || 's4njay'
        } catch {
            return 's4njay'
        }
    })
    const [isSaving, setIsSaving] = useState(false)
    const [isSolvedToday, setIsSolvedToday] = useState(false)

    // Practice checklist states
    const [problems, setProblems] = useState<LeetCodeProblemItem[]>(STARTER_PROBLEMS)
    const [problemFilter, setProblemFilter] = useState<'all' | 'todo' | 'done' | 'Easy' | 'Medium' | 'Hard'>('all')
    const [checklistSearch, setChecklistSearch] = useState('')
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy')

    // Persist profile to cache
    useEffect(() => {
        if (profile && profile.solved?.all) {
            try {
                localStorage.setItem('devpulse_leetcode_cached_profile', JSON.stringify(profile))
            } catch {}
        }
    }, [profile])

    useEffect(() => {
        loadData(usernameInput)
        loadProblems()
        checkTodaySolved()
    }, [])

    const checkTodaySolved = () => {
        const todayStr = new Date().toISOString().slice(0, 10)
        const saved = localStorage.getItem(`devpulse_leetcode_solved_${todayStr}`)
        if (saved === 'true') {
            setIsSolvedToday(true)
        }
    }

    const loadData = async (usernameToFetch?: string) => {
        setIsLoading(true)
        setError(null)
        try {
            if (window.electronAPI?.leetcode?.getProfile) {
                const targetUser = usernameToFetch || usernameInput || 's4njay'
                const res = await window.electronAPI.leetcode.getProfile(targetUser)
                if (res.success && res.data) {
                    setProfile(res.data)
                    if (res.data.daily) {
                        setDailyQuestion(res.data.daily)
                    }
                    setUsernameInput(res.data.username)
                } else if (res.message) {
                    setError(res.message)
                }
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            setError(msg)
        } finally {
            setIsLoading(false)
        }
    }

    const loadProblems = async () => {
        try {
            if (window.electronAPI?.leetcode?.getProblems) {
                const list = await window.electronAPI.leetcode.getProblems()
                if (Array.isArray(list) && list.length > 0) {
                    setProblems(list)
                }
            }
        } catch (err) {
            console.error('Failed to load LeetCode problems:', err)
        }
    }

    const handleToggleProblem = async (id: number) => {
        setProblems((prev) =>
            prev.map((p) => {
                if (p.id === id) {
                    const next = Boolean(p.completed) ? 0 : 1
                    return {
                        ...p,
                        completed: next,
                        completed_at: next ? new Date().toISOString() : null,
                    }
                }
                return p
            })
        )

        try {
            if (window.electronAPI?.leetcode?.toggleProblem) {
                await window.electronAPI.leetcode.toggleProblem(id)
            }
        } catch (err) {
            console.error('Error toggling problem:', err)
            loadProblems()
        }
    }

    const handleAddProblem = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = newTitle.trim()
        if (!trimmed) return

        const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        const url = `https://leetcode.com/problems/${slug}/`

        const newProblemItem: LeetCodeProblemItem = {
            id: Date.now(),
            frontend_id: String(problems.length + 1),
            title: trimmed,
            difficulty: newDifficulty,
            category: 'Practice',
            url,
            completed: 0,
            created_at: new Date().toISOString(),
        }

        setProblems((prev) => [newProblemItem, ...prev])
        setNewTitle('')
        setIsAddOpen(false)

        try {
            if (window.electronAPI?.leetcode?.addProblem) {
                await window.electronAPI.leetcode.addProblem({
                    title: trimmed,
                    difficulty: newDifficulty,
                    category: 'Practice',
                    url,
                })
            }
        } catch (err) {
            console.error('Failed to add problem:', err)
        }
    }

    const handleDeleteProblem = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation()
        setProblems((prev) => prev.filter((p) => p.id !== id))
        try {
            if (window.electronAPI?.leetcode?.deleteProblem) {
                await window.electronAPI.leetcode.deleteProblem(id)
            }
        } catch {}
    }

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault()
        const cleanUser = usernameInput.trim()
        if (!cleanUser) return
        setIsSaving(true)
        setError(null)
        try {
            if (window.electronAPI?.leetcode?.getProfile) {
                const res = await window.electronAPI.leetcode.getProfile(cleanUser)
                if (res.success && res.data) {
                    setProfile(res.data)
                    if (res.data.daily) setDailyQuestion(res.data.daily)
                    localStorage.setItem('devpulse_leetcode_username', cleanUser)
                    setIsSettingsOpen(false)
                } else {
                    setError(res.message || 'User not found')
                }
            } else {
                localStorage.setItem('devpulse_leetcode_username', cleanUser)
                setIsSettingsOpen(false)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setIsSaving(false)
        }
    }

    const openExternal = (url: string) => {
        if (window.electronAPI?.openExternal) {
            window.electronAPI.openExternal(url)
        } else {
            window.open(url, '_blank')
        }
    }

    const handleToggleSolved = () => {
        const todayStr = new Date().toISOString().slice(0, 10)
        const next = !isSolvedToday
        setIsSolvedToday(next)
        localStorage.setItem(`devpulse_leetcode_solved_${todayStr}`, String(next))
    }

    // Solved stats
    const totalSolved = profile?.solved?.all || 312
    const totalQuestions = profile?.allQuestionsCount?.all || 4046
    const easySolved = profile?.solved?.easy || 245
    const easyTotal = profile?.allQuestionsCount?.easy || 963
    const medSolved = profile?.solved?.medium || 65
    const medTotal = profile?.allQuestionsCount?.medium || 2111
    const hardSolved = profile?.solved?.hard || 2
    const hardTotal = profile?.allQuestionsCount?.hard || 972

    // Checklist stats
    const checklistCompletedCount = useMemo(() => {
        return problems.filter((p) => Boolean(p.completed)).length
    }, [problems])

    const filteredProblems = useMemo(() => {
        return problems.filter((p) => {
            const matchesFilter =
                problemFilter === 'all'
                    ? true
                    : problemFilter === 'todo'
                    ? !Boolean(p.completed)
                    : problemFilter === 'done'
                    ? Boolean(p.completed)
                    : p.difficulty === problemFilter

            if (!matchesFilter) return false

            if (checklistSearch.trim()) {
                const query = checklistSearch.toLowerCase().trim()
                return (
                    p.title.toLowerCase().includes(query) ||
                    (p.category && p.category.toLowerCase().includes(query)) ||
                    (p.frontend_id && p.frontend_id.toLowerCase().includes(query))
                )
            }
            return true
        })
    }, [problems, problemFilter, checklistSearch])

    // Compact radial arc calculation (viewBox 0 0 74 74, radius = 27)
    const gaugeMath = useMemo(() => {
        const radius = 27
        const strokeWidth = 5.5
        const arcDegrees = 260
        const totalCircumference = 2 * Math.PI * radius
        const totalArcLength = (arcDegrees / 360) * totalCircumference
        const gapLength = totalCircumference - totalArcLength

        const solvedFraction = Math.min(1, totalSolved / (totalQuestions || 1))
        const solvedArc = solvedFraction * totalArcLength

        const easyFraction = totalSolved > 0 ? easySolved / totalSolved : 0
        const medFraction = totalSolved > 0 ? medSolved / totalSolved : 0
        const hardFraction = totalSolved > 0 ? hardSolved / totalSolved : 0

        return {
            radius,
            strokeWidth,
            totalCircumference,
            totalArcLength,
            gapLength,
            easyArc: solvedArc * easyFraction,
            medArc: solvedArc * medFraction,
            hardArc: solvedArc * hardFraction,
            solvedArc,
        }
    }, [totalSolved, totalQuestions, easySolved, medSolved, hardSolved])

    // Compact 16-week contribution heatmap
    const heatmapWeeks = useMemo(() => {
        const weeksCount = 16
        const days = []
        const now = new Date()
        const calendar = profile?.submissionCalendar || {}

        for (let i = weeksCount * 7 - 1; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(now.getDate() - i)
            const timestamp = Math.floor(d.setHours(0, 0, 0, 0) / 1000)
            const count = calendar[String(timestamp)] || 0
            days.push({ count, date: d.toISOString().slice(0, 10) })
        }
        return days
    }, [profile])

    const dailyTitle = dailyQuestion?.title || '121. Best Time to Buy and Sell Stock'
    const dailyDifficulty = dailyQuestion?.difficulty || 'Easy'
    const dailyUrl = dailyQuestion?.link || 'https://leetcode.com/problemset/all/'

    const getDiffBadgeColor = (diff: string) => {
        switch (diff) {
            case 'Easy':
                return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
            case 'Medium':
                return 'text-amber-400 bg-amber-500/15 border-amber-500/30'
            case 'Hard':
                return 'text-rose-400 bg-rose-500/15 border-rose-500/30'
            default:
                return 'text-white/60 bg-white/10 border-white/20'
        }
    }

    return (
        <div
            className={`mac-widget-tile p-3 w-[320px] max-w-[320px] select-none relative group transition-all duration-200 flex flex-col gap-2 rounded-[22px] overflow-hidden bg-gradient-to-b from-[#141724]/95 via-[#0e1017]/95 to-[#0a0b10]/95 border border-white/[0.12] shadow-2xl ${className}`}
        >
            <div className="flex flex-col gap-2">
                {/* 1. Sleek Compact Header */}
                <div
                    className="flex items-center justify-between mb-2 shrink-0 cursor-grab active:cursor-grabbing"
                    style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
                    title="Drag to move widget anywhere on desktop"
                >
                    {/* Left: Icon & Username Pill */}
                    <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#ffa116] to-[#e68a00] flex items-center justify-center text-xs font-black text-black shadow-[0_0_12px_rgba(255,161,22,0.4)] shrink-0">
                            ⚡
                        </div>
                        <div className="flex items-center gap-1 min-w-0">
                            <span className="font-extrabold text-[11px] tracking-wider uppercase text-white/90 font-mono">
                                LEETCODE
                            </span>
                            <button
                                type="button"
                                onClick={() => openExternal(`https://leetcode.com/u/${profile?.username || 's4njay'}/`)}
                                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                                className="flex items-center gap-1 text-[10px] font-semibold text-[#ffa116] bg-[#ffa116]/10 hover:bg-[#ffa116]/20 px-1.5 py-0.5 rounded-full border border-[#ffa116]/30 transition-all cursor-pointer truncate max-w-[100px]"
                                title="Open Profile on LeetCode"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                                <span className="truncate">@{profile?.username || 's4njay'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Streak & Control Buttons */}
                    <div
                        className="flex items-center gap-1 shrink-0"
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    >
                        {/* Streak Badge */}
                        <span
                            className="flex items-center gap-0.5 text-[10px] font-bold text-[#ffa116] bg-[#ffa116]/10 px-1.5 py-0.5 rounded-full border border-[#ffa116]/30 font-mono shadow-sm"
                            title="Consecutive Day Streak"
                        >
                            <span>🔥</span>
                            <span>{profile?.streak ?? 46}d</span>
                        </span>

                        {/* Refresh */}
                        <button
                            type="button"
                            onClick={() => {
                                loadData(profile?.username)
                                loadProblems()
                            }}
                            disabled={isLoading}
                            className="w-6 h-6 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white text-[11px] flex items-center justify-center cursor-pointer transition-all active:scale-90"
                            title="Refresh LeetCode Data"
                        >
                            <span className={isLoading ? 'animate-spin' : ''}>↻</span>
                        </button>

                        {/* Settings Button */}
                        <button
                            type="button"
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={`w-6 h-6 rounded-lg border text-[11px] flex items-center justify-center cursor-pointer transition-all active:scale-90 ${
                                isSettingsOpen
                                    ? 'bg-[#ffa116]/20 border-[#ffa116]/50 text-[#ffa116]'
                                    : 'bg-white/[0.05] hover:bg-white/[0.12] border-white/10 text-white/70 hover:text-white'
                            }`}
                            title="Configure Account"
                        >
                            ⚙
                        </button>

                        {/* Close button if provided */}
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-6 h-6 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white text-[10px] flex items-center justify-center cursor-pointer transition-all active:scale-90 border border-white/20 font-bold ml-0.5"
                                title="Close Widget"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Inline Connect Settings Drawer */}
                {isSettingsOpen && (
                    <div
                        className="mb-2 p-2 rounded-xl bg-[#121522] border border-[#ffa116]/40 shadow-xl text-xs shrink-0 animate-fade-in"
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-[11px] text-white flex items-center gap-1">
                                <span className="text-[#ffa116]">⚡</span>
                                <span>Change Username</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsSettingsOpen(false)}
                                className="text-white/40 hover:text-white text-[10px]"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleConnect} className="flex gap-1.5">
                            <input
                                type="text"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                placeholder="LeetCode username (e.g. s4njay)"
                                className="flex-1 px-2.5 py-1 rounded-lg bg-[#1c2030] border border-white/15 text-white text-xs placeholder-white/30 focus:outline-none focus:border-[#ffa116] font-mono"
                            />
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="py-1 px-3 rounded-lg bg-gradient-to-r from-[#ffa116] to-[#ffb034] text-black font-extrabold text-xs cursor-pointer disabled:opacity-50 shadow-sm hover:brightness-110 active:scale-95"
                            >
                                {isSaving ? '...' : 'Sync'}
                            </button>
                        </form>
                        {error && <div className="text-[10px] text-rose-400 mt-1">{error}</div>}
                    </div>
                )}

                {/* 2. Compact Segmented Navigation */}
                <div
                    className="flex items-center gap-1 p-0.5 bg-[#10131d]/90 border border-white/[0.08] rounded-xl mb-2 shrink-0"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                    <button
                        type="button"
                        onClick={() => setActiveTab('stats')}
                        className={`flex-1 py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            activeTab === 'stats'
                                ? 'bg-[#202538] text-white shadow-sm border border-white/15'
                                : 'text-white/50 hover:text-white'
                        }`}
                    >
                        <span>⭕</span>
                        <span>Stats ({totalSolved})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('checklist')}
                        className={`flex-1 py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            activeTab === 'checklist'
                                ? 'bg-[#ffa116]/20 text-[#ffa116] shadow-sm border border-[#ffa116]/40 font-black'
                                : 'text-white/50 hover:text-white'
                        }`}
                    >
                        <span>📋</span>
                        <span>Practice ({checklistCompletedCount}/{problems.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('activity')}
                        className={`flex-1 py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            activeTab === 'activity'
                                ? 'bg-[#202538] text-white shadow-sm border border-white/15'
                                : 'text-white/50 hover:text-white'
                        }`}
                    >
                        <span>🟩</span>
                        <span>Activity</span>
                    </button>
                </div>

                {/* 3. TAB CONTENT VIEWS */}
                <div
                    className="flex flex-col gap-2"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                    {/* TAB 1: COMPACT STATS & GAUGE */}
                    {activeTab === 'stats' && (
                        <div className="flex flex-col gap-2">
                            {/* Side-by-side Progress Gauge & Difficulty Breakdown */}
                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#141724]/80 border border-white/[0.08] shrink-0">
                                {/* Left: Compact Circular Arc SVG Gauge */}
                                <div className="relative w-[76px] h-[72px] flex items-center justify-center shrink-0">
                                    <svg className="w-[76px] h-[72px] transform rotate-[140deg]" viewBox="0 0 74 74">
                                        {/* Background track */}
                                        <circle
                                            cx="37"
                                            cy="37"
                                            r={gaugeMath.radius}
                                            fill="none"
                                            stroke="#1e2230"
                                            strokeWidth={gaugeMath.strokeWidth}
                                            strokeDasharray={`${gaugeMath.totalArcLength} ${gaugeMath.gapLength}`}
                                            strokeLinecap="round"
                                        />
                                        {/* Hard progress */}
                                        {gaugeMath.hardArc > 0 && (
                                            <circle
                                                cx="37"
                                                cy="37"
                                                r={gaugeMath.radius}
                                                fill="none"
                                                stroke="#ef4444"
                                                strokeWidth={gaugeMath.strokeWidth}
                                                strokeDasharray={`${gaugeMath.hardArc} ${gaugeMath.totalCircumference - gaugeMath.hardArc}`}
                                                strokeDashoffset={-(gaugeMath.easyArc + gaugeMath.medArc)}
                                                strokeLinecap="round"
                                            />
                                        )}
                                        {/* Medium progress */}
                                        {gaugeMath.medArc > 0 && (
                                            <circle
                                                cx="37"
                                                cy="37"
                                                r={gaugeMath.radius}
                                                fill="none"
                                                stroke="#f59e0b"
                                                strokeWidth={gaugeMath.strokeWidth}
                                                strokeDasharray={`${gaugeMath.medArc} ${gaugeMath.totalCircumference - gaugeMath.medArc}`}
                                                strokeDashoffset={-gaugeMath.easyArc}
                                                strokeLinecap="round"
                                            />
                                        )}
                                        {/* Easy progress */}
                                        {gaugeMath.easyArc > 0 && (
                                            <circle
                                                cx="37"
                                                cy="37"
                                                r={gaugeMath.radius}
                                                fill="none"
                                                stroke="#10b981"
                                                strokeWidth={gaugeMath.strokeWidth}
                                                strokeDasharray={`${gaugeMath.easyArc} ${gaugeMath.totalCircumference - gaugeMath.easyArc}`}
                                                strokeDashoffset="0"
                                                strokeLinecap="round"
                                            />
                                        )}
                                    </svg>

                                    {/* Inside Arc: Total Count */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <span className="text-base font-black text-white leading-tight font-mono">
                                            {totalSolved}
                                        </span>
                                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-tighter -mt-0.5">
                                            SOLVED
                                        </span>
                                    </div>
                                </div>

                                {/* Right: Difficulty Bars */}
                                <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
                                    {/* Easy */}
                                    <div>
                                        <div className="flex items-center justify-between text-[10px] font-mono leading-none mb-0.5">
                                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                <span>Easy</span>
                                            </span>
                                            <span className="text-white/60">
                                                <span className="font-bold text-white">{easySolved}</span>
                                                <span className="text-white/30">/{easyTotal}</span>
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, (easySolved / (easyTotal || 1)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Medium */}
                                    <div>
                                        <div className="flex items-center justify-between text-[10px] font-mono leading-none mb-0.5">
                                            <span className="text-amber-400 font-bold flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                <span>Medium</span>
                                            </span>
                                            <span className="text-white/60">
                                                <span className="font-bold text-white">{medSolved}</span>
                                                <span className="text-white/30">/{medTotal}</span>
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, (medSolved / (medTotal || 1)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Hard */}
                                    <div>
                                        <div className="flex items-center justify-between text-[10px] font-mono leading-none mb-0.5">
                                            <span className="text-rose-400 font-bold flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                                <span>Hard</span>
                                            </span>
                                            <span className="text-white/60">
                                                <span className="font-bold text-white">{hardSolved}</span>
                                                <span className="text-white/30">/{hardTotal}</span>
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-rose-400 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, (hardSolved / (hardTotal || 1)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Daily Challenge Card with 1-Click Tick Button */}
                            <div className="p-2.5 rounded-xl bg-[#141724]/90 border border-white/[0.08] shrink-0">
                                <div className="flex items-center justify-between text-[9px] font-mono text-white/50 mb-1.5 uppercase tracking-wider">
                                    <span className="flex items-center gap-1 text-[#ffa116] font-bold">
                                        <span>⚡</span>
                                        <span>Daily Problem</span>
                                    </span>
                                    <span>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    {/* Left: Tick Box & Title */}
                                    <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                                        <button
                                            type="button"
                                            onClick={handleToggleSolved}
                                            className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-150 shadow-sm ${
                                                isSolvedToday
                                                    ? 'bg-emerald-500 border-emerald-400 text-black font-extrabold text-xs shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                                    : 'border-white/30 bg-white/[0.04] hover:border-emerald-400 hover:bg-emerald-500/20 active:scale-90'
                                            }`}
                                            title={isSolvedToday ? 'Mark as not solved today' : 'Tick when solved!'}
                                        >
                                            {isSolvedToday ? '✓' : ''}
                                        </button>

                                        <div
                                            onClick={() => openExternal(dailyUrl)}
                                            className="flex items-center gap-1.5 truncate cursor-pointer group/title"
                                            title="Click to solve on LeetCode"
                                        >
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono border ${getDiffBadgeColor(dailyDifficulty)}`}>
                                                {dailyDifficulty}
                                            </span>
                                            <span
                                                className={`text-xs font-semibold truncate group-hover/title:text-[#ffa116] transition-colors ${
                                                    isSolvedToday ? 'line-through text-white/40' : 'text-white/90'
                                                }`}
                                            >
                                                {dailyTitle}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Open External Button */}
                                    <button
                                        type="button"
                                        onClick={() => openExternal(dailyUrl)}
                                        className="px-2 py-1 rounded-lg bg-[#ffa116]/15 hover:bg-[#ffa116]/25 border border-[#ffa116]/30 text-[#ffa116] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0 active:scale-95"
                                        title="Solve on LeetCode website"
                                    >
                                        <span>Solve</span>
                                        <span>↗</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: PRACTICE CHECKLIST */}
                    {activeTab === 'checklist' && (
                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                            {/* Search & Filter Bar */}
                            <div className="flex items-center gap-1.5 mb-1.5 shrink-0">
                                <input
                                    type="text"
                                    placeholder="Search practice problems..."
                                    value={checklistSearch}
                                    onChange={(e) => setChecklistSearch(e.target.value)}
                                    className="flex-1 px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 outline-none focus:border-[#ffa116]/60 font-sans"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsAddOpen(!isAddOpen)}
                                    className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[10px] font-bold text-white transition-all cursor-pointer"
                                >
                                    + Add
                                </button>
                            </div>

                            {/* Add Problem Drawer */}
                            {isAddOpen && (
                                <form onSubmit={handleAddProblem} className="p-2 rounded-xl bg-black/70 border border-white/10 mb-1.5 shrink-0 flex gap-1.5 animate-fade-in">
                                    <input
                                        type="text"
                                        placeholder="Problem name (e.g. Reverse Linked List)"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        className="flex-1 px-2 py-1 rounded-lg bg-[#181c2a] border border-white/15 text-xs text-white placeholder-white/30 outline-none font-sans"
                                    />
                                    <select
                                        value={newDifficulty}
                                        onChange={(e) => setNewDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                                        className="px-1.5 py-1 rounded-lg bg-[#181c2a] border border-white/15 text-[10px] text-white outline-none"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={!newTitle.trim()}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] cursor-pointer disabled:opacity-40"
                                    >
                                        Save
                                    </button>
                                </form>
                            )}

                            {/* Filter Chips */}
                            <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-1 scrollbar-hide text-[9px] shrink-0 font-mono">
                                {(['all', 'todo', 'done', 'Easy', 'Medium', 'Hard'] as const).map((filterVal) => (
                                    <button
                                        key={filterVal}
                                        type="button"
                                        onClick={() => setProblemFilter(filterVal)}
                                        className={`px-2 py-0.5 rounded-full capitalize cursor-pointer transition-all ${
                                            problemFilter === filterVal
                                                ? 'bg-[#ffa116]/25 text-[#ffa116] border border-[#ffa116]/40 font-bold'
                                                : 'text-white/40 hover:text-white bg-white/[0.03]'
                                        }`}
                                    >
                                        {filterVal}
                                    </button>
                                ))}
                            </div>

                            {/* Problem List */}
                            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 space-y-1 pr-0.5 min-h-0">
                                {filteredProblems.length === 0 ? (
                                    <div className="text-center py-6 text-xs text-white/40 font-mono">
                                        No problems match your filter
                                    </div>
                                ) : (
                                    filteredProblems.map((p) => {
                                        const isDone = Boolean(p.completed)
                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => handleToggleProblem(p.id)}
                                                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer select-none ${
                                                    isDone
                                                        ? 'bg-emerald-500/[0.04] border-emerald-500/20'
                                                        : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.06] hover:border-white/15'
                                                }`}
                                            >
                                                {/* Left: Tick Box & Title */}
                                                <div className="flex items-center gap-2 truncate flex-1 mr-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleToggleProblem(p.id)
                                                        }}
                                                        className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${
                                                            isDone
                                                                ? 'bg-emerald-500 border-emerald-400 text-black font-extrabold text-[9px]'
                                                                : 'border-white/30 bg-white/[0.03] hover:border-emerald-400'
                                                        }`}
                                                    >
                                                        {isDone ? '✓' : ''}
                                                    </button>
                                                    <span className={`text-[8px] px-1 py-0.2 rounded font-bold font-mono border ${getDiffBadgeColor(p.difficulty)}`}>
                                                        {p.difficulty}
                                                    </span>
                                                    <span
                                                        className={`text-xs truncate font-medium ${
                                                            isDone ? 'line-through text-white/40' : 'text-white/90 group-hover:text-white'
                                                        }`}
                                                        title={p.title}
                                                    >
                                                        {p.frontend_id ? `${p.frontend_id}. ` : ''}{p.title}
                                                    </span>
                                                </div>

                                                {/* Right: Actions */}
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            openExternal(p.url)
                                                        }}
                                                        className="text-[10px] text-white/40 hover:text-[#ffa116] px-1 py-0.5"
                                                        title="Open problem on LeetCode"
                                                    >
                                                        ↗
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleDeleteProblem(p.id, e)}
                                                        className="opacity-0 group-hover:opacity-100 text-[10px] text-white/30 hover:text-rose-400 px-0.5 transition-opacity"
                                                        title="Delete from checklist"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: ACTIVITY HEATMAP */}
                    {activeTab === 'activity' && (
                        <div className="flex-1 flex flex-col justify-between p-2 rounded-xl bg-[#141724]/80 border border-white/[0.08] overflow-hidden">
                            <div className="flex items-center justify-between text-[10px] font-mono text-white/60 mb-2 shrink-0">
                                <span className="font-bold text-white">
                                    {profile?.totalActiveDays ?? 197} Active Days
                                </span>
                                <span className="text-[#ffa116] font-bold">
                                    🔥 {profile?.maxStreak ?? 46}d Best Streak
                                </span>
                            </div>

                            {/* 16-Week Mini Heatmap Grid */}
                            <div className="flex-1 flex items-center justify-center overflow-hidden">
                                <div className="grid grid-flow-col grid-rows-7 gap-1">
                                    {heatmapWeeks.map((day, idx) => {
                                        let bg = 'bg-white/[0.06]'
                                        if (day.count > 3) bg = 'bg-[#10b981]'
                                        else if (day.count > 1) bg = 'bg-[#10b981]/70'
                                        else if (day.count > 0) bg = 'bg-[#10b981]/40'

                                        return (
                                            <div
                                                key={idx}
                                                className={`w-2.5 h-2.5 rounded-[2px] ${bg} transition-transform hover:scale-125`}
                                                title={`${day.date}: ${day.count} submissions`}
                                            />
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[9px] font-mono text-white/40 mt-1.5 shrink-0">
                                <span>Less</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-[2px] bg-white/[0.06]" />
                                    <div className="w-2 h-2 rounded-[2px] bg-[#10b981]/40" />
                                    <div className="w-2 h-2 rounded-[2px] bg-[#10b981]/70" />
                                    <div className="w-2 h-2 rounded-[2px] bg-[#10b981]" />
                                </div>
                                <span>More</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Status */}
            <div className="mt-1.5 pt-1.5 border-t border-white/[0.08] flex items-center justify-between text-[9px] font-mono text-white/40 shrink-0">
                <span>Rank #{profile?.ranking?.toLocaleString() ?? '477,036'}</span>
                <span className="text-[#ffa116] font-semibold">{totalSolved} Solved</span>
            </div>
        </div>
    )
}
