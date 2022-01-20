import * as Gherkin from '@cucumber/gherkin'
import * as Messages from '@cucumber/messages'

import { listFiles, readFile, getRelativePath, md5hash } from './utils'
import {
    BackgroundMetadata,
    EntryMetadata,
    FeatureMetadata,
    Location,
    Metadata,
    ScenarioMetadata,
    StepMetadata,
} from './manifest'

function normalizeTags(tags: readonly Messages.Tag[]) {
    return tags.map((tag) => tag.name)
}

function normalizeDescription(description: string) {
    return description.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalizeLocation(location: Messages.Location, path: string): Location {
    return {
        ...location,
        path,
    }
}

function makeFeatureMetadata(feature: Messages.Feature, relativeFilePath: string): FeatureMetadata {
    return {
        type: 'feature',
        id: md5hash(feature.name),
        name: feature.name,
        description: normalizeDescription(feature.description),
        tags: normalizeTags(feature.tags),
        location: normalizeLocation(feature.location, relativeFilePath),
        scenarios: [],
    }
}

function makeBackgroundMetadata(background: Messages.Background, relativeFilePath: string): BackgroundMetadata {
    return {
        type: 'background',
        id: background.id,
        name: background.name,
        location: normalizeLocation(background.location, relativeFilePath),
    }
}

function makeScenarioMetadata(
    scenario: Messages.Scenario,
    backgroundMetadata: BackgroundMetadata | undefined,
    featureMetadata: FeatureMetadata,
    relativeFilePath: string,
): ScenarioMetadata {
    return {
        type: 'scenario',
        id: scenario.id,
        backgroundId: backgroundMetadata?.id ?? undefined,
        featureId: featureMetadata.id,
        name: scenario.name,
        description: normalizeDescription(scenario.description),
        tags: normalizeTags(scenario.tags),
        location: normalizeLocation(scenario.location, relativeFilePath),
        steps: [],
    }
}

function makeStepMetadata(
    step: Messages.Step,
    scenarioMetadata: ScenarioMetadata,
    relativeFilePath: string,
): StepMetadata {
    return {
        type: 'step',
        id: step.id,
        scenarioId: scenarioMetadata.id,
        location: normalizeLocation(step.location, relativeFilePath),
        text: step.text,
        keyword: step.keyword.trim(),
    }
}

async function* generateMetadataEntries(path: string): AsyncGenerator<EntryMetadata, void, undefined> {
    const parser = new Gherkin.Parser(
        new Gherkin.AstBuilder(Messages.IdGenerator.incrementing()),
        new Gherkin.GherkinClassicTokenMatcher(),
    )

    for await (const file of listFiles(path, 'feature')) {
        const relativeFilePath = getRelativePath(path, file)
        const contents = await readFile(file)
        const document = parser.parse(contents)

        if (!document.feature) {
            continue
        }

        const feature = document.feature

        const featureMetadata = makeFeatureMetadata(feature, relativeFilePath)

        let backgroundMetadata

        for (const child of feature.children) {
            if (child.background) {
                backgroundMetadata = makeBackgroundMetadata(child.background, relativeFilePath)

                yield backgroundMetadata
            }

            if (child.scenario) {
                const scenarioMetadata = makeScenarioMetadata(
                    child.scenario,
                    backgroundMetadata,
                    featureMetadata,
                    relativeFilePath,
                )

                featureMetadata.scenarios.push(scenarioMetadata.id)

                for (const step of child.scenario.steps) {
                    const stepMetadata = makeStepMetadata(step, scenarioMetadata, relativeFilePath)

                    scenarioMetadata.steps.push(stepMetadata.id)

                    yield stepMetadata
                }

                yield scenarioMetadata
            }
        }

        yield featureMetadata
    }
}

export async function makeMetadata(path: string): Promise<Metadata> {
    const metadata: Metadata = {
        features: {},
        backgrounds: {},
        scenarios: {},
        steps: {},
    }

    for await (const entry of generateMetadataEntries(path)) {
        metadata[`${entry.type}s`][entry.id] = entry
    }

    return metadata
}
