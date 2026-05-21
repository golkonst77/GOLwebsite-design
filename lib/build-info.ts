import { execSync } from 'child_process'

export function getBuildVersion(): string {
  try {
    const hash = execSync('git rev-parse --short HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()

    return hash ? `build ${hash}` : 'local build'
  } catch {
    return 'local build'
  }
}
