import { Artifact, getEntryType, isSupported, Metadata, SupportedRepositories } from '../manifest'
import { VNode } from './vnode'

import { xmlParser } from './parsers/xml'
import { xmlJavaAdapter } from './adapters/java'
import { xmlDartAdapter } from './adapters/dart'
import { readdir, readFile } from 'fs/promises'
import { listDirectories, listFiles } from '../utils'
import { Config } from '../config'
import { basename, resolve } from 'path'

type Formats = Record<
    string,
    {
        parser: (source: string) => VNode
        adapters: {
            [L in SupportedRepositories]: (document: VNode, metadata: Metadata) => any
        }
    }
>

const formats: Formats = {
    xml: {
        parser: xmlParser,
        adapters: {
            java: xmlJavaAdapter,
            dart: xmlDartAdapter,
        },
    },
}

function processArtifact(artifact: Artifact, metadata: Metadata) {
    const format = formats[artifact.extension]

    if (!format) {
        throw new Error('Unsupported report format.')
    }

    const document = format.parser(artifact.contents)

    const adapter = format.adapters[artifact.language]

    const result = adapter(document, metadata)

    return {
        scenarios: result,
        artifact: artifact,
    }
}

export function processArtifacts(artifacts: Array<Artifact>, metadata: Metadata) {
    return artifacts.map((artifact) => processArtifact(artifact, metadata))
}

export async function getLocalArtifacts(path: string, config: Config): Promise<Array<Artifact>> {
    const artifacts: Array<Artifact> = []

    for await (const dir of listDirectories(path)) {
        if (!isSupported(dir)) {
            continue
        }

        const repoConfig = config.repositories[dir]

        for await (const file of listFiles(resolve(path, dir), 'xml')) {
            const entryType = getEntryType(repoConfig, basename(file))

            if (entryType === 'unknown') {
                continue
            }

            artifacts.push({
                type: entryType,
                extension: 'xml',
                contents: await readFile(file, 'utf-8'),
                createdAt: null,
                language: dir,
            })
        }
    }

    return artifacts
}
