import { ipcMain } from 'electron'
import { getSetting, saveSetting } from './settings'

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
    const res = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
        method: 'POST',
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
}

export function registerLeetCodeIPC() {
    // Get live profile and daily problem
    ipcMain.handle('leetcode:getProfile', async (_e, rawUsername?: string) => {
        try {
            const username = (rawUsername || getSetting('leetcode_username', 's4njay')).trim() || 's4njay'

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

            return { success: true, data: profileData }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            console.error('LeetCode IPC error:', message)
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
}
