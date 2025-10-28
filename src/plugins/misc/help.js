import { plugin, plugins } from '../../utils/plugin.js'

plugin(
    {
        name: 'help',
        aliases: ['menu', 'commands'],
        catagory: 'misc',
        description: {
            usage: '<command name>',
            content: 'Show the help menu or detailed info for a specific command.',
            example: 'rfrequest'
        }
    },
    async (_, M, { args }) => {
        const prefix = global.config.prefix
        const query = args[0]?.toLowerCase()

        // Detailed help for a single command
        if (query) {
            const cmd =
                plugins.find(
                    (c) => c.name.toLowerCase() === query || c.aliases.map((a) => a.toLowerCase()).includes(query)
                ) || null

            if (!cmd) {
                return M.reply(`❌ No command found with the name or alias "${query}".`)
            }

            const info = `*- Command:* ${cmd.name}
*- Category:* ${cmd.category || 'misc'}
*- Aliases:* ${cmd.aliases.join(', ') || 'None'}
*- Usage:* ${prefix}${cmd.name} ${cmd?.usage}
*- Description:* ${cmd?.content}
*- Example:* ${prefix}${cmd.name} ${cmd?.example}`

            return M.reply(info)
        }

        // Group commands by category
        const categorized = {}
        for (const cmd of plugins) {
            const cat = cmd.category || 'misc'
            if (!categorized[cat]) categorized[cat] = []
            categorized[cat].push(cmd.name)
        }

        // Format help menu
        let helpText = `🤖 *Bot Command List*\n\n`
        for (const [cat, cmds] of Object.entries(categorized)) {
            helpText += `> *${cat.toUpperCase()}*\n`
            helpText += `➯ ${cmds.map((c) => `\`\`\`${c}\`\`\``).join(', ')}\n\n`
        }

        helpText += `Type *${prefix}help <command>* to get detailed info about a specific command.`

        return M.reply(helpText.trim())
    }
)
