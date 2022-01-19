export type Location = {
    path: string
    line: number
    column?: number
}

export type FeatureMetadata = {
    type: 'feature'
    id: string
    name: string
    description: string
    tags: Array<string>
    location: Location
}

export type BackgroundMetadata = {
    type: 'background'
    id: string
    name: string
    location: Location
}

export type ScenarioMetadata = {
    type: 'scenario'
    id: string
    backgroundId?: string
    featureId: string
    name: string
    description: string
    tags: Array<string>
    location: Location
}

export type StepMetadata = {
    type: 'step'
    id: string
    scenarioId: string
    location: Location
    text: string
    keyword: string
}

export type EntryMetadata = FeatureMetadata | BackgroundMetadata | ScenarioMetadata | StepMetadata

export type Metadata = {
    steps: Record<string, StepMetadata>
    scenarios: Record<string, ScenarioMetadata>
    features: Record<string, FeatureMetadata>
    backgrounds: Record<string, BackgroundMetadata>
}

export type ReportStatus = 'broken' | 'skipped' | 'na' | 'passed' | 'failed' | 'unknown'

export type Manifest = {}
