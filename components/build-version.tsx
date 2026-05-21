import { getBuildVersion } from '@/lib/build-info'

export default function BuildVersion() {
  return (
    <p className="font-mono text-xs tracking-wide text-muted-foreground">
      {getBuildVersion()}
    </p>
  )
}
