import { plugin } from '../../utils/plugin.js'
import { getBuffer } from '../../functions/helpler.js'
import { findUser } from '../../utils/database.js'

plugin(
    {
        name: 'profile',
        aliases: ['me', 'userinfo'],
        catagory: 'misc',
        description: {
            content: 'View your profile information including WhatsApp bio.'
        }
    },
    async (client, M) => {
        const id = M.sender.id
        const user = findUser(id)

        let bio = '—'
        try {
            const statusData = await client.fetchStatus(id)
            if (Array.isArray(statusData) && statusData[0]?.status?.status) {
                bio = statusData[0].status.status
            }
        } catch {
            bio = 'Unable to fetch bio.'
        }

        let profilePic
        try {
            profilePic = await client.profilePictureUrl(id, 'image')
        } catch {
            profilePic = 'https://topics.studyjapan.jp/images_upload/2018/01/01/notice_404.png' // Default image if no profile pic
        }

        const { name, age, gender, relationship, ban, dateOfLogin } = user

        const buffer = await getBuffer(profilePic)
        const statusEmoji = ban.status ? '⛔ Banned' : '✅ Active'
        const banReason = ban.status ? `\n🛑 Reason: ${ban.reason || 'Not specified'}` : ''

        const relInfo = relationship.status ? `❤️ In relationship with ${relationship.name}` : '💔 Single'

        const profileText = `
👤 *User Profile* 👤

📛 *Name:* ${name}

🎂 *Age:* ${age}

🚻 *Gender:* ${gender}

💬 *Bio:* ${bio}

💞 *Relationship:* ${relInfo}

⚙️ *Status:* ${statusEmoji}${banReason}

🕓 *Joined:* ${new Date(dateOfLogin).toLocaleString()}
`

        M.reply(buffer, 'image', undefined, profileText)
    }
)
