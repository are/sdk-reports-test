import { Octokit } from '@octokit/rest'
import AdmZip from 'adm-zip'
import { extname } from 'path'

import { Config } from './config'
import { Artifact, getEntryType, RepositoryConfig } from './manifest'

export class GithubService {
    private octo: Octokit

    constructor(private config: Config) {
        this.octo = new Octokit({
            auth: config.secrets.github,
        })
    }

    async fetchArtifacts() {
        const artifacts: Array<Artifact> = []

        for (const repo of Object.values(this.config.repositories)) {
            for await (const artifact of this.fetchLatestArtifact(repo)) {
                artifacts.push(artifact)
            }
        }

        return artifacts
    }

    async *fetchLatestArtifact(repositoryConfig: RepositoryConfig): AsyncGenerator<Artifact, void, undefined> {
        const {
            data: { artifacts: allArtifacts },
        } = await this.octo.actions.listArtifactsForRepo({
            owner: 'pubnub',
            repo: repositoryConfig.name,
        })

        const artifacts = allArtifacts.filter((artifact) => artifact.name === repositoryConfig.artifactName)

        artifacts.sort((a, b) => Date.parse(b.created_at ?? '0') - Date.parse(a.created_at ?? '0'))

        if (artifacts.length === 0) {
            throw new Error("SDK doesn't have any artifacts")
        }

        const [latestArtifact] = artifacts

        const { data: artifactZipBuffer } = await this.octo.actions.downloadArtifact({
            owner: 'pubnub',
            repo: repositoryConfig.name,
            artifact_id: latestArtifact.id,
            archive_format: 'zip',
        })

        if (!(artifactZipBuffer instanceof ArrayBuffer)) {
            throw new Error('artifact was sent in unknown format')
        }

        const zip = new AdmZip(Buffer.from(artifactZipBuffer))

        for (const entry of zip.getEntries()) {
            const entryType = getEntryType(repositoryConfig, entry.name)

            if (entryType === 'unknown') {
                continue
            }

            yield {
                language: repositoryConfig.name,
                createdAt: latestArtifact.created_at,
                extension: extname(entry.name).substring(1),
                contents: zip.readAsText(entry),
                type: entryType,
            }
        }
    }
}
