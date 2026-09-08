import { ipcMain } from 'electron'
import { getSetting, saveSetting } from './settings'
import { getDB } from '../database'

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
    daily?: {
        id: string
        title: string
        slug: string
        difficulty: 'Easy' | 'Medium' | 'Hard'
        link: string
        tags: string[]
        acceptance: string
    }
}

const LEETCODE_GRAPHQL_ENDPOINT = 'https://leetcode.com/graphql'

const USER_PROFILE_QUERY = `
query getUserProfile($username: String!) {
    matchedUser(username: $username) {
        username
        profile {
            ranking
            userAvatar
            realName
        }
        userCalendar {
            streak
            totalActiveDays
            submissionCalendar
        }
        submitStatsGlobal {
            acSubmissionNum {
                difficulty
                count
            }
        }
    }
    allQuestionsCount {
        difficulty
        count
    }
    activeDailyCodingChallengeQuestion {
        date
        link
        question {
            questionFrontendId
            title
            titleSlug
            difficulty
            topicTags {
                name
            }
            stats
        }
    }
}
`

const DAILY_QUESTION_QUERY = `
query questionOfToday {
    activeDailyCodingChallengeQuestion {
        date
        link
        question {
            questionFrontendId
            title
            titleSlug
            difficulty
            topicTags {
                name
            }
            stats
        }
    }
}
`

async function fetchLeetCodeGraphQL(query: string, variables?: Record<string, unknown>): Promise<any> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    try {
        const res = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
                'Referer': 'https://leetcode.com',
            },
            body: JSON.stringify({ query, variables }),
        })

        if (!res.ok) {
            throw new Error(`LeetCode API returned HTTP ${res.status}`)
        }

        return await res.json()
    } finally {
        clearTimeout(timeout)
    }
}

export function registerLeetCodeIPC() {
    // Get live profile and daily problem (with offline cache fallback)
    ipcMain.handle('leetcode:getProfile', async (_e, rawUsername?: string) => {
        const username = (rawUsername || getSetting('leetcode_username', 's4njay')).trim() || 's4njay'
        try {
            const json = await fetchLeetCodeGraphQL(USER_PROFILE_QUERY, { username })

            if (json.errors && (!json.data || !json.data.matchedUser)) {
                return {
                    success: false,
                    error: 'USER_NOT_FOUND',
                    message: `LeetCode user "${username}" was not found. Please check your username.`,
                }
            }

            const user = json.data?.matchedUser
            if (!user) {
                return {
                    success: false,
                    error: 'USER_NOT_FOUND',
                    message: `LeetCode user "${username}" was not found.`,
                }
            }

            // Save verified username to settings
            saveSetting('leetcode_username', username)
            saveSetting('leetcodeIntegration', 'true')

            // Parse submission counts
            const counts = user.submitStatsGlobal?.acSubmissionNum || []
            const solvedMap: Record<string, number> = {}
            for (const item of counts) {
                solvedMap[item.difficulty] = item.count
            }

            // Parse daily question if available
            let dailyObj: LeetCodeProfileData['daily'] = undefined
            const rawDaily = json.data?.activeDailyCodingChallengeQuestion
            if (rawDaily?.question) {
                let acRate = '50%'
                try {
                    const stats = JSON.parse(rawDaily.question.stats || '{}')
                    if (stats.acRate) acRate = stats.acRate
                } catch {}

                dailyObj = {
                    id: rawDaily.question.questionFrontendId,
                    title: rawDaily.question.title,
                    slug: rawDaily.question.titleSlug,
                    difficulty: rawDaily.question.difficulty as 'Easy' | 'Medium' | 'Hard',
                    link: rawDaily.link.startsWith('http')
                        ? rawDaily.link
                        : `https://leetcode.com${rawDaily.link}`,
                    tags: (rawDaily.question.topicTags || []).map((t: { name: string }) => t.name),
                    acceptance: acRate,
                }
            }

            // Parse total questions counts
            const allCounts = json.data?.allQuestionsCount || []
            const totalQuestionsMap: Record<string, number> = {}
            for (const item of allCounts) {
                totalQuestionsMap[item.difficulty] = item.count
            }

            // Parse submission calendar
            let subCal: Record<string, number> = {}
            try {
                if (user.userCalendar?.submissionCalendar) {
                    subCal = JSON.parse(user.userCalendar.submissionCalendar)
                }
            } catch {}

            const profileData: LeetCodeProfileData = {
                username: user.username,
                realName: user.profile?.realName,
                avatar: user.profile?.userAvatar,
                ranking: user.profile?.ranking,
                streak: user.userCalendar?.streak || 0,
                maxStreak: user.userCalendar?.streak || 0,
                totalActiveDays: user.userCalendar?.totalActiveDays || 0,
                solved: {
                    all: solvedMap['All'] || 0,
                    easy: solvedMap['Easy'] || 0,
                    medium: solvedMap['Medium'] || 0,
                    hard: solvedMap['Hard'] || 0,
                },
                allQuestionsCount: {
                    all: totalQuestionsMap['All'] || 4046,
                    easy: totalQuestionsMap['Easy'] || 963,
                    medium: totalQuestionsMap['Medium'] || 2111,
                    hard: totalQuestionsMap['Hard'] || 972,
                },
                submissionCalendar: subCal,
                daily: dailyObj,
            }

            // Cache verified profile to settings for offline support
            saveSetting('leetcode_cached_profile', JSON.stringify(profileData))

            return { success: true, data: profileData }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            console.warn('[LeetCode IPC] Network request failed, checking offline cache:', message)

            // Production resilience: Return cached profile if available
            try {
                const cachedStr = getSetting('leetcode_cached_profile', '')
                if (cachedStr) {
                    const cached = JSON.parse(cachedStr)
                    return { success: true, data: cached, isCached: true }
                }
            } catch {}

            return { success: false, error: 'NETWORK_ERROR', message }
        }
    })

    // Get today's daily problem only
    ipcMain.handle('leetcode:getDaily', async () => {
        try {
            const json = await fetchLeetCodeGraphQL(DAILY_QUESTION_QUERY)
            const rawDaily = json.data?.activeDailyCodingChallengeQuestion
            if (!rawDaily?.question) {
                return { success: false, error: 'NO_DAILY' }
            }

            let acRate = '50%'
            try {
                const stats = JSON.parse(rawDaily.question.stats || '{}')
                if (stats.acRate) acRate = stats.acRate
            } catch {}

            return {
                success: true,
                data: {
                    id: rawDaily.question.questionFrontendId,
                    title: rawDaily.question.title,
                    slug: rawDaily.question.titleSlug,
                    difficulty: rawDaily.question.difficulty,
                    link: rawDaily.link.startsWith('http')
                        ? rawDaily.link
                        : `https://leetcode.com${rawDaily.link}`,
                    tags: (rawDaily.question.topicTags || []).map((t: { name: string }) => t.name),
                    acceptance: acRate,
                },
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            return { success: false, error: 'NETWORK_ERROR', message }
        }
    })

    // Problem Checklist: get all tracked problems
    ipcMain.handle('leetcode:getProblems', () => {
        try {
            const db = getDB()
            return db.prepare('SELECT * FROM leetcode_problems ORDER BY completed ASC, id ASC').all()
        } catch (e: any) {
            console.error('leetcode:getProblems error:', e)
            return []
        }
    })

    // Problem Checklist: toggle completion ("tick")
    ipcMain.handle('leetcode:toggleProblem', (_e, id: number) => {
        try {
            const db = getDB()
            const row = db.prepare('SELECT completed FROM leetcode_problems WHERE id = ?').get(id) as { completed: number } | undefined
            if (!row) return { success: false, error: 'NOT_FOUND' }
            const nextCompleted = row.completed ? 0 : 1
            const completedAt = nextCompleted ? new Date().toISOString() : null
            db.prepare('UPDATE leetcode_problems SET completed = ?, completed_at = ? WHERE id = ?').run(nextCompleted, completedAt, id)
            return { success: true, completed: nextCompleted === 1 }
        } catch (e: any) {
            console.error('leetcode:toggleProblem error:', e)
            return { success: false, error: e.message }
        }
    })

    // Problem Checklist: add custom problem
    ipcMain.handle('leetcode:addProblem', (_e, problem: {
        frontend_id?: string
        title: string
        difficulty?: 'Easy' | 'Medium' | 'Hard'
        category?: string
        url?: string
    }) => {
        try {
            const db = getDB()
            const titleClean = (problem.title || '').trim()
            if (!titleClean) return { success: false, error: 'Title required' }
            const slug = titleClean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            let url = (problem.url || '').trim()
            if (!url && slug) {
                url = `https://leetcode.com/problems/${slug}/`
            }
            const res = db.prepare(`
                INSERT INTO leetcode_problems (frontend_id, title, title_slug, difficulty, category, url, completed)
                VALUES (@frontend_id, @title, @title_slug, @difficulty, @category, @url, 0)
            `).run({
                frontend_id: problem.frontend_id || '',
                title: titleClean,
                title_slug: slug,
                difficulty: problem.difficulty || 'Medium',
                category: problem.category || 'General',
                url,
            })
            const created = db.prepare('SELECT * FROM leetcode_problems WHERE id = ?').get(res.lastInsertRowid)
            return { success: true, data: created }
        } catch (e: any) {
            console.error('leetcode:addProblem error:', e)
            return { success: false, error: e.message }
        }
    })

    // Problem Checklist: delete problem
    ipcMain.handle('leetcode:deleteProblem', (_e, id: number) => {
        try {
            const db = getDB()
            db.prepare('DELETE FROM leetcode_problems WHERE id = ?').run(id)
            return { success: true }
        } catch (e: any) {
            console.error('leetcode:deleteProblem error:', e)
            return { success: false, error: e.message }
        }
    })
}
