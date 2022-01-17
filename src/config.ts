import path from 'node:path'

import { RepositoryConfig, SupportedRepositories } from './manifest'

export type Config = {
    secrets: {
        github: string
    }

    paths: {
        sdkSpecifications: string
        featureFiles: string
    }

    repositories: Record<SupportedRepositories, RepositoryConfig>
}

export const makeConfig = (): Config => ({
    secrets: {
        github: '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',
    },
    paths: {
        sdkSpecifications: path.resolve(__dirname, '../specifications'),
        featureFiles: path.resolve(__dirname, '../specifications', 'features')
    },
    repositories: {
        java: {
            name: 'java',
            artifactName: 'acceptance-test-reports',
            mainReportName: 'main.xml',
            betaReportName: 'beta.xml',
        },
        dart: {
            name: 'dart',
            artifactName: 'acceptance-test-reports',
            mainReportName: 'report.xml',
            betaReportName: 'beta.xml',
        },
    },
})
