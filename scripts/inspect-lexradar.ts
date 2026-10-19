import { loadEnvConfig } from "@next/env";
import { inspectLexradarReadiness } from "../lib/lexradar-config";

// Read-only and offline. Uses the same production env loader and readiness gate.
try {
  if (process.argv.length !== 2 || process.env.NODE_ENV === "test") throw Error();
  let failed = false;
  loadEnvConfig(process.cwd(), false, { info() {}, error() { failed = true; } });
  if (failed) throw Error();
  const status = inspectLexradarReadiness();
  console.log(status.ready ? "FORM_READY" : "FORM_NOT_READY");
  console.log(status.enabled ? "FORM_FLAG_ENABLED" : "FORM_FLAG_DISABLED");
  for (const blocker of status.blockers) console.log(`FORM_BLOCKER_${blocker}`);
  console.log("FORM_INSPECTION_ONLY_NO_NETWORK_NO_CHANGES");
  if (!status.ready || !status.enabled) process.exitCode = 1;
} catch {
  console.log("FORM_INSPECTION_FAILED_NO_SECRET_DETAILS");
  process.exitCode = 1;
}
