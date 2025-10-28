import { plugin } from '../../utils/plugin.js'
import { findUser, editUser } from '../../utils/database.js'

plugin(
    {
        name: 'rfaccept',
        aliases: ['accept', 'rfok'],
        description: {
            usage: '<code>',
            content: 'Accept an RF request using a valid RF code.',
            example: 'y3mpwdqea3en'
        },
        category: 'misc'
    },
    async (client, M, { args }) => {
        const code = args[0]

        if (!code) {
            return M.reply('❗ Please provide a valid RF code to accept.')
        }

        const receiver = findUser(M.sender.id)
        if (!receiver.rf) {
            return M.reply('⚠️ The rf flag is *disabled*.')
        }

        // Check if receiver is already in a relationship
        if (receiver.relationship?.status) {
            return M.reply('💔 You are already in a relationship. You can’t accept another request.')
        }

        const request = receiver.rflist.find((r) => r.rfcode === code)
        if (!request) {
            return M.reply('⚠️ No pending request found with this RF code.')
        }

        const lastRequestDate = new Date(request.date)
        const now = new Date()
        const diffWeeks = (now - lastRequestDate) / (1000 * 60 * 60 * 24 * 7)
        const rflist = receiver.rflist.filter((r) => r.rfcode !== code)

        if (diffWeeks < 3) {
            editUser(receiver.jid, {
                rflist
            })
            return M.reply(`⚠️ The RF request from *${request.name || 'this user'}* has been expaired.`)
        }

        const sender = findUser(request.lid)
        if (sender.relationship?.status) {
            editUser(receiver.jid, {
                rflist
            })
            return M.reply('💔 The sender is already in a relationship.')
        }

        if (!sender.rf) {
            editUser(receiver.jid, {
                rflist
            })
            return M.reply("⚠️ The target user's rf flag is *disabled*.")
        }

        editUser(sender.jid, {
            rf: false,
            relationship: {
                name: receiver.name,
                status: true,
                lid: receiver.lid,
                jid: receiver.jid,
                date: new Date().toISOString()
            }
        })

        editUser(receiver.jid, {
            rflist: [],
            rf: false,
            relationship: {
                name: sender.name,
                status: true,
                lid: sender.lid,
                jid: sender.jid,
                date: new Date().toISOString()
            }
        })

        await client.sendMessage(sender.lid, {
            text: `💞 Your RF request has been accepted by *${receiver.name}*! ❤️`
        })

        return M.reply(`🎉 You are now in a relationship with *${sender.name}*! 💖`)
    }
)
