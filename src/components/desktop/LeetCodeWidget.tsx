import { useState, useEffect, useMemo } from 'react'
import type { LeetCodeProfileData, LeetCodeDailyQuestion, LeetCodeProblemItem } from '../../types'

interface LeetCodeWidgetProps {
    className?: string
    onClose?: () => void
    isEditMode?: boolean
}

// Generate realistic sample calendar for Sanjay's 197 active days
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

// Fallback profile if network is initially delayed
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

// Curated starter problems (Blind 75 & Top Interview)
const STARTER_PROBLEMS: LeetCodeProblemItem[] = [
    { id: 1, frontend_id: '1', title: 'Two Sum', difficulty: 'Easy', category: 'Arrays & Hashing', url: 'https://leetcode.com/problems/two-sum/', completed: 1 },
    { id: 2, frontend_id: '20', title: 'Valid Parentheses', difficulty: 'Easy', category: 'Stack', url: 'https://leetcode.com/problems/valid-parentheses/', completed: 1 },
    { id: 3, frontend_id: '21', title: 'Merge Two Sorted Lists', difficulty: 'Easy', category: 'Linked List', url: 'https://leetcode.com/problems/merge-two-sorted-lists/', completed: 1 },
    { id: 4, frontend_id: '121', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', category: 'Sliding Window', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', completed: 1 },
    { id: 5, frontend_id: '125', title: 'Valid Palindrome', difficulty: 'Easy', category: 'Two Pointers', url: 'https://leetcode.com/problems/valid-palindrome/', completed: 1 },
    { id: 6, frontend_id: '226', title: 'Invert Binary Tree', difficulty: 'Easy', category: 'Trees', url: 'https://leetcode.com/problems/invert-binary-tree/', completed: 1 },
    { id: 7, frontend_id: '242', title: 'Valid Anagram', difficulty: 'Easy', category: 'Arrays & Hashing', url: 'https://leetcode.com/problems/valid-anagram/', completed: 1 },
    { id: 8, frontend_id: '704', title: 'Binary Search', difficulty: 'Easy', category: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/', completed: 1 },
    { id: 9, frontend_id: '3', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', category: 'Sliding Window', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', completed: 0 },
    { id: 10, frontend_id: '11', title: 'Container With Most Water', difficulty: 'Medium', category: 'Two Pointers', url: 'https://leetcode.com/problems/container-with-most-water/', completed: 0 },
    { id: 11, frontend_id: '15', title: '3Sum', difficulty: 'Medium', category: 'Two Pointers', url: 'https://leetcode.com/problems/3sum/', completed: 0 },
    { id: 12, frontend_id: '33', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', category: 'Binary Search', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', completed: 0 },
    { id: 13, frontend_id: '49', title: 'Group Anagrams', difficulty: 'Medium', category: 'Arrays & Hashing', url: 'https://leetcode.com/problems/group-anagrams/', completed: 0 },
    { id: 14, frontend_id: '128', title: 'Longest Consecutive Sequence', difficulty: 'Medium', category: 'Arrays & Hashing', url: 'https://leetcode.com/problems/longest-consecutive-sequence/', completed: 0 },
    { id: 15, frontend_id: '153', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', category: 'Binary Search', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', completed: 0 },
    { id: 16, frontend_id: '200', title: 'Number of Islands', difficulty: 'Medium', category: 'Graphs', url: 'https://leetcode.com/problems/number-of-islands/', completed: 0 },
    { id: 17, frontend_id: '238', title: 'Product of Array Except Self', difficulty: 'Medium', category: 'Arrays & Hashing', url: 'https://leetcode.com/problems/product-of-array-except-self/', completed: 0 },
    { id: 18, frontend_id: '42', title: 'Trapping Rain Water', difficulty: 'Hard', category: 'Two Pointers', url: 'https://leetcode.com/problems/trapping-rain-water/', completed: 0 },
    { id: 19, frontend_id: '295', title: 'Find Median from Data Stream', difficulty: 'Hard', category: 'Heap / Priority Queue', url: 'https://leetcode.com/problems/find-median-from-data-stream/', completed: 0 },
    { id: 20, frontend_id: '76', title: 'Minimum Window Substring', difficulty: 'Hard', category: 'Sliding Window', url: 'https://leetcode.com/problems/minimum-window-substring/', completed: 0 },
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
    const [activeTab, setActiveTab] = useState<'gauge' | 'graph' | 'checklist'>('gauge')
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [usernameInput, setUsernameInput] = useState(() => {
        try {
            return localStorage.getItem('devpulse_leetcode_username') || 's4njay'
        } catch {
            return 's4njay'
        }
    })
    const [isSaving, setIsSaving] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSolvedToday, setIsSolvedToday] = useState(false)

    // Save profile to cache whenever it updates
    useEffect(() => {
        if (profile && profile.solved?.all) {
            try {
                localStorage.setItem('devpulse_leetcode_cached_profile', JSON.stringify(profile))
            } catch {}
        }
    }, [profile])

    // Practice checklist states
    const [problems, setProblems] = useState<LeetCodeProblemItem[]>(STARTER_PROBLEMS)
    const [problemFilter, setProblemFilter] = useState<'all' | 'todo' | 'done' | 'Easy' | 'Medium' | 'Hard'>('all')
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy')
    const [newCategory, setNewCategory] = useState('Arrays & Hashing')
    const [newUrl, setNewUrl] = useState('')
    const [newFrontendId, setNewFrontendId] = useState('')
    const [checklistSearch, setChecklistSearch] = useState('')
    const [hoveredCell, setHoveredCell] = useState<{ dateStr: string; count: number } | null>(null)

    useEffect(() => {
        loadData('s4njay')
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
                const targetUser = usernameToFetch || 's4njay'
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
                if (list && list.length > 0) {
                    setProblems(list)
                }
            }
        } catch (err) {
            console.error('Failed to load LeetCode problems:', err)
        }
    }

    const handleToggleProblem = async (id: number) => {
        // Optimistic UI update
        setProblems(prev =>
            prev.map(p => {
                if (p.id === id) {
                    const nextCompleted = Boolean(p.completed) ? 0 : 1
                    return {
                        ...p,
                        completed: nextCompleted,
                        completed_at: nextCompleted ? new Date().toISOString() : null,
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
        const trimmedTitle = newTitle.trim()
        if (!trimmedTitle) return

        let finalUrl = newUrl.trim()
        if (!finalUrl) {
            const slug = trimmedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            finalUrl = `https://leetcode.com/problems/${slug}/`
        }

        try {
            if (window.electronAPI?.leetcode?.addProblem) {
                const res = await window.electronAPI.leetcode.addProblem({
                    frontend_id: newFrontendId.trim() || undefined,
                    title: trimmedTitle,
                    difficulty: newDifficulty,
                    category: newCategory.trim() || 'Algorithms',
                    url: finalUrl,
                })
                if (res.success && res.data) {
                    setProblems(prev => [res.data!, ...prev])
                } else {
                    loadProblems()
                }
            } else {
                const mockItem: LeetCodeProblemItem = {
                    id: Date.now(),
                    frontend_id: newFrontendId.trim() || String(problems.length + 1),
                    title: trimmedTitle,
                    difficulty: newDifficulty,
                    category: newCategory.trim() || 'Algorithms',
                    url: finalUrl,
                    completed: 0,
                    created_at: new Date().toISOString(),
                }
                setProblems(prev => [mockItem, ...prev])
            }

            // Reset form
            setNewTitle('')
            setNewFrontendId('')
            setNewUrl('')
            setIsAddOpen(false)
        } catch (err) {
            console.error('Failed to add problem:', err)
        }
    }

    const handleDeleteProblem = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation()
        setProblems(prev => prev.filter(p => p.id !== id))
        try {
            if (window.electronAPI?.leetcode?.deleteProblem) {
                await window.electronAPI.leetcode.deleteProblem(id)
            }
        } catch (err) {
            console.error('Failed to delete problem:', err)
            loadProblems()
        }
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
                    setIsSettingsOpen(false)
                } else {
                    setError(res.message || `User "${cleanUser}" not found.`)
                }
            }
        } catch (err: unknown) {
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return
        openExternal(`https://leetcode.com/problemset/all/?search=${encodeURIComponent(searchQuery.trim())}`)
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
        return problems.filter(p => Boolean(p.completed)).length
    }, [problems])

    const checklistCounts = useMemo(() => {
        const todo = problems.filter(p => !Boolean(p.completed)).length
        const done = problems.filter(p => Boolean(p.completed)).length
        const easy = problems.filter(p => p.difficulty === 'Easy').length
        const med = problems.filter(p => p.difficulty === 'Medium').length
        const hard = problems.filter(p => p.difficulty === 'Hard').length
        return { all: problems.length, todo, done, easy, med, hard }
    }, [problems])

    const filteredProblems = useMemo(() => {
        return problems.filter(p => {
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
                const matchTitle = p.title.toLowerCase().includes(query)
                const matchCategory = p.category?.toLowerCase().includes(query)
                const matchId = p.frontend_id?.toLowerCase().includes(query)
                return matchTitle || matchCategory || matchId
            }
            return true
        })
    }, [problems, problemFilter, checklistSearch])

    // Compute 260-degree arc gauge SVG math
    const gaugeMath = useMemo(() => {
        const radius = 64
        const strokeWidth = 9
        const arcDegrees = 260
        const totalCircumference = 2 * Math.PI * radius
        const totalArcLength = (arcDegrees / 360) * totalCircumference
        const gapLength = totalCircumference - totalArcLength

        const solvedFraction = Math.min(1, totalSolved / (totalQuestions || 1))
        const solvedArc = solvedFraction * totalArcLength

        const easyFraction = totalSolved > 0 ? (easySolved / totalSolved) : 0
        const medFraction = totalSolved > 0 ? (medSolved / totalSolved) : 0
        const hardFraction = totalSolved > 0 ? (hardSolved / totalSolved) : 0

        const easyArc = solvedArc * easyFraction
        const medArc = solvedArc * medFraction
        const hardArc = solvedArc * hardFraction

        return {
            radius,
            strokeWidth,
            totalCircumference,
            totalArcLength,
            gapLength,
            easyArc,
            medArc,
            hardArc,
            solvedArc,
        }
    }, [totalSolved, totalQuestions, easySolved, medSolved, hardSolved])

    // Generate real 1-year contribution heatmap cells
    const heatmapData = useMemo(() => {
        const weeks = 36
        const now = new Date()
        const calendar = profile?.submissionCalendar || {}

        const months: { label: string; col: number }[] = []
        let lastMonth = -1

        const grid: { timestamp: number; count: number; dateStr: string }[][] = []

        const startDate = new Date(now)
        startDate.setDate(now.getDate() - (weeks * 7) + (7 - now.getDay()))

        const iter = new Date(startDate)

        for (let w = 0; w < weeks; w++) {
            const weekCol: { timestamp: number; count: number; dateStr: string }[] = []
            for (let d = 0; d < 7; d++) {
                const year = iter.getFullYear()
                const month = iter.getMonth()
                const day = iter.getDate()

                if (d === 0 && month !== lastMonth) {
                    months.push({
                        label: iter.toLocaleString('default', { month: 'short' }),
                        col: w,
                    })
                    lastMonth = month
                }

                const utcMidnight = Date.UTC(year, month, day) / 1000
                let count = calendar[utcMidnight] || 0
                if (!count) {
                    for (const [tsStr, c] of Object.entries(calendar)) {
                        const ts = Number(tsStr)
                        if (Math.abs(ts - utcMidnight) < 43200) {
                            count = c
                            break
                        }
                    }
                }

                weekCol.push({
                    timestamp: utcMidnight,
                    count,
                    dateStr: iter.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                })

                iter.setDate(iter.getDate() + 1)
            }
            grid.push(weekCol)
        }

        return { grid, months }
    }, [profile?.submissionCalendar])

    const getHeatmapColor = (count: number) => {
        if (count === 0) return 'bg-[#181a24] hover:bg-[#252836]'
        if (count <= 2) return 'bg-[#0e4429] hover:bg-[#14603b]'
        if (count <= 5) return 'bg-[#006d32] hover:bg-[#008f42]'
        if (count <= 9) return 'bg-[#26a641] hover:bg-[#2fc24d]'
        return 'bg-[#39d353] hover:bg-[#4ff56e] shadow-[0_0_6px_rgba(57,211,83,0.5)]'
    }

    const getDiffBadgeClass = (diff: string) => {
        switch (diff) {
            case 'Easy':
                return 'text-[#00b8a3] bg-[#00b8a3]/15 border-[#00b8a3]/30'
            case 'Medium':
                return 'text-[#ffc01e] bg-[#ffc01e]/15 border-[#ffc01e]/30'
            case 'Hard':
                return 'text-[#ff375f] bg-[#ff375f]/15 border-[#ff375f]/30'
            default:
                return 'text-white/60 bg-white/10 border-white/20'
        }
    }

    return (
        <div
            className={`mac-widget-tile p-4 w-full h-full select-none relative group transition-all duration-300 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#141724]/95 via-[#0e1017]/95 to-[#0a0b10]/95 border border-white/[0.12] shadow-[0_25px_50px_rgba(0,0,0,0.85)] ${className}`}
        >
            <div className="flex-1 flex flex-col min-h-0">
                {/* 1. Sleek Modern Header (Draggable on desktop) */}
                <div
                    className="flex items-center justify-between mb-3 shrink-0 cursor-grab active:cursor-grabbing"
                    style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
                    title="Drag to move widget anywhere on desktop"
                >
                    <div className="flex items-center gap-2">
                        {/* LeetCode Icon with ambient glow */}
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#ffa116] to-[#e68a00] flex items-center justify-center text-xs font-black text-black shadow-[0_0_16px_rgba(255,161,22,0.4)]">
                            ⚡
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-xs tracking-wider uppercase bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                                LEETCODE
                            </span>
                            <span className="text-[9px] text-white/40 font-mono tracking-tight -mt-0.5">
                                Pro Coding Tracker
                            </span>
                        </div>

                        {/* Connected User Pill */}
                        <button
                            onClick={() => openExternal(`https://leetcode.com/u/${profile?.username || 's4njay'}/`)}
                            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#ffa116] bg-[#ffa116]/10 hover:bg-[#ffa116]/20 px-2.5 py-1 rounded-full border border-[#ffa116]/30 transition-all cursor-pointer shadow-sm ml-1"
                            title="Open Profile on LeetCode"
                        >
                            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                            <span>@{profile?.username || 's4njay'}</span>
                            <span className="text-[9px] text-white/40">↗</span>
                        </button>
                    </div>

                    {/* Streak & Header Action Controls */}
                    <div
                        className="flex items-center gap-1.5"
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    >
                        {/* Streak Badge */}
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#ffa116] bg-[#ffa116]/10 px-2.5 py-1 rounded-full border border-[#ffa116]/30 shadow-[0_0_10px_rgba(255,161,22,0.15)] font-mono">
                            <span>🔥</span>
                            <span>{profile?.streak ?? 46}d</span>
                        </span>

                        {/* Refresh Button */}
                        <button
                            onClick={() => {
                                loadData(profile?.username)
                                loadProblems()
                            }}
                            disabled={isLoading}
                            className="w-7 h-7 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white text-xs flex items-center justify-center cursor-pointer transition-all active:scale-90"
                            title="Refresh LeetCode Data"
                        >
                            <span className={isLoading ? 'animate-spin' : ''}>↻</span>
                        </button>

                        {/* Settings Button */}
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={`w-7 h-7 rounded-xl border text-xs flex items-center justify-center cursor-pointer transition-all active:scale-90 ${
                                isSettingsOpen
                                    ? 'bg-[#ffa116]/20 border-[#ffa116]/50 text-[#ffa116]'
                                    : 'bg-white/[0.05] hover:bg-white/[0.12] border-white/10 text-white/70 hover:text-white'
                            }`}
                            title="Switch Account"
                        >
                            ⚙
                        </button>

                        {/* Close Widget Button (Instant & Visible) */}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="w-7 h-7 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white text-xs flex items-center justify-center cursor-pointer transition-all active:scale-90 border border-white/20 font-bold ml-0.5"
                                title="Close Widget (Esc)"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Inline Connect Popover */}
                {isSettingsOpen && (
                    <div
                        className="mb-3 p-3 rounded-2xl bg-[#121522] border border-[#ffa116]/40 shadow-[0_12px_36px_rgba(0,0,0,0.8)] text-xs z-20 animate-fade-in shrink-0"
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-white flex items-center gap-1.5">
                                <span className="text-[#ffa116]">⚡</span>
                                <span>Connect LeetCode Account</span>
                            </span>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-white/40 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleConnect} className="flex gap-2">
                            <input
                                type="text"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                placeholder="LeetCode username (e.g. s4njay)"
                                className="flex-1 px-3 py-1.5 rounded-xl bg-[#1c2030] border border-white/15 text-white text-xs placeholder-white/30 focus:outline-none focus:border-[#ffa116] font-mono"
                            />
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-[#ffa116] to-[#ffb034] text-black font-extrabold text-xs cursor-pointer disabled:opacity-50 shadow-md hover:brightness-110 active:scale-95"
                            >
                                {isSaving ? 'Syncing...' : 'Sync'}
                            </button>
                        </form>
                        {error && <div className="text-[10px] text-rose-400 mt-1.5">{error}</div>}
                    </div>
                )}

                {/* 2. Apple / Linear Style Segmented Navigation */}
                <div
                    className="flex items-center gap-1 p-1 bg-[#10131d]/90 border border-white/[0.08] rounded-2xl mb-3 shrink-0 shadow-inner"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                    <button
                        onClick={() => setActiveTab('gauge')}
                        className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            activeTab === 'gauge'
                                ? 'bg-gradient-to-r from-[#202538] to-[#282f48] text-white shadow-md border border-white/15'
                                : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                        }`}
                    >
                        <span>⭕</span>
                        <span>Solved ({totalSolved})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('graph')}
                        className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            activeTab === 'graph'
                                ? 'bg-gradient-to-r from-[#202538] to-[#282f48] text-white shadow-md border border-white/15'
                                : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                        }`}
                    >
                        <span>🟩</span>
                        <span>Activity ({profile?.totalActiveDays ?? 197}d)</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('checklist')}
                        className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            activeTab === 'checklist'
                                ? 'bg-[#ffa116]/20 text-[#ffa116] shadow-md border border-[#ffa116]/40 font-black'
                                : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                        }`}
                    >
                        <span>📋</span>
                        <span>Practice ({checklistCompletedCount}/{problems.length})</span>
                    </button>
                </div>

                {/* 3. TAB CONTENT VIEWS */}
                <div
                    className="flex-1 flex flex-col min-h-0"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                    {/* TAB 1: EXACT LEETCODE CIRCULAR ARC GAUGE */}
                    {activeTab === 'gauge' && (
                        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-0.5">
                            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#141724]/80 border border-white/[0.08] relative backdrop-blur-md">
                                <div className="relative w-44 h-40 flex items-center justify-center">
                                    <svg className="w-44 h-40 transform rotate-[140deg]" viewBox="0 0 160 160">
                                        {/* Dark background track */}
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r={gaugeMath.radius}
                                            fill="none"
                                            stroke="#1e2230"
                                            strokeWidth={gaugeMath.strokeWidth}
                                            strokeDasharray={`${gaugeMath.totalArcLength} ${gaugeMath.gapLength}`}
                                            strokeLinecap="round"
                                        />

                                        {/* Easy Segment */}
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r={gaugeMath.radius}
                                            fill="none"
                                            stroke="#00b8a3"
                                            strokeWidth={gaugeMath.strokeWidth}
                                            strokeDasharray={`${gaugeMath.easyArc} ${gaugeMath.totalCircumference}`}
                                            strokeDashoffset="0"
                                            strokeLinecap="round"
                                        />

                                        {/* Medium Segment */}
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r={gaugeMath.radius}
                                            fill="none"
                                            stroke="#ffc01e"
                                            strokeWidth={gaugeMath.strokeWidth}
                                            strokeDasharray={`${gaugeMath.medArc} ${gaugeMath.totalCircumference}`}
                                            strokeDashoffset={-gaugeMath.easyArc}
                                            strokeLinecap="round"
                                        />

                                        {/* Hard Segment */}
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r={gaugeMath.radius}
                                            fill="none"
                                            stroke="#ff375f"
                                            strokeWidth={gaugeMath.strokeWidth}
                                            strokeDasharray={`${gaugeMath.hardArc} ${gaugeMath.totalCircumference}`}
                                            strokeDashoffset={-(gaugeMath.easyArc + gaugeMath.medArc)}
                                            strokeLinecap="round"
                                        />
                                    </svg>

                                    {/* Center Text */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none pb-2">
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-3xl font-extrabold text-white tracking-tight leading-none font-mono drop-shadow-md">
                                                {totalSolved}
                                            </span>
                                            <span className="text-sm font-medium text-white/40 font-mono">
                                                /{totalQuestions}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 text-xs font-semibold text-[#22c55e] mt-1">
                                            <span>✓</span>
                                            <span>Solved</span>
                                        </div>

                                        <div className="text-[10px] text-white/50 font-medium mt-1 font-mono">
                                            🏆 Rank #{profile?.ranking ? profile.ranking.toLocaleString() : '477,036'}
                                        </div>
                                    </div>
                                </div>

                                {/* 3 Breakdown Cards with Progress Lines */}
                                <div className="grid grid-cols-3 gap-2 w-full mt-1">
                                    {/* Easy */}
                                    <div className="p-2 rounded-xl bg-[#00b8a3]/10 border border-[#00b8a3]/25 flex flex-col items-center text-center">
                                        <div className="text-[10px] font-bold text-[#00b8a3] uppercase tracking-wider">Easy</div>
                                        <div className="text-sm font-extrabold text-white font-mono mt-0.5">{easySolved}</div>
                                        <div className="text-[9px] text-white/40 font-mono">/{easyTotal}</div>
                                        <div className="w-full h-1 bg-[#00b8a3]/20 rounded-full mt-1.5 overflow-hidden">
                                            <div
                                                className="h-full bg-[#00b8a3] rounded-full"
                                                style={{ width: `${Math.min(100, Math.max(0, (easySolved / (easyTotal || 1)) * 100))}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Medium */}
                                    <div className="p-2 rounded-xl bg-[#ffc01e]/10 border border-[#ffc01e]/25 flex flex-col items-center text-center">
                                        <div className="text-[10px] font-bold text-[#ffc01e] uppercase tracking-wider">Med</div>
                                        <div className="text-sm font-extrabold text-white font-mono mt-0.5">{medSolved}</div>
                                        <div className="text-[9px] text-white/40 font-mono">/{medTotal}</div>
                                        <div className="w-full h-1 bg-[#ffc01e]/20 rounded-full mt-1.5 overflow-hidden">
                                            <div
                                                className="h-full bg-[#ffc01e] rounded-full"
                                                style={{ width: `${Math.min(100, Math.max(0, (medSolved / (medTotal || 1)) * 100))}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Hard */}
                                    <div className="p-2 rounded-xl bg-[#ff375f]/10 border border-[#ff375f]/25 flex flex-col items-center text-center">
                                        <div className="text-[10px] font-bold text-[#ff375f] uppercase tracking-wider">Hard</div>
                                        <div className="text-sm font-extrabold text-white font-mono mt-0.5">{hardSolved}</div>
                                        <div className="text-[9px] text-white/40 font-mono">/{hardTotal}</div>
                                        <div className="w-full h-1 bg-[#ff375f]/20 rounded-full mt-1.5 overflow-hidden">
                                            <div
                                                className="h-full bg-[#ff375f] rounded-full"
                                                style={{ width: `${Math.min(100, Math.max(2, (hardSolved / (hardTotal || 1)) * 100))}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Daily Challenge Card */}
                            <div className="p-3 rounded-2xl bg-[#141724]/80 border border-white/[0.08] backdrop-blur-md">
                                <div className="flex items-center justify-between text-[10px] font-mono text-white/50 mb-1">
                                    <span className="text-[#ffa116] font-bold tracking-wider flex items-center gap-1">
                                        <span>⚡</span>
                                        <span>DAILY CHALLENGE</span>
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">
                                        {dailyQuestion?.difficulty || 'Medium'}
                                    </span>
                                </div>

                                <div className="text-xs font-bold text-white mb-2 truncate">
                                    #{dailyQuestion?.id || '128'}. {dailyQuestion?.title || 'Longest Consecutive Sequence'}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openExternal(dailyQuestion?.link || 'https://leetcode.com/problems/longest-consecutive-sequence/')}
                                        className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#ffa116] to-[#ffb034] hover:brightness-110 text-black font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all hover:scale-[1.01] active:scale-95 shadow-md"
                                    >
                                        <span>Solve on LeetCode</span>
                                        <span>↗</span>
                                    </button>

                                    <button
                                        onClick={handleToggleSolved}
                                        className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                                            isSolvedToday
                                                ? 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/40'
                                                : 'bg-white/[0.06] text-white/70 border-white/10 hover:text-white'
                                        }`}
                                    >
                                        <span>{isSolvedToday ? '✓ Done' : 'Mark Done'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: EXACT LEETCODE 1-YEAR CONTRIBUTION HEATMAP */}
                    {activeTab === 'graph' && (
                        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-0.5">
                            <div className="p-3.5 rounded-2xl bg-[#141724]/80 border border-white/[0.08] backdrop-blur-md">
                                <div className="flex items-center justify-between mb-2.5">
                                    <div className="text-xs font-semibold text-white/90">
                                        <span className="text-white font-bold">{profile?.totalActiveDays || 197}</span>{' '}
                                        <span className="text-white/60">submissions in past year</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[11px] font-mono text-white/60">
                                        <span>Max streak: <strong className="text-[#ffa116]">{profile?.streak || 46}d</strong></span>
                                    </div>
                                </div>

                                {/* Heatmap Grid */}
                                <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
                                    <div className="inline-block min-w-full">
                                        {/* Month Labels */}
                                        <div className="relative h-3.5 mb-1 text-[9px] font-mono text-white/50 select-none">
                                            {heatmapData.months.map((m, idx) => (
                                                <span
                                                    key={idx}
                                                    className="absolute truncate"
                                                    style={{ left: `${m.col * 10}px` }}
                                                >
                                                    {m.label}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Heatmap Grid (Weeks x 7 Days) */}
                                        <div className="flex gap-[3px] items-center">
                                            {heatmapData.grid.map((week, wIdx) => (
                                                <div key={wIdx} className="flex flex-col gap-[3px]">
                                                    {week.map((day, dIdx) => (
                                                        <div
                                                            key={dIdx}
                                                            onMouseEnter={() => setHoveredCell({ dateStr: day.dateStr, count: day.count })}
                                                            onMouseLeave={() => setHoveredCell(null)}
                                                            className={`w-[7.5px] h-[7.5px] rounded-[2px] ${getHeatmapColor(day.count)} transition-transform hover:scale-125 hover:ring-1 hover:ring-white cursor-pointer`}
                                                        />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Active Cell Tooltip Indicator */}
                                <div className="h-4 flex items-center justify-between text-[9px] font-mono text-white/50 mt-1.5">
                                    <span>
                                        {hoveredCell
                                            ? `${hoveredCell.dateStr}: ${hoveredCell.count} submissions`
                                            : 'Hover on any block to see submissions'}
                                    </span>

                                    {/* Intensity Legend */}
                                    <div className="flex items-center gap-1 text-[9px] font-mono text-white/40">
                                        <span>Less</span>
                                        <span className="w-2 h-2 rounded-[2px] bg-[#181a24]" />
                                        <span className="w-2 h-2 rounded-[2px] bg-[#0e4429]" />
                                        <span className="w-2 h-2 rounded-[2px] bg-[#006d32]" />
                                        <span className="w-2 h-2 rounded-[2px] bg-[#26a641]" />
                                        <span className="w-2 h-2 rounded-[2px] bg-[#39d353]" />
                                        <span>More</span>
                                    </div>
                                </div>
                            </div>

                            {/* Daily Challenge Card on graph tab */}
                            <div className="p-3 rounded-2xl bg-[#141724]/80 border border-white/[0.08] backdrop-blur-md">
                                <div className="flex items-center justify-between text-[10px] font-mono text-white/50 mb-1">
                                    <span className="text-[#ffa116] font-bold tracking-wider flex items-center gap-1">
                                        <span>⚡</span>
                                        <span>DAILY CHALLENGE</span>
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">
                                        {dailyQuestion?.difficulty || 'Medium'}
                                    </span>
                                </div>

                                <div className="text-xs font-bold text-white mb-2 truncate">
                                    #{dailyQuestion?.id || '128'}. {dailyQuestion?.title || 'Longest Consecutive Sequence'}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openExternal(dailyQuestion?.link || 'https://leetcode.com/problems/longest-consecutive-sequence/')}
                                        className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#ffa116] to-[#ffb034] hover:brightness-110 text-black font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all hover:scale-[1.01] active:scale-95 shadow-md"
                                    >
                                        <span>Solve on LeetCode</span>
                                        <span>↗</span>
                                    </button>

                                    <button
                                        onClick={handleToggleSolved}
                                        className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                                            isSolvedToday
                                                ? 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/40'
                                                : 'bg-white/[0.06] text-white/70 border-white/10 hover:text-white'
                                        }`}
                                    >
                                        <span>{isSolvedToday ? '✓ Done' : 'Mark Done'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: PRACTICE PROBLEM CHECKLIST (Interactive with Ticks) */}
                    {activeTab === 'checklist' && (
                        <div className="flex-1 flex flex-col rounded-2xl bg-[#141724]/80 border border-white/[0.08] p-3 backdrop-blur-md min-h-0">
                            {/* Pinned Progress Header */}
                            <div className="mb-2 shrink-0">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="font-bold text-white flex items-center gap-1.5">
                                        <span>🎯 Practice Checklist</span>
                                    </span>
                                    <span className="font-mono text-[11px] text-[#22c55e] font-extrabold">
                                        {checklistCompletedCount} / {problems.length} Done ({problems.length > 0 ? Math.round((checklistCompletedCount / problems.length) * 100) : 0}%)
                                    </span>
                                </div>

                                {/* Animated Gradient Progress bar */}
                                <div className="w-full h-2 rounded-full bg-[#1e2230] overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#00b8a3] via-[#ffc01e] to-[#22c55e] transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                                        style={{
                                            width: `${problems.length > 0 ? (checklistCompletedCount / problems.length) * 100 : 0}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Pinned Filter Chips & Add Action */}
                            <div className="flex items-center justify-between gap-1.5 mb-2 shrink-0">
                                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
                                    <button
                                        onClick={() => setProblemFilter('all')}
                                        className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                                            problemFilter === 'all'
                                                ? 'bg-[#ffa116] text-black shadow-sm'
                                                : 'bg-white/[0.06] text-white/60 hover:text-white'
                                        }`}
                                    >
                                        All ({checklistCounts.all})
                                    </button>
                                    <button
                                        onClick={() => setProblemFilter('todo')}
                                        className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                                            problemFilter === 'todo'
                                                ? 'bg-[#ffa116] text-black shadow-sm'
                                                : 'bg-white/[0.06] text-white/60 hover:text-white'
                                        }`}
                                    >
                                        To Do ({checklistCounts.todo})
                                    </button>
                                    <button
                                        onClick={() => setProblemFilter('done')}
                                        className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                                            problemFilter === 'done'
                                                ? 'bg-[#22c55e] text-black shadow-sm'
                                                : 'bg-white/[0.06] text-white/60 hover:text-white'
                                        }`}
                                    >
                                        Done ({checklistCounts.done})
                                    </button>
                                    <button
                                        onClick={() => setProblemFilter('Easy')}
                                        className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                                            problemFilter === 'Easy'
                                                ? 'bg-[#00b8a3] text-black shadow-sm'
                                                : 'bg-white/[0.06] text-white/60 hover:text-white'
                                        }`}
                                    >
                                        Easy ({checklistCounts.easy})
                                    </button>
                                    <button
                                        onClick={() => setProblemFilter('Medium')}
                                        className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                                            problemFilter === 'Medium'
                                                ? 'bg-[#ffc01e] text-black shadow-sm'
                                                : 'bg-white/[0.06] text-white/60 hover:text-white'
                                        }`}
                                    >
                                        Med ({checklistCounts.med})
                                    </button>
                                    <button
                                        onClick={() => setProblemFilter('Hard')}
                                        className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                                            problemFilter === 'Hard'
                                                ? 'bg-[#ff375f] text-black shadow-sm'
                                                : 'bg-white/[0.06] text-white/60 hover:text-white'
                                        }`}
                                    >
                                        Hard ({checklistCounts.hard})
                                    </button>
                                </div>

                                <button
                                    onClick={() => setIsAddOpen(!isAddOpen)}
                                    className="px-2.5 py-0.5 rounded-lg bg-[#ffa116]/20 hover:bg-[#ffa116]/30 text-[#ffa116] border border-[#ffa116]/40 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-transform active:scale-95 whitespace-nowrap shadow-sm"
                                    title="Add custom problem"
                                >
                                    <span>{isAddOpen ? '✕' : '+ Add'}</span>
                                </button>
                            </div>

                            {/* Pinned Inline Add Problem Form */}
                            {isAddOpen && (
                                <form onSubmit={handleAddProblem} className="mb-2 p-2.5 rounded-xl bg-[#181c2b] border border-[#ffa116]/40 text-xs flex flex-col gap-2 animate-fade-in shrink-0 shadow-lg">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-white">
                                        <span className="flex items-center gap-1 text-[#ffa116]">
                                            <span>⚡</span>
                                            <span>Add Practice Problem</span>
                                        </span>
                                        <span className="text-[10px] text-white/40">Saved to SQLite DB</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <input
                                            type="text"
                                            placeholder="# ID (e.g. 1)"
                                            value={newFrontendId}
                                            onChange={(e) => setNewFrontendId(e.target.value)}
                                            className="w-16 px-2 py-1 rounded-lg bg-[#202538] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#ffa116]"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Problem Title (e.g. Two Sum)"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            required
                                            className="flex-1 px-2 py-1 rounded-lg bg-[#202538] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ffa116]"
                                        />
                                    </div>
                                    <div className="flex gap-1.5">
                                        <select
                                            value={newDifficulty}
                                            onChange={(e) => setNewDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                                            className="px-2 py-1 rounded-lg bg-[#202538] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ffa116]"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Category (e.g. Arrays, Trees)"
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            className="flex-1 px-2 py-1 rounded-lg bg-[#202538] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ffa116]"
                                        />
                                    </div>
                                    <div className="flex gap-1.5">
                                        <input
                                            type="text"
                                            placeholder="LeetCode URL (optional)"
                                            value={newUrl}
                                            onChange={(e) => setNewUrl(e.target.value)}
                                            className="flex-1 px-2 py-1 rounded-lg bg-[#202538] border border-white/10 text-white text-xs focus:outline-none focus:border-[#ffa116]"
                                        />
                                        <button
                                            type="submit"
                                            className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-[#ffa116] to-[#ffb034] hover:brightness-110 text-black font-extrabold text-xs cursor-pointer shadow-md active:scale-95"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Pinned Search input in checklist */}
                            <div className="relative mb-2 shrink-0">
                                <input
                                    type="text"
                                    value={checklistSearch}
                                    onChange={(e) => setChecklistSearch(e.target.value)}
                                    placeholder="Filter checklist by title or category..."
                                    className="w-full pl-2.5 pr-7 py-1 rounded-lg bg-[#181c2b] border border-white/10 text-[11px] text-white placeholder-white/30 focus:outline-none focus:border-[#ffa116]"
                                />
                                {checklistSearch && (
                                    <button
                                        onClick={() => setChecklistSearch('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-[10px]"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Dedicated Scrollable Problem Items List (Controls Stay Anchored!) */}
                            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-white/10 select-none min-h-0">
                                {filteredProblems.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-white/40 flex flex-col items-center gap-1">
                                        <span>🔍</span>
                                        <span>No problems matching filter</span>
                                    </div>
                                ) : (
                                    filteredProblems.map((problem) => {
                                        const isDone = Boolean(problem.completed)
                                        return (
                                            <div
                                                key={problem.id}
                                                onClick={() => handleToggleProblem(problem.id)}
                                                className={`group/item flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                                                    isDone
                                                        ? 'bg-[#101c15] border-[#22c55e]/25 opacity-75'
                                                        : 'bg-[#161a27] hover:bg-[#1f2438] border-white/5 hover:border-white/15'
                                                }`}
                                            >
                                                {/* Left: Checkbox & Problem Title */}
                                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                    {/* Tick Checkbox */}
                                                    <div
                                                        className={`w-4 h-4 rounded-md flex items-center justify-center transition-all shrink-0 ${
                                                            isDone
                                                                ? 'bg-[#22c55e] text-black font-extrabold text-[10px] shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                                                                : 'border border-white/30 group-hover/item:border-[#ffa116]'
                                                        }`}
                                                    >
                                                        {isDone && '✓'}
                                                    </div>

                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5">
                                                            {problem.frontend_id && (
                                                                <span className="text-[10px] font-mono text-white/40 shrink-0">
                                                                    #{problem.frontend_id}
                                                                </span>
                                                            )}
                                                            <span
                                                                className={`text-xs font-semibold truncate ${
                                                                    isDone ? 'line-through text-white/40' : 'text-white'
                                                                }`}
                                                            >
                                                                {problem.title}
                                                            </span>
                                                        </div>

                                                        {problem.category && (
                                                            <span className="text-[9px] text-white/40 truncate">
                                                                {problem.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right: Difficulty & Solve Link */}
                                                <div className="flex items-center gap-1.5 ml-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                    <span
                                                        className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${getDiffBadgeClass(
                                                            problem.difficulty
                                                        )}`}
                                                    >
                                                        {problem.difficulty}
                                                    </span>

                                                    {/* Direct Solve Link */}
                                                    <button
                                                        onClick={() => openExternal(problem.url)}
                                                        className="p-1 text-white/40 hover:text-[#ffa116] transition-colors text-xs"
                                                        title={`Solve ${problem.title} on LeetCode`}
                                                    >
                                                        ↗
                                                    </button>

                                                    {/* Delete Problem */}
                                                    <button
                                                        onClick={(e) => handleDeleteProblem(problem.id, e)}
                                                        className="opacity-0 group-hover/item:opacity-100 p-1 text-white/30 hover:text-rose-400 transition-all text-xs"
                                                        title="Remove problem"
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
                </div>
            </div>

            {/* 4. Quick Problem Search Bar at Bottom */}
            <form
                onSubmit={handleSearch}
                className="relative mt-2.5 shrink-0"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 4,000+ problems on LeetCode..."
                    className="w-full pl-3 pr-8 py-2 rounded-xl bg-[#141724]/90 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ffa116] transition-all shadow-inner"
                />
                <button
                    type="submit"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#ffa116] text-xs cursor-pointer transition-colors"
                    title="Search LeetCode"
                >
                    🔍
                </button>
            </form>
        </div>
    )
}
