import { plugin } from '../../utils/plugin.js'
import { findUser, editUser } from '../../utils/database.js'

plugin(
    {
        name: 'rf',
        aliases: ['relationflag', 'setrf'],
        catagory: 'misc',
        description: {
            usage: '<on || off>',
            content: 'Enable or disable the rf flag for your account.',
            example: 'on'
        }
    },
    async (_, M, { args }) => {
        const id = M.sender.id
        const user = findUser(id)

        if (!args[0]) {
            return M.reply('⚙️ Please specify an option: *on* or *off*.')
        }

        if (user.relationship?.status) {
            return M.reply('💔 You are already in a relationship. You can not enable rf flag.')
        }

        const option = args[0].toLowerCase()

        if (option !== 'on' && option !== 'off') {
            return M.reply('❌ Invalid option. Use *on* to enable or *off* to disable.')
        }

        const newStatus = option === 'on'
        if (user.rf === newStatus) {
            return M.reply(`⚠️ The rf flag is already *${newStatus ? 'enabled' : 'disabled'}*.`)
        }
        const code = randomString(12)
        const success = editUser(id, { rf: newStatus, rfcode: code })
        if (!success) {
            return M.reply('❌ Failed to update rf flag.')
        }

        return M.reply(`✅ The rf flag has been *${newStatus ? 'enabled' : 'disabled'}* successfully.`)
    }
)
