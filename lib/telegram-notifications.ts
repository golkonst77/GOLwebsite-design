// Server-only: imported by API handlers and the explicit local operator CLI.
import { setTimeout, clearTimeout } from "node:timers";
type Environment = Readonly<Record<string, string | undefined>>;
export type TelegramStatus = "DISABLED" | "NOT_CONFIGURED" | "INVALID_EVENT" | "ACCEPTED" | "HTTP_ERROR" | "API_ERROR" | "INVALID_JSON" | "NETWORK_ERROR" | "TIMEOUT";
export type AcceptedLead = {
    form: "lead" | "lexradar";
    requestId?: string;
    lexradar?: {
        name: string;
        email: string;
        site: string;
        phone: string;
        comment: string;
        receivedAt: string;
    };
};
const tokenPattern = /^\d{5,20}:[A-Za-z0-9_-]{30,100}$/;
const chatPattern = /^-?[1-9]\d{0,19}$/;
const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const titles = { lead: "Новая заявка с сайта GØL.", lexradar: "Новая заявка LexRadar." };
function configuration(env: Environment) {
    const token = env.TELEGRAM_BOT_TOKEN || "";
    const chatId = env.TELEGRAM_CHAT_ID || "";
    return {
        enabled: env.TELEGRAM_NOTIFICATIONS_ENABLED === "true",
        credentials: tokenPattern.test(token) && chatPattern.test(chatId)
            ? { token, chatId } : null,
    };
}
export function createTelegramService({ fetcher = fetch, env = () => process.env, timeoutMs = 1500, report = (status: TelegramStatus) => console.warn(`TELEGRAM_NOTIFICATION_${status}`), }: {
    fetcher?: typeof fetch;
    env?: () => Environment;
    timeoutMs?: number;
    report?: (status: TelegramStatus) => void;
} = {}) {
    async function send(text: string, credentials: {
        token: string;
        chatId: string;
    }): Promise<TelegramStatus> {
        const controller = new AbortController();
        let timer: ReturnType<typeof setTimeout> | undefined;
        const delivery = async (): Promise<TelegramStatus> => {
            try {
                const response = await fetcher(`https://api.telegram.org/bot${credentials.token}/sendMessage`, {
                    method: "POST", redirect: "error", cache: "no-store",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chat_id: credentials.chatId, text,
                        link_preview_options: { is_disabled: true } }),
                    signal: controller.signal,
                });
                if (!response.ok)
                    return "HTTP_ERROR";
                let data: unknown;
                try {
                    data = await response.json();
                }
                catch {
                    return "INVALID_JSON";
                }
                return data !== null && typeof data === "object" &&
                    "ok" in data && data.ok === true ? "ACCEPTED" : "API_ERROR";
            }
            catch {
                return "NETWORK_ERROR";
            }
        };
        try {
            // Covers both fetch and JSON, even if a transport fails to honour abort.
            return await Promise.race([
                delivery(),
                new Promise<TelegramStatus>((resolve) => {
                    timer = setTimeout(() => {
                        resolve("TIMEOUT");
                        controller.abort();
                    }, Math.max(1, Math.min(timeoutMs, 1500)));
                }),
            ]);
        }
        finally {
            clearTimeout(timer);
        }
    }
    function safeReport(status: TelegramStatus) {
        if (status === "DISABLED" || status === "ACCEPTED")
            return;
        try {
            report(status);
        }
        catch { /* Diagnostics must not affect a visitor's result. */ }
    }
    return {
        inspect() {
            const c = configuration(env());
            return { enabled: c.enabled, ready: Boolean(c.credentials) };
        },
        async notifyAcceptedLead(event: AcceptedLead): Promise<TelegramStatus> {
            let status: TelegramStatus;
            try {
                const c = configuration(env());
                if (!c.enabled)
                    return "DISABLED";
                if (!c.credentials)
                    status = "NOT_CONFIGURED";
                else if (!Object.hasOwn(titles, event.form) ||
                    (event.requestId !== undefined && !uuidPattern.test(event.requestId)))
                    status = "INVALID_EVENT";
                else {
                    const text = [titles[event.form], "Письмо принято почтовым сервером.",
                        "Проверьте рабочую почту.",
                        ...(event.form === "lexradar" && event.requestId ? [`Номер заявки: ${event.requestId}`] : []),
                        // Explicit allowlist: never serialize the submitted object or email.
                        // Form limits keep the complete message below Telegram's 4096 characters.
                        ...(event.form === "lexradar" && event.lexradar ? [
                            `Имя: ${event.lexradar.name}`,
                            `Email: ${event.lexradar.email}`,
                            ...(event.lexradar.phone ? [`Телефон: ${event.lexradar.phone}`] : []),
                            `Сайт: ${event.lexradar.site}`,
                            ...(event.lexradar.comment ? [`Комментарий: ${event.lexradar.comment}`] : []),
                            `Дата поступления (UTC): ${event.lexradar.receivedAt}`,
                        ] : []),
                    ].join("\n");
                    status = await send(text, c.credentials);
                }
            }
            catch {
                status = "NETWORK_ERROR";
            }
            safeReport(status);
            return status;
        },
        // Explicit operator action; deliberately works while notifications are disabled.
        async sendControlMessage(): Promise<TelegramStatus> {
            let status: TelegramStatus;
            try {
                const c = configuration(env());
                status = c.credentials
                    ? await send("Контрольное уведомление GØL. Проверка канала уведомлений. Письма не отправлялись.", c.credentials)
                    : "NOT_CONFIGURED";
            }
            catch {
                status = "NETWORK_ERROR";
            }
            safeReport(status);
            return status;
        },
    };
}
const telegram = createTelegramService();
export const notifyAcceptedLead = telegram.notifyAcceptedLead;
export const inspectTelegram = telegram.inspect;
export const sendTelegramControlMessage = telegram.sendControlMessage;
