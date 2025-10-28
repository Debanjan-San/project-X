import { plugin } from '../../utils/plugin.js'
import { randomString } from '../../functions/helpler.js'
import { isRegUser } from '../../utils/database.js'

plugin(
    {
        name: 'getreg',
        aliases: ['regcode'],
        isGroup: true,
        catagory: 'misc',
        description: {
            content: 'Get a registration code to begin the registration process.'
        }
    },
    async (client, M, args) => {
        const senderId = M.sender?.id || M.from
        const senderName = M.sender?.name || 'User'

        if (isRegUser(senderId)) {
            return M.reply(
                `❌ You are already registered in the database. Use *${global.config.prefix}editreg* to update your information.`
            )
        }

        if (!args || args.length === 0) {
            return M.reply(
                `❌ Please provide a phone number.\nUsage: *${global.config.prefix}getreg <phone_number>*\nExample: *${global.config.prefix}getreg 1234567890*`
            )
        }

        const number = args[0].toString()

        if (!/^\d+$/.test(number)) {
            return M.reply('❌ Invalid phone number format. Please provide only digits.')
        }

        if (number.length < 8 || number.length > 15) {
            return M.reply('❌ Phone number should be between 8-15 digits.')
        }

        const jid = `${number}@s.whatsapp.net`

        const existsArr = Array.from(await client.onWhatsApp(jid))
        if (!existsArr.length || !existsArr[0].exists) {
            return M.reply(`❌ This number does not exist on WhatsApp.`)
        }
        const code = randomString(12)

        global.userRegister.set(code, { jid, id: senderId })

        setTimeout(() => {
            global.userRegister.delete(code)
        }, 300000)

        M.reply(
            `✅ ${senderName}, here is your code to register: *${code}*\nUse:\n${global.config.prefix}register <code> <name> <age> <gender>\n\n*Example:* ${global.config.prefix}register ${code} Debanjan 19 male\n\n(⚠️ Code expires in 5 minutes!)`
        )
    }
)
