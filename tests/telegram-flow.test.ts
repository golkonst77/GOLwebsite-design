import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import { transformSync } from "esbuild";
import { NextRequest } from "next/server";
import { createLeadEmailSender } from "../lib/lead-delivery";
import { createLexradarHandler } from "../lib/lexradar-handler";
import { createTelegramService, type AcceptedLead } from "../lib/telegram-notifications";
import { CONSENT_VERSION } from "../lib/lexradar-constants";
const require = createRequire(import.meta.url);
const id = "00000000-0000-4000-8000-000000000002";
const origin = "https://example.invalid";
const received = Date.parse("2026-10-19T10:00:00.000Z");
const settings = { enabled: true, ready: true, origin, abuseMode: "single-process" as const, clientIpHeader: null };
function request(lex: boolean) {
    return new NextRequest(`http://localhost/api/${lex ? "lexradar" : "lead"}`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(lex ? { requestId: id, consentVersion: CONSENT_VERSION, site: "https://site.example.invalid", name: "PRIVATE_NAME", email: "private@example.invalid", consent: true } : { name: "PRIVATE_NAME", contact: "+7 (999) 000-00-00", message: "PRIVATE_COMMENT", consent: true }) });
}
function actualLeadRoute(deliver: ReturnType<typeof createLeadEmailSender>) {
    const source = transformSync(readFileSync("app/api/lead/route.ts", "utf8"), { loader: "ts", format: "cjs" }).code;
    const sandboxModule = { exports: {} as {
            POST: (request: NextRequest) => Promise<Response>;
        } };
    vm.runInNewContext(source, { module: sandboxModule, exports: sandboxModule.exports, require: (name: string) => {
            if (name === "@/lib/lead-delivery")
                return { sendLeadEmail: deliver };
            if (name === "@/lib/smtp-config")
                return { getLeadRecipient: () => "recipient@example.invalid" };
            return require(name);
        }, Date, Map });
    return sandboxModule.exports.POST;
}
for (const lex of [false, true]) {
    for (const outcome of [{ success: false }, { success: false, uncertain: true }, { success: true, uncertain: true }])
        test(`${lex ? "LexRadar" : "general"} SMTP failure or uncertainty never notifies`, async () => {
            let calls = 0;
            const deps = { send: async () => outcome, notify: async () => { calls++; return "ACCEPTED" as const; } };
            const handler = lex ? createLexradarHandler({ ...deps, config: () => settings }) : actualLeadRoute(createLeadEmailSender(deps));
            const res = await handler(request(lex));
            assert.equal(calls, 0);
            assert.equal(res.status, outcome.success ? 200 : lex && outcome.uncertain ? 504 : lex ? 502 : 500);
        });
    test(`${lex ? "LexRadar" : "general"} Telegram failure preserves accepted SMTP response`, async () => {
        let mails = 0;
        const order: string[] = [];
        const events: AcceptedLead[] = [];
        const deps = { send: async () => { mails++; order.push("smtp"); return { success: true }; }, notify: async (event: AcceptedLead) => { order.push("telegram"); events.push(event); throw Error("PRIVATE"); } };
        const handler = lex ? createLexradarHandler({ ...deps, config: () => settings, now: () => received }) : actualLeadRoute(createLeadEmailSender(deps));
        const res = await handler(request(lex));
        assert.equal(res.status, 200);
        assert.deepEqual(await res.json(), lex ? { ok: true, code: "ACCEPTED" } : { ok: true });
        assert.equal(mails, 1);
        assert.deepEqual(order, ["smtp", "telegram"]);
        assert.deepEqual(events, lex ? [{ form: "lexradar", requestId: id,
            lexradar: { name: "PRIVATE_NAME", email: "private@example.invalid", site: "https://site.example.invalid",
                phone: "", comment: "", receivedAt: new Date(received).toISOString() } }] : [{ form: "lead" }]);
    });
    test(`${lex ? "LexRadar" : "general"} Telegram timeout never resends mail`, async () => {
        let mails = 0, posts = 0;
        const telegram = createTelegramService({ env: () => ({ TELEGRAM_NOTIFICATIONS_ENABLED: "true", TELEGRAM_BOT_TOKEN: "123456789:" + "x".repeat(35), TELEGRAM_CHAT_ID: "9876543210" }), fetcher: async () => { posts++; return new Promise(() => { }); }, timeoutMs: 5, report() { } });
        const deps = { send: async () => { mails++; return { success: true }; }, notify: telegram.notifyAcceptedLead };
        const handler = lex ? createLexradarHandler({ ...deps, config: () => settings }) : actualLeadRoute(createLeadEmailSender(deps));
        const res = await handler(request(lex));
        assert.equal(res.status, 200);
        assert.equal(mails, 1);
        assert.equal(posts, 1);
        assert.doesNotMatch(await res.text(), /TELEGRAM|TIMEOUT/);
    });
}
test("LexRadar concurrent and later same UUID share one email and notification", async () => {
    let mails = 0, notices = 0;
    let release!: () => void;
    const waiting = new Promise<void>(r => { release = r; });
    const handler = createLexradarHandler({ config: () => settings, send: async () => { mails++; return { success: true }; }, notify: async () => { notices++; await waiting; return "API_ERROR"; } });
    const first = handler(request(true));
    await new Promise(r => setImmediate(r));
    const second = handler(request(true));
    release();
    const responses = await Promise.all([first, second, handler(request(true))]);
    assert.ok(responses.every(r => r.status === 200));
    assert.equal(mails, 1);
    assert.equal(notices, 1);
});
test("general form keeps existing repeat behaviour and has no new identifier", async () => {
    let mails = 0, notices = 0;
    const handler = actualLeadRoute(createLeadEmailSender({ send: async () => { mails++; return { success: true }; }, notify: async (e) => { assert.deepEqual(e, { form: "lead" }); notices++; return "ACCEPTED"; } }));
    assert.equal((await handler(request(false))).status, 200);
    assert.equal((await handler(request(false))).status, 200);
    assert.equal(mails, 2);
    assert.equal(notices, 2);
});
test("common SMTP service and diagnostics have no notification hooks", () => {
    for (const path of ["lib/email-service.ts", "lib/smtp-diagnostics.ts", "scripts/diagnose-smtp.ts"])
        assert.doesNotMatch(readFileSync(path, "utf8"), /telegram|lead-delivery/i);
});
