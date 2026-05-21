import { execSync } from 'child_process'
import pkg from '@/package.json'

function getGitShortHash(): string | null {
  try {
    const hash = execSync('git rev-parse --short HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()

    return hash || null
  } catch {
    return null
  }
}

export function getBuildVersion(): string {
  const semver = `v${pkg.version}`
  const hash = getGitShortHash()

  if (hash) {
    return `${semver} · build ${hash}`
  }

  return semver
}
