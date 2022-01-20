import { Metadata, ReportEntry } from '../../manifest'
import { findFeature, findScenario } from '../helpers'
import { VNode } from '../vnode'

export const xmlDartAdapter = (document: VNode, metadata: Metadata): Array<ReportEntry> => {
    function* scenarioReportGenerator(document: VNode): Generator<ReportEntry> {
        for (const featureFile of document.children) {
            for (const scenario of featureFile.children) {
                const scenarioMetadata = findScenario(scenario.attributes.name, metadata)

                const featureMetadata = scenarioMetadata
                    ? metadata.features[scenarioMetadata.featureId]
                    : findFeature(scenario.attributes.classname, metadata)

                const errors = scenario.children
                    .filter((child) => child.type === 'error' || child.type === 'failure')
                    .map((child) => child.attributes.message)
                    .join('/n')

                yield {
                    status: 'passed',
                    feature: featureMetadata?.id ?? featureFile.attributes.name,
                    scenario: scenarioMetadata?.id ?? scenario.attributes.name,
                    stderr: errors,
                    stdout: '',
                }
            }
        }
    }

    return [...scenarioReportGenerator(document)]
}
