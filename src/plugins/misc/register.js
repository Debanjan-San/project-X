import { plugin } from '../../utils/plugin.js'
import { setUser } from '../../utils/database.js'

plugin(
    {
        name: 'register',
        aliases: ['signup'],
        isPrivate: true,
        catagory: 'misc',
        description: {
            usage: '<code> <name> <age> <gender>',
            content: 'Register yourself using the code, name, age and gender.',
            example: 'm9g8z1tp2c4w Debanjan 19 male'
        }
    },
    async (_, M, { args }) => {
        if (args.length < 4) {
            return M.reply(
                `⚠️ Please use the correct format:\n${global.config.prefix}register <code> <name> <age> <gender>\n*Example:* ${global.config.prefix}register m9g8z1tp2c4w Debanjan 19 male`
            )
        }

        const code = args[0]
        const name = args[1]
        const age = parseInt(args[2])
        const gender = args[3].toLowerCase()
        const data = global.userRegister.get(code)
        if (!data) {
            return M.reply(`❌ Invalid or expired registration code. Please use *${global.config.prefix}getreg* again.`)
        }

        if (data.jid !== M.sender.id) {
            return M.reply(
                `🚫 This code does not belong to you. Please generate your own using *${global.config.prefix}getreg*.`
            )
        }

        if (name.length < 3 || name.length > 20 || /[^a-zA-Z]/.test(name)) {
            return M.reply(`🤨 That name looks suspicious, "${name}"? Try a proper one!`)
        }

        if (isNaN(age) || age < 10 || age > 40) {
            return M.reply(`😤 Age "${args[2]}" doesn't look right. Be honest!`)
        }

        if (!['male', 'female'].includes(gender)) {
            return M.reply(`🤔 Gender "${gender}"? Please choose from "male" or "female".`)
        }

        const userData = {
            jid: M.sender.id,
            lid: data.id,
            name,
            age,
            gender,
            registeredAt: new Date().toLocaleString()
        }

        setUser(userData)
        global.userRegister.delete(code)

        M.reply(
            `✅ *Registration Successful!*\n\n👤 Name: ${userData.name}\n🎂 Age: ${userData.age}\n🚻 Gender: ${userData.gender}\n🕓 Registered: ${userData.registeredAt}`
        )
    }
)
