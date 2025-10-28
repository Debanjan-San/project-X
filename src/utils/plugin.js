import { readdirSync } from 'fs'
import { join, resolve } from 'path'
import { pathToFileURL } from 'url'

export const plugins = []

export const plugin = (meta, run) => {
    const name = meta.name

    const cmd = {
        name,
        aliases: meta.aliases || [],
        isAdmin: meta.isAdmin || false,
        isBotAdmin: meta.isBotAdmin || false,
        isDev: meta.isDev || false,
        isGroup: meta.isGroup || false,
        isPrivate: meta.isPrivate || false,
        category: meta.category || 'misc',
        content: meta.description.content || '',
        usage: meta.description.usage || '',
        example: meta.description.example || '',
        run
    }

    plugins.push(cmd)
    return cmd
}

export const loadPlugins = async (directory = 'src/plugins') => {
    console.log('🔌 Loading plugins...')
    const rootDir = resolve(process.cwd(), directory)
    const allImports = []
    readdirSync(rootDir).forEach(($dir) => {
        const files = readdirSync(join(rootDir, $dir)).filter((file) => file.endsWith('.js'))
        for (const file of files) {
            const filePath = pathToFileURL(join(rootDir, $dir, file)).href
            allImports.push(`${import(filePath)}?t=${Date.now()}`)
        }
    })

    await Promise.all(allImports)
    console.log(`✅ Successfully loaded ${plugins.length} plugins from "${directory}"`)
    return plugins
}
