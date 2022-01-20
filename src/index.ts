import { makeConfig } from './config'
import { makeMetadata } from './gherkin'
import { GithubService } from './github'
import { getLocalArtifacts, processArtifacts } from './reports'
import { loadJson, saveJson } from './utils'
import { makeRepository } from './git'

async function main() {
    const config = makeConfig()

    const sdkSpecifications = makeRepository(config.paths.sdkSpecifications)
    const sdkReports = makeRepository('.')

    const latestSdkSpecificationsUpdate = new Date((await sdkSpecifications.latestCommitDate()) ?? 0)
    const latestSdkReportsMetadataUpdate = new Date((await sdkReports.latestCommitDateForFile('metadata.json')) ?? 0)

    if (
        process.argv.includes('--force-metadata') ||
        latestSdkReportsMetadataUpdate.getTime() < latestSdkSpecificationsUpdate.getTime()
    ) {
        console.log('Rebuilding metadata.')
        const metadata = await makeMetadata(config.paths.featureFiles)

        await saveJson('metadata', metadata)
    }

    const metadata = await loadJson('metadata')

    const artifacts = await getLocalArtifacts('./reports', config)

    // const githubService = new GithubService(config)
    // const artifacts = await githubService.fetchArtifacts()

    const reports = processArtifacts(artifacts, metadata)

    await saveJson('manifest', reports)
}

main().catch(console.error)
