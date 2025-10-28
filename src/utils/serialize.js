import { getContentType, downloadContentFromMessage } from 'baileys'

export default async (client, msg) => {
    const msgObj = {}
    try {
        const M = JSON.parse(JSON.stringify(msg))[0]
        const body =
            getContentType(M.message) === 'conversation'
                ? M.message.conversation
                : getContentType(M.message) === 'imageMessage'
                  ? M.message.imageMessage.caption
                  : getContentType(M.message) === 'videoMessage'
                    ? M.message.videoMessage.caption
                    : getContentType(M.message) === 'extendedTextMessage'
                      ? M.message.extendedTextMessage.text
                      : getContentType(M.message) === 'buttonsResponseMessage'
                        ? M.message.buttonsResponseMessage.selectedButtonId
                        : getContentType(M.message) === 'listResponseMessage'
                          ? M.message.listResponseMessage.singleSelectReply.selectedRowId
                          : getContentType(M.message) === 'templateButtonReplyMessage'
                            ? M.message.templateButtonReplyMessage.selectedId
                            : getContentType(M.message) === 'interactiveResponseMessage'
                              ? JSON.parse(M.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id
                              : getContentType(M.message) === 'templateButtonReplyMessage'
                                ? M.message.selectedId
                                : getContentType(M.message) === 'messageContextInfo'
                                  ? M.message.buttonsResponseMessage?.selectedButtonId ||
                                    M.message.listResponseMessage?.singleSelectReply.selectedRowId ||
                                    text
                                  : ''

        const sender = {
            name: M.pushName,
            id: M.key.fromMe
                ? client.user.lid.split(':')[0] + '@lid' || sanitizeLid(client.user.lid)
                : M.key.participant || M.key.remoteJidAlt
        }
        const from = M.key.remoteJid
        const botNumber = sanitizeLid(client.user.lid)
        const chat = from.endsWith('g.us') ? 'group' : 'dm'
        let type = undefined
        try {
            type = getContentType(M.message).replace('Message', '')
        } catch {}
        const isQuoted = !!M?.message?.extendedTextMessage?.contextInfo?.quotedMessage
        let mentioned = []
        if (!!M.message?.extendedTextMessage?.contextInfo?.mentionedJid)
            mentioned = M.message?.extendedTextMessage?.contextInfo?.mentionedJid

        if (isQuoted) {
            const quotedType = getContentType(M.message.extendedTextMessage.contextInfo.quotedMessage)
            type = 'quotedMessage'
            msgObj['quotedMessage'] = {
                participant: M.message.extendedTextMessage.contextInfo.participant,
                text: M.message.extendedTextMessage.text,
                type: quotedType.replace('Message', ''),
                download: async () => await download(M.message.extendedTextMessage.contextInfo.quotedMessage)
            }
        }

        if (chat == 'group') {
            const groupMetadata = await client.groupMetadata(from).catch(() => ({}))
            const groupName = groupMetadata.subject || ''
            const participants =
                groupMetadata.participants?.map((p) => {
                    let admin = null
                    if (p.admin === 'superadmin') admin = 'superadmin'
                    else if (p.admin === 'admin') admin = 'admin'
                    return {
                        id: p.id || null,
                        admin,
                        full: p
                    }
                }) || []
            const groupOwner = participants.find((p) => p.admin === 'superadmin')?.id || ''
            const groupAdmins = participants
                .filter((p) => p.admin === 'admin' || p.admin === 'superadmin')
                .map((p) => p.id)
            const isBotAdmin = groupAdmins.includes(botNumber)
            const isAdmin = groupAdmins.includes(sender.id)
            const isGroupOwner = groupOwner === sender.id
            Object.assign(msgObj, {
                groupName,
                participants,
                groupOwner,
                groupAdmins,
                isBotAdmin,
                isAdmin,
                isGroupOwner
            })
        }
        Object.assign(msgObj, {
            sender,
            body,
            from,
            chat,
            type,
            isQuoted,
            mentioned,
            download,
            botNumber,
            reply: async (content, type = 'text', mimetype, caption, mentions, options = {}) => {
                options.quoted = M
                if (type === 'text' && Buffer.isBuffer(content))
                    throw new Error('Cannot send a Buffer as a text message')
                return client.sendMessage(
                    from,
                    {
                        [type]: content,
                        mimetype,
                        mentions,
                        caption
                    },
                    options
                )
            }
        })
        return msgObj
    } catch (er) {
        console.error(er)
    }
}

const download = async (M) => {
    let type = Object.keys(M)[0]
    let Msg = message[type]
    if (type === 'buttonsMessage' || type === 'viewOnceMessageV2') {
        if (type === 'viewOnceMessageV2') {
            Msg = Msg.viewOnceMessageV2?.message
            type = Object.keys(Msg || {})[0]
        } else type = Object.keys(Msg || {})[1]
        Msg = Msg[type]
    }
    const stream = await downloadContentFromMessage(Msg, type.replace('Message', ''))
    let buffer = Buffer.from([])
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
    }
    return buffer
}

const sanitizeLid = (lid) => {
    const [a, b] = lid.split('@')
    return a.split(':').shift()?.concat('@', b) ?? lid
}

/**
 *         await sock.sendMessage("120363044160450118@g.us",         {
        text: 'This is an Interactive message!',
        title: 'Hiii',
        subtitle: 'There is a subtitle', 
        footer: 'Hello World!',
        interactiveButtons: [
            {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: 'Click Me!',
                    sections: [
                        {
                            title: 'Title 1',
                            highlight_label: 'Highlight label 1',
                            rows: [
                                {
                                    header: 'Header 1',
                                    title: 'Title 1',
                                    description: 'Description 1',
                                    id: 'Id 1'
                                },
                                {
                                    header: 'Header 2',
                                    title: 'Title 2',
                                    description: 'Description 2',
                                    id: 'Id 2'
                                }
                            ]
                        },
                                                {
                            title: 'Title 2',
                            highlight_label: 'Highlight label 1',
                            rows: [
                                {
                                    header: 'Header 1',
                                    title: 'Title 1',
                                    description: 'Description 1',
                                    id: 'Id 1'
                                },
                                {
                                    header: 'Header 2',
                                    title: 'Title 2',
                                    description: 'Description 2',
                                    id: 'Id 2'
                                }
                            ]
                        }
                    ]
                })
            }
        ]
    })
 */
