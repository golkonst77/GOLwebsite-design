import { getBuildVersion } from '@/lib/build-info'

export default function BuildVersion() {
  return (
    <p className="text-muted-foreground/70 text-xs tracking-[0.2em] uppercase">
      {getBuildVersion()}
    </p>
  )
}
