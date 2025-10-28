import { plugin } from '../../utils/plugin.js'
import { findUser, editUser } from '../../utils/database.js'

plugin(
    {
        name: 'rfreject',
        aliases: ['reject', 'rfno'],
        catagory: 'misc',
        description: {
            usage: '<code>',
            content: 'Reject an RF request using a valid RF code.',
            example: 'y3mpwdqea3en'
        }
    },
    async (client, M, { args }) => {
        const code = args[0]

        if (!code) {
            return M.reply('⚙️ Please provide a valid RF code to reject.')
        }

        const receiver = findUser(M.sender.id)
        if (!receiver) return M.reply('⚠️ You are not registered.')

        const request = receiver.rflist.find((r) => r.rfcode === code)
        if (!request) {
            return M.reply('❌ No RF request found with that code.')
        }

        // Remove the rejected request
        const updatedList = receiver.rflist.filter((r) => r.rfcode !== code)
        const success = editUser(receiver.jid, { rflist: updatedList })

        if (!success) {
            return M.reply('❌ Failed to reject the request. Please try again.')
        }

        await client.sendMessage(sender.lid, {
            text: `💔 Your RF request has been *rejected* by *${receiver.name}*.  
You can send a new request to that user after *3 weeks*.`
        })

        return M.reply(`🚫 You have rejected the RF request from *${sender.name}*.`)
    }
)
