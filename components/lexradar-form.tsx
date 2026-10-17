"use client";

import { useState, type FormEvent } from "react";

export default function LexradarForm({ enabled }: { enabled: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || state === "sending") return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    const utm: Record<string, string> = {};
    new URLSearchParams(window.location.search).forEach((value, key) => {
      if (/^utm_(source|medium|campaign|term|content)$/.test(key))
        utm[key] = value.slice(0, 200);
    });
    setState("sending");
    try {
      const response = await fetch("/api/lexradar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          consent: fields.consent === "on",
          utm,
        }),
        signal: AbortSignal.timeout(25000),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true)
        throw new Error(
          result.error || "Не удалось отправить заявку. Попробуйте позже.",
        );
      setState("success");
      form.reset();
    } catch (cause) {
      setError(
        cause instanceof Error && cause.name !== "TimeoutError"
          ? cause.message
          : "Не удалось подтвердить отправку. Свяжитесь с нами по email, чтобы уточнить статус заявки.",
      );
      setState("error");
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
      {!enabled && (
        <p className="mt-5 text-sm text-amber-200">
          Онлайн-приём заявок пока не подтверждён. Для запроса проверки напишите
          на{" "}
          <a className="underline" href="mailto:golwebstudio@mail.ru">
            golwebstudio@mail.ru
          </a>
          .
        </p>
      )}
      <button
        className="lr-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!enabled || state === "sending"}
      >
        {state === "sending"
          ? "Отправляем…"
          : "Отправить на бесплатную проверку"}
      </button>
      <div aria-live="polite" aria-atomic="true" className="mt-4 text-sm">
        {state === "success" && (
          <p>
            Заявка передана в почтовый сервис. Мы свяжемся с вами по указанному
            email после рассмотрения.
          </p>
        )}
        {state === "error" && (
          <p role="alert" className="text-orange-200">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
