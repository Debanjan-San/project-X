import { plugins } from '../utils/plugin.js'
import axios from 'axios'

export const parseArgs = (raw) => {
    const args = raw.trim().split(/\s+/) // split by spaces
    const first = args.shift() || ''
    const prefix = global.config.prefix || '!'
    const cmd = first.startsWith(prefix) ? first.slice(prefix.length).toLowerCase() : first.toLowerCase()

    const text = args.join(' ')
    const flags = {}

    for (const arg of args) {
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=')
            flags[key] = value ?? ''
        } else if (arg.startsWith('-')) {
            flags[arg.slice(1)] = ''
        }
    }

    return { cmd, text, flags, args, raw }
}

export const randomBool = () => getRandomInt(0, 1) === 1

export const chunk = (arr, length) => {
    const result = []
    for (let i = 0; i < arr.length / length; i++) {
        result.push(arr.slice(i * length, i * length + length))
    }
    return result
}

export const inRange = (num, min, max) => num >= min && num <= max

export const swap = (array, index1, index2) => {
    //prettier-ignore
    ;[array[index1], array[index2]] = [array[index2], array[index1]]
    return array
}

export const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = getRandomInt(0, i)
        swap(array, i, j)
    }
    return array
}

export const calculatePing = (timestamp, now) => (now - timestamp) / 1000

export const capitalize = (content, all = false) => {
    if (!all) return `${content.charAt(0).toUpperCase()}${content.slice(1)}`
    return `${content
        .split('')
        .map((text) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`)
        .join('')}`
}

export const fetch = async (url) => (await axios.get(url)).data

export const generateRandomHex = () => `#${(~~(Math.random() * (1 << 24))).toString(16)}`

export const bufferToBase64 = (buffer) =>
    new Promise((resolve) => {
        const buff = new Buffer(buffer)
        const base64string = buff.toString('base64') // https://nodejs.org/api/buffer.html#buftostringencoding-start-end
        return setTimeout(() => {
            resolve(base64string)
        }, 1000)
    })

export const formatSeconds = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8)

export const getClosestCommand = (input) => {
    const allCmds = plugins.map((p) => p.name).concat(plugins.flatMap((p) => p.aliases))
    let closest = null
    let minDistance = Infinity

    const levenshtein = (a, b) => {
        const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i])
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                matrix[i][j] =
                    a[i - 1] === b[j - 1]
                        ? matrix[i - 1][j - 1]
                        : 1 + Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j])
            }
        }
        return matrix[a.length][b.length]
    }

    for (const cmd of allCmds) {
        const dist = levenshtein(input, cmd)
        if (dist < minDistance) {
            minDistance = dist
            closest = cmd
        }
    }

    return closest
}

export const extractNumbers = (content) => {
    const search = content.match(/(-\d+|\d+)/g)
    if (search !== null) {
        const result = search.map((string) => parseInt(string))
        for (let i = 0; i < result.length; i++) {
            if (result[i] > 0) continue
            result[i] = 0
        }
        return result
    }
    return []
}

export const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export const randomString = (maxLength = 8) => [...Array(maxLength)].map(() => Math.random().toString(36)[2]).join('')

export const getRandomFloat = (min, max) => {
    return Math.random() * (max - min) + min
}

export const getRandomItem = (array) => array[this.getRandomInt(0, array.length - 1)]

export const getRandomItems = (array, count) => {
    return new Array(count).fill(0).map(() => this.getRandomItem(array))
}

export const getUrls = (url) => {
    const urls = new Set()
    const regex = /(https?:\/\/[^\s]+)/g
    let match
    while ((match = regex.exec(url)) !== null) {
        urls.add(match[1])
    }
    return urls
}

export const getBuffer = async (url) =>
    (
        await axios.get(url, {
            responseType: 'arraybuffer'
        })
    ).data
