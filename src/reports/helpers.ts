import { Metadata } from '../manifest'

export const findScenario = (name: string, metadata: Metadata) => {
    return Object.values(metadata.scenarios).find((k) => k.name === name)
}

export const findFeature = (name: string, metadata: Metadata) => {
    Object.values(metadata.features).find((k) => k.name === name)
}
