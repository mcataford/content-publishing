import { Writable } from 'stream'

interface ILogger {
    group: (label: string) => void
    groupEnd: () => void
    log: (message: string) => void
}

export default function getLogger(stream: Writable): ILogger {
    const groups: Array<string> = []

    const group = (label: string) => {
        groups.push(label)
    }

    const groupEnd = () => {
        groups.pop()
    }

    const log = (message: string) => {
        const prefix = groups.join(' : ')
        stream.write(`[${prefix}] ${message}\n`)
    }

    return { group, groupEnd, log }
}
