async function test() {
    try {
        const res = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
                query: `
                query getUserCalendar($username: String!) {
                    matchedUser(username: $username) {
                        username
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
                }
                `,
                variables: { username: 's4njay' }
            })
        })
        const data = await res.json()
        console.log('Result:', JSON.stringify(data).slice(0, 500))
        if (data.data?.matchedUser?.userCalendar?.submissionCalendar) {
            const cal = JSON.parse(data.data.matchedUser.userCalendar.submissionCalendar)
            console.log('Submission Calendar total days with submissions:', Object.keys(cal).length)
            console.log('Sample entries:', Object.entries(cal).slice(-5))
        }
        if (data.data?.allQuestionsCount) {
            console.log('All questions count:', data.data.allQuestionsCount)
        }
    } catch (e) {
        console.error('Error:', e)
    }
}
test()
