import { plugin } from '../../utils/plugin.js'
import { findUser, editUser } from '../../utils/database.js'

plugin(
    {
        name: 'breakup',
        aliases: ['rfbreak', 'endrf'],
        catagory: 'misc',
        description: {
            content: 'End your current relationship if you are in one.'
        }
    },
    async (client, M) => {
        const sender = findUser(M.sender.id)
        
        // Check if user is in a relationship
        if (!sender.relationship?.status) {
            return M.reply('💔 You are not in a relationship currently.')
        }

        const partner = findUser(sender.relationship.lid || sender.relationship.jid)

        // Reset sender's relationship
        editUser(sender.jid, {
            relationship: {
                name: '',
                status: false,
                lid: '',
                jid: '',
                date: new Date().toISOString()
            }
        })

        // Reset partner's relationship if found
        if (partner) {
            editUser(partner.jid, {
                relationship: {
                    name: '',
                    status: false,
                    lid: '',
                    jid: '',
                    date: new Date().toISOString()
                }
            })

            await client.sendMessage(partner.lid, {
                text: `💔 *${sender.name}* has ended the relationship with you. Take care 💭`
            })
        }

        return M.reply('💔 Relationship ended successfully. You are now single again.')
    }
)
