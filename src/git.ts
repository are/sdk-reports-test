
import git from 'simple-git'

export function makeRepository(path: string) {
    const repo = git(path)

    return {
        async latestCommitDate() {
            const result = await repo.log({ maxCount: 1 })

            return result.latest?.date
        },
        async latestCommitDateForFile(filePath: string) {
            const result = await repo.raw(['rev-list', '-1', 'HEAD', filePath])

            const date = await repo.show(['--no-patch', '--no-notes', "--pretty='%cI'", result.trim()])

            return date.substring(1, date.length - 2)
        }
    }
}