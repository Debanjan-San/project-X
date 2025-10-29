import { plugin } from '../../utils/plugin.js'
import { getUsersByRf, findUser } from '../../utils/database.js'

plugin(
    {
        name: 'rflist',
        aliases: ['relationlist', 'rfusers'],
        catagory: 'misc',
        description: {
            content: 'Show RF-enabled users of opposite gender.'
        }
    },
    async (_, M) => {
        const sender = findUser(M.sender.id)

        const rfUsers = getUsersByRf()

        if (!rfUsers.length) {
            return M.reply('⚠️ No users currently have the *RF status enabled*.')
        }

        // Determine opposite gender
        const oppositeGender = sender.gender?.toLowerCase() === 'male' ? 'female' : 'male'

        // Filter only opposite gender users
        const filteredUsers = rfUsers.filter(
            (u) => u.gender?.toLowerCase() === oppositeGender && u.jid !== sender.jid && u.lid !== sender.lid
        )

        if (filteredUsers.length === 0) {
            return M.reply(`⚠️ No *${oppositeGender}* users currently have the RF status enabled.`)
        }

        const list = filteredUsers
            .map((u, i) => `${i + 1}. ${u.name || 'Unknown'} (${u.rfcode})`)
            .join('\n')

        const message = `
📋 *RF Enabled ${oppositeGender === 'male' ? 'Male' : 'Female'} Users (${filteredUsers.length})*

${list}

Use *${global.config.prefix}rfrequest <code>* to send your RF request. Once rejected, you can’t send another for 3 weeks.
`

        return M.reply(message)
    }
)