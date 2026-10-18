import { test } from "node:test";
import assert from "node:assert/strict";
import { createTelegramService, type TelegramStatus } from "../lib/telegram-notifications";
// Synthetic configuration only; never a real token/chat or network request.
const token = "123456789:" + "x".repeat(35);
const chatId = "9876543210";
const configured = {
    TELEGRAM_NOTIFICATIONS_ENABLED: "true",
    TELEGRAM_BOT_TOKEN: token,
    TELEGRAM_CHAT_ID: chatId,
};
const id = "00000000-0000-4000-8000-000000000001";
function fixture(fetcher: typeof fetch, patch = {}, timeoutMs = 50) {
    const logs: TelegramStatus[] = [];
    return { logs, ...createTelegramService({ fetcher, env: () => ({ ...configured, ...patch }), timeoutMs, report: s => logs.push(s) }) };
}
for (const flag of [undefined, "", "false", "TRUE", "1"])
    test(`Telegram disabled flag ${String(flag)} never calls fetch`, async () => {
        const service = fixture(async () => { throw new Error("must not call fetch"); }, { TELEGRAM_NOTIFICATIONS_ENABLED: flag });
        assert.equal(await service.notifyAcceptedLead({ form: "lead" }), "DISABLED");
        assert.deepEqual(service.logs, []);
    });
for (const patch of [
    { TELEGRAM_BOT_TOKEN: "" }, { TELEGRAM_CHAT_ID: "" },
    { TELEGRAM_BOT_TOKEN: "bad\ninput" }, { TELEGRAM_BOT_TOKEN: "https://example.invalid" },
    { TELEGRAM_CHAT_ID: "@someone" }, { TELEGRAM_CHAT_ID: "1\n" },
])
    test("Telegram incomplete/invalid config blocks network", async () => {
        let calls = 0;
        const service = fixture(async () => { calls++; throw new Error(); }, patch);
        assert.equal(service.inspect().ready, false);
        assert.equal(await service.notifyAcceptedLead({ form: "lead" }), "NOT_CONFIGURED");
        assert.equal(calls, 0);
    });
test("Telegram posts only fixed text/status and existing UUID to fixed HTTPS endpoint", async () => {
    const posts: {
        chat_id: string;
        text: string;
    }[] = [];
    const service = fixture(async (url, options) => {
        assert.equal(url, `https://api.telegram.org/bot${token}/sendMessage`);
        assert.equal(options?.method, "POST");
        assert.equal(options?.redirect, "error");
        posts.push(JSON.parse(String(options?.body)));
        return new Response(JSON.stringify({ ok: true, result: { text: "not exposed" } }));
    });
    const privateFields = { name: "PRIVATE_NAME", email: "PRIVATE_EMAIL", phone: "PRIVATE_PHONE", site: "PRIVATE_URL", ip: "PRIVATE_IP", utm: "PRIVATE_UTM", comment: "PRIVATE_COMMENT" };
    assert.equal(await service.notifyAcceptedLead({ form: "lexradar", requestId: id, ...privateFields }), "ACCEPTED");
    assert.equal(await service.notifyAcceptedLead({ form: "lead", requestId: id, ...privateFields }), "ACCEPTED");
    assert.deepEqual(Object.keys(posts[0]).sort(), ["chat_id", "text"]);
    assert.equal(posts[0].chat_id, chatId);
    assert.match(posts[0].text, /Новая заявка LexRadar/);
    assert.match(posts[0].text, /Письмо принято почтовым сервером/);
    assert.match(posts[0].text, new RegExp(id));
    assert.doesNotMatch(posts[1].text, /Номер заявки/);
    for (const post of posts)
        assert.doesNotMatch(post.text, /PRIVATE_|доставлено во входящие|прочитано/);
    assert.deepEqual(service.logs, []);
});
test("Telegram rejects injected identifier and runtime form type", async () => {
    let calls = 0;
    const service = fixture(async () => { calls++; throw new Error(); });
    assert.equal(await service.notifyAcceptedLead({ form: "lexradar", requestId: id + "\nPRIVATE" }), "INVALID_EVENT");
    // @ts-expect-error Runtime defensive check for an invalid internal event.
    assert.equal(await service.notifyAcceptedLead({ form: "PRIVATE_FORM" }), "INVALID_EVENT");
    assert.equal(calls, 0);
});
for (const [response, status] of [
    [() => new Response("PRIVATE_RESPONSE", { status: 429 }), "HTTP_ERROR"],
    [() => new Response(JSON.stringify({ ok: false, description: "PRIVATE_RESPONSE" })), "API_ERROR"],
    [() => new Response("{PRIVATE_RESPONSE"), "INVALID_JSON"],
    [() => new Response(JSON.stringify({ ok: "true" })), "API_ERROR"],
] as const)
    test(`Telegram ${status} is safe and is not retried`, async () => {
        let calls = 0;
        const service = fixture(async () => { calls++; return response(); });
        assert.equal(await service.notifyAcceptedLead({ form: "lead" }), status);
        assert.equal(calls, 1);
        assert.deepEqual(service.logs, [status]);
        assert.doesNotMatch(JSON.stringify(service.logs), /PRIVATE_|123456789|9876543210/);
    });
test("Telegram network exception/URL cannot escape diagnostics", async () => {
    const service = fixture(async () => { throw new Error(`PRIVATE https://api.telegram.org/bot${token}`); });
    assert.equal(await service.notifyAcceptedLead({ form: "lead" }), "NETWORK_ERROR");
    assert.deepEqual(service.logs, ["NETWORK_ERROR"]);
});
test("Telegram deadline covers a fetch that ignores abort, once only", async () => {
    let calls = 0;
    let signal: AbortSignal | undefined;
    const service = fixture(async (_url, options) => { calls++; signal = options?.signal ?? undefined; return new Promise(() => { }); }, {}, 10);
    const start = performance.now();
    assert.equal(await service.notifyAcceptedLead({ form: "lead" }), "TIMEOUT");
    assert.ok(performance.now() - start < 1000);
    assert.equal(signal?.aborted, true);
    assert.equal(calls, 1);
});
test("Telegram deadline also covers hanging JSON and logger failure", async () => {
    const response = new Response("{}");
    response.json = () => new Promise(() => { });
    const service = createTelegramService({ env: () => configured, timeoutMs: 10, fetcher: async () => response, report: () => { throw new Error("PRIVATE"); } });
    assert.equal(await service.notifyAcceptedLead({ form: "lead" }), "TIMEOUT");
});
test("explicit control test works while disabled and never claims SMTP acceptance", async () => {
    let text = "";
    const service = fixture(async (_url, options) => { text = JSON.parse(String(options?.body)).text; return new Response('{"ok":true}'); }, { TELEGRAM_NOTIFICATIONS_ENABLED: "false" });
    assert.equal(await service.notifyAcceptedLead({ form: "lead" }), "DISABLED");
    assert.equal(await service.sendControlMessage(), "ACCEPTED");
    assert.match(text, /Контрольное уведомление/);
    assert.doesNotMatch(text, /Письмо принято|PRIVATE|Номер заявки/);
});
test("default runtime logger never includes URL, token, recipient or request data", async () => {
    const logs: unknown[][] = [];
    const previous = console.warn;
    console.warn = (...args) => { logs.push(args); };
    try {
        const service = createTelegramService({ env: () => configured, fetcher: async () => { throw new Error(`PRIVATE ${token} ${chatId}`); } });
        assert.equal(await service.notifyAcceptedLead({ form: "lexradar", requestId: id }), "NETWORK_ERROR");
        assert.deepEqual(logs, [["TELEGRAM_NOTIFICATION_NETWORK_ERROR"]]);
    }
    finally {
        console.warn = previous;
    }
});
