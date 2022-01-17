import { Metadata } from '../../manifest'
import { findFeature, findScenario } from '../helpers'
import { VNode } from '../vnode'

export const xmlJavaAdapter = (document: VNode, metadata: Metadata): any => {
    function* scenarioReportGenerator(document: VNode): Generator<any> {
        for (const scenario of document.children) {
            const errors = scenario.children
                .filter((child) => child.type === 'failure')
                .map((failure) => failure.children[0]?.text)

            const systemOut = scenario.children
                .filter((child) => child.type === 'system-out')
                .map((sysout) => sysout.children[0]?.text)

            const scenarioMetadata = findScenario(scenario.attributes.name, metadata)

            const featureMetadata = scenarioMetadata
                ? metadata.features[scenarioMetadata.featureId]
                : findFeature(scenario.attributes.classname, metadata)

            const tags = [...(featureMetadata?.tags ?? []), ...(scenarioMetadata?.tags ?? [])]

            let status

            if (errors.length > 0) {
                if (tags.includes('@beta')) {
                    status = 'skipped'
                } else {
                    status = 'failed'
                }
            } else {
                status = 'passed'
            }

            yield {
                status: status,
                feature: featureMetadata?.id ?? scenario.attributes.classname,
                scenario: scenarioMetadata?.id ?? scenario.attributes.name,
                duration: parseFloat(scenario.attributes.time),
                stderr: errors.join('\n'),
                stdout: systemOut.join('\n'),
            }
        }
    }

    return [...scenarioReportGenerator(document)]
}
