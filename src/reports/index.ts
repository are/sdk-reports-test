import { Artifact, Metadata, SupportedRepositories } from '../manifest'
import { VNode } from './vnode'

import { xmlParser } from './parsers/xml'
import { xmlJavaAdapter } from './adapters/java'
import { xmlDartAdapter } from './adapters/dart'

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
