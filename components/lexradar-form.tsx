"use client";

import { useRef, useState, type FormEvent } from "react";

import { collectUtm, CONSENT_VERSION } from "@/lib/lexradar-constants";

export default function LexradarForm({ enabled }: { enabled: boolean }) {
  const [state, setState] = useState<
    "idle" | "sending" | "success" | "error" | "uncertain"
  >("idle");
  const [error, setError] = useState("");
  const active = useRef(false);
  const identity = useRef<{ id: string; payload: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !enabled ||
      active.current ||
      state === "uncertain" ||
      state === "success"
    )
      return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    const data = {
      ...fields,
      consent: fields.consent === "on",
      consentVersion: CONSENT_VERSION,
      utm: collectUtm(window.location.search),
    };
    const payload = JSON.stringify(data);
    if (!identity.current || identity.current.payload !== payload)
      identity.current = { id: crypto.randomUUID(), payload };
    active.current = true;
    setState("sending");
    try {
      const response = await fetch("/api/lexradar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, requestId: identity.current.id }),
        signal: AbortSignal.timeout(40000),
      });
      const result = await response.json();
      if (response.ok && result.ok === true && result.code === "ACCEPTED") {
        setState("success");
        form.reset();
        return;
      }
      const messages: Record<string, string> = {
        UNAVAILABLE:
          "Приём заявок временно недоступен. Напишите на golwebstudio@bk.ru.",
        VALIDATION:
          "Проверьте адрес сайта, имя, email, телефон и согласие на обработку данных.",
        RATE_LIMIT: "Слишком много попыток. Попробуйте через 10 минут.",
        SEND_FAILED:
          "Почтовый сервис отклонил заявку. Попробуйте позже или напишите на golwebstudio@bk.ru.",
        ORIGIN:
          "Не удалось проверить источник заявки. Обновите страницу или напишите нам.",
      };
      if (result.code === "SEND_FAILED") identity.current = null;
      if (result.code === "DELIVERY_UNCONFIRMED" || !messages[result.code]) {
        setError(
          "Статус доставки не подтверждён. Не отправляйте заявку повторно: напишите на golwebstudio@bk.ru, чтобы уточнить статус.",
        );
        setState("uncertain");
      } else {
        setError(messages[result.code]);
        setState("error");
      }
    } catch {
      setError(
        "Статус доставки не подтверждён. Не отправляйте заявку повторно: напишите на golwebstudio@bk.ru, чтобы уточнить статус.",
      );
      setState("uncertain");
    } finally {
      active.current = false;
    }
  }
  const inputClass =
    "mt-2 w-full rounded-xl border border-white/20 bg-background p-4 text-white outline-none focus:border-gold focus:ring-1 focus:ring-gold";
  return (
    <form
      onSubmit={submit}
      className="lr-form"
      aria-label="Заявка на бесплатную проверку"
      aria-busy={state === "sending"}
    >
      <p className="mb-6 text-sm text-white/65">
        Поля со звёздочкой обязательны. Не указывайте сведения о клиентах и
        другие конфиденциальные данные.
      </p>
      {!enabled && (
        <p className="mb-6 text-sm text-amber-200" role="status">
          Онлайн-приём заявок пока не подтверждён. Для запроса проверки напишите
          на{" "}
          <a className="underline" href="mailto:golwebstudio@bk.ru">
            golwebstudio@bk.ru
          </a>
          .
        </p>
      )}
      <fieldset
        disabled={
          !enabled ||
          state === "sending" ||
          state === "uncertain" ||
          state === "success"
        }
      >
        <legend className="sr-only">Данные для предварительной проверки</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            Адрес сайта *
            <input
              className={inputClass}
              name="site"
              type="url"
              placeholder="https://example.ru"
              required
              maxLength={500}
              autoComplete="url"
            />
          </label>
          <label>
            Имя *
            <input
              className={inputClass}
              name="name"
              required
              maxLength={100}
              autoComplete="given-name"
            />
          </label>
          <label>
            Email *
            <input
              className={inputClass}
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
            />
          </label>
          <label className="sm:col-span-2">
            Телефон <span className="text-white/50">(необязательно)</span>
            <input
              className={inputClass}
              name="phone"
              type="tel"
              maxLength={30}
              autoComplete="tel"
            />
          </label>
          <label className="sm:col-span-2">
            Комментарий <span className="text-white/50">(необязательно)</span>
            <textarea
              className={inputClass}
              name="comment"
              rows={3}
              maxLength={2000}
            />
          </label>
        </div>
        <div className="absolute -left-[10000px]" aria-hidden="true">
          <label>
            Не заполняйте
            <input name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <label className="mt-6 flex items-start gap-3 text-sm leading-relaxed text-white/70">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-1 size-5 shrink-0 accent-[#d4af37]"
          />
          <span>
            Даю{" "}
            <a
              href="/lexradar/consent"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              согласие на обработку персональных данных
            </a>{" "}
            для рассмотрения заявки и связи со мной. Ознакомлен(а) с{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              политикой обработки данных
            </a>
            . Рекламные рассылки не предусмотрены.
          </span>
        </label>
        <button
          className="lr-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
          disabled={
            !enabled ||
            state === "sending" ||
            state === "uncertain" ||
            state === "success"
          }
        >
          {state === "sending"
            ? "Отправляем…"
            : "Отправить на бесплатную проверку"}
        </button>
      </fieldset>
      <div aria-live="polite" aria-atomic="true" className="mt-4 text-sm">
        {state === "success" && (
          <p>
            Заявка передана в почтовый сервис. Мы свяжемся с вами по указанному
            email после рассмотрения.
          </p>
        )}
        {(state === "error" || state === "uncertain") && (
          <p role="alert" className="text-orange-200">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
