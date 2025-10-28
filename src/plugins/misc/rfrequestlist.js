//rfmember request list
import { plugin } from '../../utils/plugin.js'
import { findUser, editUser } from '../../utils/database.js'

plugin(
    {
        name: 'rfrequestlist',
        aliases: ['rflistreq', 'pendingrf', 'rfreq'],
        catagory: 'misc',
        description: {
            content: 'Show all pending RF requests you have received within the last 3 weeks.'
        }
    },
    async (_, M) => {
        const receiver = findUser(M.sender.id)
        if (!receiver) return M.reply('⚠️ You are not registered.')

        let requests = receiver.rflist || []

        // Clean up requests older than 3 weeks
        const now = new Date()
        const validRequests = requests.filter((req) => {
            const diffWeeks = (now - new Date(req.date)) / (1000 * 60 * 60 * 24 * 7)
            return diffWeeks < 3
        })

        // If some expired, update DB
        if (validRequests.length !== requests.length) {
            editUser(receiver.jid, { rflist: validRequests })
        }

        if (validRequests.length === 0) {
            return M.reply('📭 You have no pending RF requests.')
        }

        const list = validRequests
            .map((r, i) => {
                const reqDate = new Date(r.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                })
                return `${i + 1}. *${r.name || 'Unknown'}*  
🎂 Age: ${r.age || 'N/A'}  
🚻 Gender: ${r.gender || 'N/A'}  
📅 Date: ${reqDate}`
            })
            .join('\n\n')

        const message = `
💌 *Pending RF Requests (${validRequests.length})*

${list}

Use *${global.config.prefix}rfaccept <code>* to accept  
or *${global.config.prefix}rfreject <code>* to reject.
        `.trim()

        return M.reply(message)
    }
)
