import { plugin } from '../../utils/plugin.js'

plugin(
    {
        name: 'promote',
        aliases: ['pro'],
        isGroup: true,
        isAdmin: true,
        isBotAdmin: true,
        category: 'group',
        description: {
            content: 'Promote mentioned users to admin role.',
            usage: '<mention user | quote user>',
            example: '@917003213983'
        }
    },
    async (client, M) => {
        if (!!M.mentioned.length || !M.isQuoted) {
            return M.reply(
                `❌ Please mention or reply to at least one *user* to promote.\n\nExample: ${global.config.prefix}promote @ryaendas`
            )
        }

        if (M.isQuoted) {
            M.mentioned.push(M.quotedMessage?.participant)
        }
        if (M.mentioned.length > 5) {
            return M.reply('⚠️ You can only promote up to *5 users* at once.')
        }

        let msg = '🚀 *Promotion Process Initiated...*\n'
        for (const jid of M.mentioned) {
            const num = jid.split('@')[0]
            if (M.groupAdmins.includes(jid)) {
                msg += `\n⚠️ *@${num}* is already an admin.`
            } else {
                await client.groupParticipantsUpdate(M.from, [jid], 'promote')
                msg += `\n✅ Successfully promoted *@${num}*.`
            }
        }

        await M.reply(msg, undefined, undefined, undefined, M.mentioned)
    }
)
