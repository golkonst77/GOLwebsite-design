import { loadEnvConfig } from "@next/env";
import { inspectTelegram, sendTelegramControlMessage } from "../lib/telegram-notifications";
async function main() {
    const args = process.argv.slice(2);
    if (args.length > 1 || (args[0] && !["--inspect", "--send-test"].includes(args[0])))
        throw new Error();
    let failed = false;
    loadEnvConfig(process.cwd(), false, { info() { }, error() { failed = true; } });
    if (failed)
        throw new Error();
    const c = inspectTelegram();
    console.log(c.enabled ? "TELEGRAM_ENABLED" : "TELEGRAM_DISABLED");
    console.log(c.ready ? "TELEGRAM_CONFIG_READY" : "TELEGRAM_NOT_CONFIGURED");
    if (args[0] === "--send-test") {
        const status = await sendTelegramControlMessage();
        console.log(`TELEGRAM_CONTROL_${status}`);
        if (status !== "ACCEPTED")
            process.exitCode = 1;
    }
}
void main().catch(() => {
    console.log("TELEGRAM_INSPECTION_FAILED");
    process.exitCode = 1;
});
