import { plugin } from '../../utils/plugin.js'
import { isRegUser, editUser, getUserName } from '../../utils/database.js'

plugin(
    {
        name: 'editreg',
        aliases: ['update'],
        isPrivate: true,
        catagory: 'misc',
        description: {
            usage: '<field> <new_value>',
            content: 'Edit your registered information such as name or age.',
            example: 'name Debanjan'
        }
    },
    async (_, M, { args }) => {
        if (args.length < 2) {
            return M.reply(
                `⚠️ Please use the correct format:\n${global.config.prefix}editreg <field> <new_value>\nExample:\n${global.config.prefix}editreg name Debanjan\n${global.config.prefix}editreg age 20`
            )
        }

        const field = args[0].toLowerCase()
        const value = args.slice(1).join(' ')
        const id = M.sender.id

        if (!isRegUser(id)) {
            return M.reply(`❌ You are not registered. Use *${global.config.prefix}register* first.`)
        }

        if (!['name', 'age', 'gender'].includes(field)) {
            return M.reply(`❌ Invalid field. You can only edit *name*, *age*, or *gender*.`)
        }

        const updates = {}

        if (field === 'name') {
            if (value.length < 3 || value.length > 20 || /[^a-zA-Z]/.test(value)) {
                return M.reply(`🤨 "${value}" doesn't look like a proper name.`)
            }
            updates.name = value
        }

        if (field === 'age') {
            const numAge = parseInt(value)
            if (isNaN(numAge) || numAge < 10 || numAge > 40) {
                return M.reply(`😤 "${value}" doesn't look like a valid age.`)
            }
            updates.age = numAge
        }

        if (field === 'gender') {
            if (!['male', 'female'].includes(value.toLowerCase())) {
                return M.reply(`🤔 Gender "${value}"? Please choose from "male" or "female".`)
            }
            updates.gender = value.toLowerCase()
        }

        const success = editUser(id, updates)

        if (!success) {
            return M.reply(`❌ Could not update your information. Try again later.`)
        }

        const displayName = getUserName(id) || 'User'
        M.reply(
            `✅ *Profile Updated!*\n👤 Name: ${updates.name || displayName}\n🎂 Age: ${updates.age || 'unchanged'}\n🚻 Gender: ${updates.gender || 'unchanged'}`
        )
    }
)
