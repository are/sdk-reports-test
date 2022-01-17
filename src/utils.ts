import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

export const saveJson = async function (name: string, obj: any) {
    await fs.writeFile(`./${name}.json`, JSON.stringify(obj))
}

export const md5hash = function (text: string) {
    const md5 = crypto.createHash('md5')

    return md5.update(text).digest('hex')
}

export const getRelativePath = function (root: string, fullPath: string) {
    return path.relative(root, fullPath)
}

export const readFile = async function (path: string) {
    return fs.readFile(path, 'utf-8')
}

export const listFiles = async function* (
    directory: string,
    extension?: string,
): AsyncGenerator<string, void, undefined> {
    const contents = await fs.readdir(directory, { withFileTypes: true })

    for (const entry of contents) {
        if (entry.isFile()) {
            if (!extension) {
                yield path.resolve(directory, entry.name)
            }

            if (path.extname(entry.name) === `.${extension}`) {
                yield path.resolve(directory, entry.name)
            }
        }

        if (entry.isDirectory()) {
            yield* listFiles(path.resolve(directory, entry.name), extension)
        }
    }
}
