import { parseArgs, getClosestCommand } from '../functions/helpler.js'
import { plugins } from '../utils/plugin.js'
import { isRegUser } from '../utils/database.js'
import chalk from 'chalk'

export default async (client, M) => {
    try {
        console.log(
            `${chalk.green('~RECV')} ${chalk.white('Message from')} ${chalk.green(M.sender.name)} ${chalk.white('in')} ${chalk.magenta(
                M.chat === 'group' ? M.groupName || 'Unknown Group' : 'DM'
            )} ${chalk.white(`message:[${chalk.blue(M.body?.length || 0)}]`)} ${chalk.gray(
                `[${new Date().toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })}]`
            )}`
        )
        if (!M.body.startsWith(global.config.prefix)) return
        if (!isRegUser(M.sender.id)) {
            return M.reply(`❌ You are not registered. Use *${global.config.prefix}register* first.`)
        }
        const parsedArgs = parseArgs(M.body)
        console.log(
            `${chalk.red('~EXEC')} ${chalk.cyan(`${global.config.prefix}${parsedArgs.cmd}`)} ${chalk.white('from')} ${chalk.green(M.sender.name)} ${chalk.white('in')} ${chalk.magenta(
                M.chat === 'group' ? M.groupName || 'Unknown Group' : 'DM'
            )} ${chalk.white(`message:[${chalk.blue(M.body?.length || 0)}]`)} ${chalk.gray(
                `[${new Date().toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })}]`
            )}`
        )
        const cmd = plugins.find((p) => p.name === parsedArgs.cmd || p.aliases.includes(parsedArgs.cmd))

        if (!cmd) {
            const suggestion = getClosestCommand(parsedArgs.cmd)
            return client.sendMessage(M.from, { text: `❌ Command not found. Did you mean "${suggestion}"?` })
        }

        if (cmd.isPrivate && M.chat !== 'dm') {
            return client.sendMessage(M.from, { text: '❌ This command can only be used in private chat.' })
        }
        if (cmd.isGroup && M.chat !== 'group') {
            return client.sendMessage(M.from, { text: '❌ This command can only be used in groups.' })
        }
        if (cmd.isAdmin && !M.isAdmin && !M.isGroupOwner) {
            return client.sendMessage(M.from, { text: '🚫 Only group admins can use this command.' })
        }
        if (cmd.isDev && !global.config.mods.includes(M.sender.id)) {
            return client.sendMessage(M.from, { text: '🔒 This command is restricted to bot developers only.' })
        }
        if (cmd.isBotAdmin && !M.isBotAdmin) {
            return client.sendMessage(M.from, { text: '⚠️ The bot needs to be an admin to execute this task.' })
        }

        await cmd.run(client, M, parsedArgs)
    } catch (error) {
        console.error(error)
        client.sendMessage(M.from, { text: '⚠️ An error occurred while executing the command.' })
    }
}
