
import git from 'simple-git'

export function makeRepository(path: string) {
    const repo = git(path)

    return {
        async latestCommitDate() {
            const result = await repo.log({ maxCount: 1 })

            return result.latest?.date
        }
    }
}