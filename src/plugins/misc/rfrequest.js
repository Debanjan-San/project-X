import { plugin } from '../../utils/plugin.js'
import { findUser, editUser, getUsersByRf } from '../../utils/database.js'

plugin(
    {
        name: 'rfrequest',
        aliases: ['sendrf', 'relationrequest'],
        catagory: 'misc',
        description: {
            usage: '<code>',
            content: 'Send an RF request to a user using their RF code.',
            example: 'y3mpwdqea3en'
        }
    },
    async (_, M, { args }) => {
        const senderId = M.sender.id
        const sender = findUser(senderId)

        if (!sender.rf) {
            return M.reply('⚠️ The rf flag is *disabled*.')
        }

        if (!args[0]) {
            return M.reply('⚙️ Please provide an RF code to send a request.')
        }

        const code = args[0].trim()
        const rfUsers = getUsersByRf()
        const targetUser = rfUsers.find((u) => u.rfcode === code)

        if (!targetUser) {
            return M.reply('❌ No user found with that RF code.')
        }

        if (!targetUser.rf) {
            return M.reply("⚠️ The target user's rf flag is *disabled*.")
        }

        if (targetUser.jid === senderId || targetUser.lid === senderId) {
            return M.reply('⚠️ You cannot send an RF request to yourself.')
        }

        const existingRequest = targetUser.rflist.find((r) => r.jid === sender.jid || r.lid === sender.lid)

        if (existingRequest) {
            const lastRequestDate = new Date(existingRequest.date)
            const now = new Date()
            const diffWeeks = (now - lastRequestDate) / (1000 * 60 * 60 * 24 * 7)

            if (diffWeeks < 3) {
                const remainingDays = Math.ceil(21 - (now - lastRequestDate) / (1000 * 60 * 60 * 24))
                return M.reply(
                    `⚠️ You already sent an RF request to *${targetUser.name || 'this user'}*. Please wait ${remainingDays} more day${remainingDays > 1 ? 's' : ''} before sending again.`
                )
            }
        }

        const newRequest = {
            name: sender.name,
            jid: sender.jid,
            lid: sender.lid,
            age: sender.age,
            gender: sender.gender,
            date: new Date().toISOString()
        }

        const updatedList = targetUser.rflist.filter((r) => r.jid !== sender.jid && r.lid !== sender.lid)
        updatedList.push(newRequest)

        const success = editUser(targetUser.jid, { rflist: updatedList })

        if (!success) {
            return M.reply('❌ Failed to send RF request. Please try again later.')
        }
        await client.sendMessage(targetUser.lid, {
            text: `💌 *New RF Request Received!*

📛 *From:* ${sender.name}
🎂 *Age:* ${sender.age}
🚻 *Gender:* ${sender.gender}

💬 They have sent you an RF request using your code.

Use *${global.config.prefix}rfaccept ${sender.rfcode}* to accept  
or *${global.config.prefix}rfreject ${sender.rfcode}* to reject the request.`
        })

        return M.reply(`✅ RF request successfully sent to *${targetUser.name || 'Unknown'}*!`)
    }
)
