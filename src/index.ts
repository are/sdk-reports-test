import { makeConfig } from './config'
import { makeMetadata } from './gherkin'
import { GithubService } from './github'
import { processArtifacts } from './reports'
import { saveJson } from './utils'
import { makeRepository } from './git'

async function main() {
    const config = makeConfig()

    const sdkSpecifications = makeRepository(config.paths.sdkSpecifications)
    const sdkReports = makeRepository('.')

    const githubService = new GithubService(config)
    
    console.log(await sdkSpecifications.latestCommitDate())
    console.log(await sdkReports.latestCommitDate())

    const metadata = await makeMetadata(config.paths.featureFiles)
    const artifacts = await githubService.fetchArtifacts()

    const reports = processArtifacts(artifacts, metadata)

    await saveJson('metadata', metadata)
    await saveJson('manifest', reports)
}

main().catch(console.error)
