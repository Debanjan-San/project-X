import { plugin } from '../../utils/plugin.js'
import { getUsersByRf } from '../../utils/database.js'

plugin(
    {
        name: 'rflist',
        aliases: ['relationlist', 'rfusers'],
        catagory: 'misc',
        description: {
            content: 'Show all users who have rf status enabled.'
        }
    },
    async (_, M) => {
        const rfUsers = getUsersByRf()

        if (rfUsers.length === 0) {
            return M.reply('⚠️ No users currently have the rf status enabled.')
        }

        const list = rfUsers.map((u, i) => `${i + 1}. ${u.name || 'Unknown'} (${u.rfcode})`).join('\n')

        const message = `
📋 *RF Enabled Users (${rfUsers.length})*

${list}

Use *${global.config.prefix}rfrequest <code>* to send your rf request. Once rejected you cant send rf request for 3 weeks.
`

        return M.reply(message)
    }
)
