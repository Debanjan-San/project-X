import {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    Browsers
} from 'baileys'
import pino from 'pino'
import chalk from 'chalk'
import fs from 'fs'
import serialize from './utils/serialize.js'
import eventHandler from './handler/event.js'
import { QuickDB, JSONDriver } from 'quick.db'
import NodeCache from 'node-cache'
import { loadDB } from './utils/database.js'
import qrcode from 'qrcode-terminal'
import { loadPlugins } from './utils/plugin.js'
import messageHandler from './handler/message.js'

const SESS_DIR = 'project-x_sessi'
const groupCache = new NodeCache({ stdTTL: 30 * 60, useClones: false })
let isConnecting = false
let lastTry = 0

global.DB = new QuickDB({
    driver: new JSONDriver()
})

global.config = {
    prefix: '#',
    mods: ['919999999999@s.whatsapp.net', '918888888888@s.whatsapp.net']
}

global.userRegister = new Map()

const bot = async () => {
    const { state, saveCreds, cache } = await useMultiFileAuthState(SESS_DIR)
    const { version } = await fetchLatestBaileysVersion()

    const client = makeWASocket({
        logger: pino({ level: 'silent' }),
        version,
        browser: Browsers.macOS('Safari'),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }), cache)
        },
        markOnlineOnConnect: false,
        emitOwnEvents: true,
        syncFullHistory: false,
        cachedGroupMetadata: async (jid) => groupCache.get(jid)
    })

    client.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
        const now = Date.now()
        if (qr) {
            qrcode.generate(qr, { small: true })
        }
        if (connection === 'connecting') {
            if (!isConnecting && now - lastTry > 5000) {
                isConnecting = true
                lastTry = now
                console.log(chalk.blueBright('Connecting bot...'))
            }
        } else if (connection === 'open') {
            isConnecting = false
            await loadDB()
            console.log(chalk.greenBright('✅ Bot connected successfully.'))
            await loadPlugins()
        } else if (connection === 'close') {
            isConnecting = false
            const error = lastDisconnect?.error
            const statusCode = error?.output?.statusCode

            console.log(chalk.red(`❌ Disconnected: ${DisconnectReason[statusCode ?? -1] || statusCode}`))

            if (statusCode === DisconnectReason.loggedOut) {
                try {
                    fs.rmSync(SESS_DIR, { recursive: true, force: true })
                } catch {}
                console.log(chalk.red('Session expired. Please re-pair your WhatsApp.'))
                setTimeout(bot, 2000)
            } else {
                if (now - lastTry > 5000) {
                    lastTry = now
                    console.log(chalk.yellow('Reconnecting...'))
                    setTimeout(bot, 5000)
                }
            }
        }
    })

    client.ev.on('messages.upsert', async ({ type, messages }) => {
        if (type !== 'notify') return
        const sanitizeMsg = await serialize(client, messages)
        messageHandler(client, sanitizeMsg)
    })

    client.ev.on('groups.update', async (updates) => {
        for (const update of updates) {
            if (update.id) {
                try {
                    const metadata = await client.groupMetadata(update.id)
                    groupCache.set(update.id, metadata)
                } catch (error) {
                    console.error(error)
                }
            }
        }
    })

    client.ev.on('group-participants.update', async (event) => {
        try {
            const metadata = await client.groupMetadata(event.id)
            await eventHandler(client, event)
            groupCache.set(event.id, metadata)
        } catch (error) {
            console.error(error)
        }
    })

    client.ev.on('messaging-history.set', ({ chats, contacts, messages }) => {
        console.log(`History Sync: ${chats.length} chats, ${contacts.length} contacts, ${messages.length} messages`)
    })

    client.ev.on('creds.update', saveCreds)
}

bot()
