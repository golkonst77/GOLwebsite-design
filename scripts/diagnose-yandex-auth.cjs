"use strict";

// No default Nodemailer logger, client commands, AUTH payloads or raw errors reach stdout.
const path = require("node:path");
const { createRequire } = require("node:module");
const { randomUUID } = require("node:crypto");
const methods = ["LOGIN", "PLAIN", "CRAM-MD5", "XOAUTH2", "OAUTHBEARER"];

function safeReply(raw, secrets = []) {
  if (typeof raw !== "string" || raw.length > 16384) return ["[REPLY_REDACTED]"];
  let clean = raw;
  for (const secret of [...new Set(secrets.filter(Boolean))].sort((a, b) => b.length - a.length))
    clean = clean.split(secret).join("[REDACTED]");
  const reasons = [
    [/application[- ]specific password (?:is )?required/i, "Application-specific password required"],
    [/web (?:browser|login)|log in (?:via|using) (?:your |a )?web/i, "Web login required"],
    [/account (?:is )?(?:blocked|disabled|locked)/i, "Account restricted"],
    [/user (?:not found|does not exist)|unknown user/i, "User not found"],
    [/invalid (?:login|username)|login (?:is )?incorrect/i, "Invalid login"],
    [/too many (?:login|auth(?:entication)?) attempts|rate limit/i, "Authentication rate limited"],
    [/authentication (?:is )?not (?:allowed|enabled)|smtp (?:is )?disabled/i, "Authentication not allowed"],
    [/invalid (?:user(?:name)? or password|credentials)|username and password not accepted/i, "Invalid user or password"],
    [/authentication (?:has )?(?:failed|unsuccessful)|auth(?:entication)? failure/i, "Authentication failed"],
    [/auth(?:entication)?(?: is)? successful|authenticated|authentication succeeded/i, "Authentication successful"],
    [/encryption required|must issue.*starttls|tls required/i, "TLS required"],
    [/message accepted|queued|ok: queued/i, "Message accepted"],
  ];
  return clean.split(/\r?\n/).slice(0, 64).map((line) => {
    const match = line.match(/^([2345]\d{2})([ -])(?:(\d\.\d{1,3}\.\d{1,3})\s+)?(.*)$/);
    if (!match) return "[REPLY_REDACTED]";
    const [, code, separator, enhanced, body] = match;
    if (code === "334") return "334 [AUTH_CHALLENGE_REDACTED]";
    const auth = body.match(/^AUTH(?:=|\s+)(.*)$/i);
    const known = auth
      ? "AUTH " + methods.filter((method) => auth[1].toUpperCase().split(/\s+/).includes(method)).join(" ")
      : reasons.map(([pattern, text]) => ({ index: body.search(pattern), text }))
        .filter((reason) => reason.index >= 0)
        .sort((first, second) => first.index - second.index)
        .map((reason) => reason.text).join("; ");
    // Only codes, separators and STATIC recognized reasons survive. Unknown free text,
    // addresses, IPs, URLs, identifiers, tokens and encodings are hidden completely.
    return code + separator + (enhanced ? enhanced + " " : "") + (known ? known + " " : "") + "[REDACTED]";
  });
}

function safeLogger(emit, secrets, state) {
  let replies = 0;
  return {
    debug(data, message) {
      if (data?.tnx !== "server" || replies++ >= 120) return;
      emit({ status: "SMTP_SERVER_REPLY", reply: safeReply(message, secrets) });
    },
    info(data) {
      if (["authenticated", "authfail"].includes(data?.action) && methods.includes(data.method))
        state.actualMethod = data.method;
    },
    trace() {}, warn() {}, error() {}, fatal() {},
  };
}

async function runAuthDiagnostic({ smtp, env, Connection, nodemailer, createEmailSender, safeSmtpError, emit }) {
  const primary = env.SMTP_AUTH_METHOD?.trim() || smtp.options.authMethod || "LOGIN";
  if (!["LOGIN", "PLAIN"].includes(primary)) {
    emit({ status: "INVALID_AUTH_METHOD" });
    return false;
  }
  const pass = smtp.options.auth.pass;
  const secrets = [
    pass, smtp.options.auth.user, smtp.from, "golwebstudio@mail.ru",
    Buffer.from(pass).toString("base64"),
    Buffer.from(smtp.options.auth.user).toString("base64"),
    Buffer.from("\0" + smtp.options.auth.user + "\0" + pass).toString("base64"),
    encodeURIComponent(pass),
  ];
  // At most two connection/authentication attempts, SAME unchanged credentials.
  // No fallback/retry once authentication succeeded or delivery began.
  for (const method of [primary, primary === "LOGIN" ? "PLAIN" : "LOGIN"]) {
    let stage = "connection";
    const state = {};
    let cancelled = false;
    const connection = new Connection({
      ...smtp.options,
      name: "www.golwebstudio.ru",
      maxResponseSize: 16384,
      debug: true,
      logger: safeLogger(emit, secrets, state),
      tls: { ...smtp.options.tls, minVersion: "TLSv1.2", rejectUnauthorized: true },
    });
    let timer;
    let advertised = [];
    const eventError = new Promise((_, reject) => connection.on("error", reject));
    const call = (action) => new Promise((resolve, reject) =>
      action((error, value) => error ? reject(error) : resolve(value)));
    try {
      const session = async () => {
        emit({ status: "AUTH_ATTEMPT", method });
        await call((callback) => connection.connect(callback));
        const socket = connection._socket;
        const protocol = socket?.getProtocol?.();
        if (!connection.secure || !socket?.authorized || !["TLSv1.2", "TLSv1.3"].includes(protocol))
          throw Object.assign(new Error(), { code: "ETLS" });
        emit({ status: "TLS_OK", protocol, certificateVerified: true });
        advertised = methods.filter((entry) => connection._supportedAuth?.includes(entry));
        emit({ status: "SMTP_CAPABILITIES", authMethods: advertised });
        if (!advertised.includes(method)) return "NOT_ADVERTISED";
        stage = "authentication";
        const auth = { user: smtp.options.auth.user, pass, method };
        const pending = call((callback) => connection.login(auth, callback));
        void pending.catch(() => {});
        if (connection._authMethod !== method) {
          emit({ status: "AUTH_METHOD_MISMATCH" });
          throw Object.assign(new Error(), { code: "ECONNECTION" });
        }
        emit({ status: "AUTH_METHOD_SELECTED", method });
        if (connection._auth?.credentials?.pass !== pass) {
          emit({ status: "CREDENTIAL_FORWARDING_FAILED" });
          throw Object.assign(new Error(), { code: "ECONNECTION" });
        }
        emit({ status: "CREDENTIAL_FORWARDING_OK" });
        await pending;
        if (cancelled) return false;
        if (state.actualMethod !== method || !connection.authenticated)
          throw Object.assign(new Error(), { code: "ECONNECTION" });
        emit({ status: "SMTP_AUTH_OK", method });
        stage = "delivery";
        const compose = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: "windows" });
        const send = createEmailSender({
          env: () => env,
          makeTransport: () => ({
            async sendMail(options) {
              const message = await compose.sendMail(options);
              return call((callback) => connection.send(message.envelope, message.message, callback));
            },
            close() { connection.close(); },
          }),
        });
        const id = randomUUID();
        const text = "LexRadar SMTP AUTH TEST\nTest ID: " + id + "\nUTC: " + new Date().toISOString();
        const result = await send({
          to: "golwebstudio@mail.ru",
          subject: "[GØL] LexRadar — SMTP AUTH TEST",
          text, html: "<pre>" + text + "</pre>",
        });
        compose.close();
        if (cancelled) return false;
        emit({
          status: result.success ? "SMTP_ACCEPTED" :
            result.uncertain ? "DELIVERY_UNCONFIRMED" : "SEND_FAILED",
          method, testId: id, inboxReceiptConfirmed: false,
        });
        if (result.success) emit({ status: "AUTH_METHOD_FOR_PRODUCTION", method });
        return result.success;
      };
      const outcome = await Promise.race([
        session(),
        eventError,
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(Object.assign(new Error(), { code: "ETIMEDOUT" })), 45000);
        }),
      ]);
      if (outcome !== "NOT_ADVERTISED") return outcome;
      emit({ status: "AUTH_NOT_ADVERTISED", method });
    } catch (cause) {
      const safe = safeSmtpError(cause);
      const reply = safeReply(cause?.response, secrets);
      emit({
        status: "SMTP_FAILED", stage, method,
        ...safe,
        reply,
      });
      const alternative = method === "LOGIN" ? "PLAIN" : "LOGIN";
      if (stage !== "authentication" || safe.smtpCode !== "EAUTH" ||
          safe.responseCode !== 535 || !advertised.includes(alternative)) return false;
      if (reply.some((line) => /Account restricted|Authentication rate limited|Authentication not allowed|Web login required/.test(line)))
        return false;
    } finally {
      cancelled = true;
      clearTimeout(timer);
      connection.close();
    }
  }
  return false;
}

async function main() {
  const emit = (value) => process.stdout.write(JSON.stringify(value) + "\n");
  const project = createRequire(path.join(process.cwd(), "package.json"));
  if (process.env.NODE_ENV === "test" || process.env.__NEXT_PROCESSED_ENV) {
    emit({ status: "FRESH_PRODUCTION_PROCESS_REQUIRED" });
    process.exitCode = 1;
    return;
  }
  let failed = false;
  const { loadEnvConfig } = project("@next/env");
  const inherited = { ...process.env };
  const loaded = loadEnvConfig(process.cwd(), false, { info() {}, error() { failed = true; } });
  if (failed) throw new Error();
  process.env.TSX_DISABLE_CACHE = "1"; // This process only; no compiled-source cache writes.
  project("tsx/cjs");
  const { getSmtpConfig, getLeadRecipient } = project("./lib/smtp-config.ts");
  const { createEmailSender } = project("./lib/email-service.ts");
  const { safeSmtpError } = project("./lib/smtp-errors.ts");
  const { auditSmtpEnvironment } = project("./lib/smtp-diagnostics.ts");
  const files = loaded.loadedEnvFiles.map((file) => ({ name: file.path, contents: file.contents }));
  const audit = auditSmtpEnvironment(files, inherited, process.env);
  const smtp = getSmtpConfig();
  if (audit.duplicates.length || !smtp || smtp.options.host !== "smtp.yandex.ru" ||
      smtp.options.port !== 465 || !smtp.options.secure ||
      smtp.options.auth.user !== "golkonst@yandex.ru" || smtp.from !== "golkonst@yandex.ru" ||
      getLeadRecipient() !== "golwebstudio@mail.ru") {
    emit({ status: "CONFIGURATION_REJECTED" });
    process.exitCode = 1;
    return;
  }
  emit({ status: "CONFIG_OK", settingsChanged: false, formSwitchChanged: false });
  const connectionModule = project("nodemailer/lib/smtp-connection");
  const success = await runAuthDiagnostic({
    smtp, env: process.env, Connection: connectionModule.default || connectionModule,
    nodemailer: project("nodemailer"), createEmailSender, safeSmtpError, emit,
  });
  emit({ status: success ? "CHECK_COMPLETE" : "CHECK_FAILED", inboxReceiptConfirmed: false, settingsChanged: false });
  if (!success) process.exitCode = 1;
}

module.exports = { safeReply, safeLogger, runAuthDiagnostic };
if (!module.parent) main().catch(() => {
  process.stdout.write('{"status":"LOCAL_DIAGNOSTIC_ERROR","settingsChanged":false}\n');
  process.exitCode = 1;
});
