// Local TLS protocol fixtures only. These tests do NOT establish Yandex delivery.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createServer, type TLSSocket } from "node:tls";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import nodemailer from "nodemailer";
import { createEmailSender } from "../lib/email-service";
import { getSmtpConfig } from "../lib/smtp-config";
import { safeSmtpError } from "../lib/smtp-errors";

const require = createRequire(import.meta.url);
const { safeReply, safeLogger, runAuthDiagnostic } = require("../scripts/diagnose-yandex-auth.cjs");
const connectionModule = require("nodemailer/lib/smtp-connection");
const Connection = connectionModule.default || connectionModule;
let directory: string;
let cert: Buffer;
let key: Buffer;
before(() => {
  directory = mkdtempSync(join(tmpdir(), "lexradar-auth-tls-"));
  execFileSync("openssl", [
    "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1",
    "-subj", "/CN=localhost", "-addext", "subjectAltName=DNS:localhost",
    "-keyout", join(directory, "key.pem"), "-out", join(directory, "cert.pem"),
  ], { stdio: "ignore" });
  cert = readFileSync(join(directory, "cert.pem"));
  key = readFileSync(join(directory, "key.pem"));
});
after(() => rmSync(directory, { recursive: true, force: true }));

async function fixture({
  loginFails = false, plainFails = false, rejectMail = false, trust = true,
  failureText = "Error: authentication failed: Invalid user or password!",
} = {}) {
  const pass = " fixture-$#пароль-'end ";
  const user = "fixture@example.invalid";
  const attempts: string[] = [];
  const forwarded: boolean[] = [];
  const sockets = new Set<TLSSocket>();
  let messages = 0;
  const server = createServer({ key, cert }, (socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.on("error", () => {});
    socket.setEncoding("utf8");
    socket.write("220 private.fixture.example ESMTP private-session-id\r\n");
    let buffer = "";
    let state = "command";
    let username = "";
    let method = "";
    const authenticate = (password: string) => {
      forwarded.push(password === pass && username === user);
      const fails = method === "LOGIN" ? loginFails : plainFails;
      socket.write(fails
        ? "535 5.7.8 " + failureText + " private-session-id " + pass + " " + Buffer.from(pass).toString("base64") + "\r\n"
        : "235 2.7.0 Authentication successful\r\n");
      state = "command";
    };
    socket.on("data", (chunk) => {
      buffer += chunk;
      while (buffer.includes("\r\n")) {
        const end = buffer.indexOf("\r\n");
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        if (state === "data") {
          if (line === ".") {
            messages++;
            state = "command";
            socket.write("250 2.0.0 Message accepted private-message-id\r\n");
          }
        } else if (state === "user") {
          username = Buffer.from(line, "base64").toString("utf8");
          state = "password";
          socket.write("334 UGFzc3dvcmQ6\r\n");
        } else if (state === "password") {
          authenticate(Buffer.from(line, "base64").toString("utf8"));
        } else if (line.startsWith("EHLO")) {
          socket.write("250-private.fixture.example\r\n250-AUTH CRAM-MD5 PLAIN LOGIN XOAUTH2\r\n250 SIZE 100000\r\n");
        } else if (line === "AUTH LOGIN") {
          method = "LOGIN";
          attempts.push(method);
          state = "user";
          socket.write("334 VXNlcm5hbWU6\r\n");
        } else if (line.startsWith("AUTH PLAIN ")) {
          method = "PLAIN";
          attempts.push(method);
          const parts = Buffer.from(line.slice(11), "base64").toString("utf8").split("\0");
          username = parts[1];
          authenticate(parts[2]);
        } else if (line.startsWith("MAIL FROM")) {
          socket.write(rejectMail ? "550 5.7.1 sender restricted private@example.invalid\r\n" : "250 2.1.0 OK\r\n");
        } else if (line.startsWith("RCPT TO")) {
          socket.write("250 2.1.5 OK\r\n");
        } else if (line === "DATA") {
          state = "data";
          socket.write("354 Send message\r\n");
        } else if (line === "QUIT") {
          socket.end("221 Bye\r\n");
        }
      }
    });
  });
  server.on("tlsClientError", () => {});
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const env = {
    SMTP_HOST: "127.0.0.1", SMTP_PORT: String(address.port), SMTP_SECURE: "true",
    SMTP_USER: user, SMTP_PASS: pass, SMTP_FROM: user,
  };
  const smtp = getSmtpConfig(env)!;
  smtp.options.tls.servername = "localhost";
  const options = { ...smtp, options: {
    ...smtp.options,
    tls: { ...smtp.options.tls, ...(trust ? { ca: cert } : {}) },
  } };
  const events: Array<Record<string, unknown>> = [];
  try {
    const result = await runAuthDiagnostic({
      smtp: options, env, Connection, nodemailer, createEmailSender, safeSmtpError,
      emit: (event: Record<string, unknown>) => events.push(event),
    });
    const output = JSON.stringify(events);
    for (const secret of [pass, Buffer.from(pass).toString("base64"), user, "private-session-id", "private-message-id"])
      assert.ok(!output.includes(secret));
    return { result, events, attempts, forwarded, messages };
  } finally {
    sockets.forEach((socket) => socket.destroy());
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

test("real Nodemailer LOGIN preserves exact UTF-8 password, verifies TLS and sends once on same connection", async () => {
  const f = await fixture();
  assert.equal(f.result, true);
  assert.deepEqual(f.attempts, ["LOGIN"]);
  assert.deepEqual(f.forwarded, [true]);
  assert.equal(f.messages, 1);
  for (const status of ["TLS_OK", "CREDENTIAL_FORWARDING_OK", "SMTP_AUTH_OK", "SMTP_ACCEPTED"])
    assert.ok(f.events.some((event) => event.status === status));
});

test("one advertised PLAIN fallback after LOGIN 535, same password and one message", async () => {
  const f = await fixture({ loginFails: true });
  assert.equal(f.result, true);
  assert.deepEqual(f.attempts, ["LOGIN", "PLAIN"]);
  assert.deepEqual(f.forwarded, [true, true]);
  assert.equal(f.messages, 1);
  assert.ok(f.events.some((event) => event.status === "AUTH_METHOD_FOR_PRODUCTION" && event.method === "PLAIN"));
});

test("both mechanisms returning 535 stop after two attempts without sending", async () => {
  const f = await fixture({ loginFails: true, plainFails: true });
  assert.equal(f.result, false);
  assert.deepEqual(f.attempts, ["LOGIN", "PLAIN"]);
  assert.equal(f.messages, 0);
  assert.ok(!f.events.some((event) => event.status === "SMTP_AUTH_OK" || event.status === "SMTP_ACCEPTED"));
});

test("delivery rejection cannot produce success or trigger another AUTH attempt", async () => {
  const f = await fixture({ rejectMail: true });
  assert.equal(f.result, false);
  assert.deepEqual(f.attempts, ["LOGIN"]);
  assert.equal(f.messages, 0);
  assert.ok(!f.events.some((event) => event.status === "SMTP_ACCEPTED"));
});

test("untrusted TLS certificate prevents credential transmission", async () => {
  const f = await fixture({ trust: false });
  assert.equal(f.result, false);
  assert.deepEqual(f.attempts, []);
  assert.equal(f.messages, 0);
});

test("server rate limit stops after one failed login without trying another mechanism", async () => {
  const f = await fixture({ loginFails: true, failureText: "Too many login attempts" });
  assert.equal(f.result, false);
  assert.deepEqual(f.attempts, ["LOGIN"]);
  assert.equal(f.messages, 0);
});

test("full multiline reply structure survives but arbitrary text, identifiers and AUTH challenges never do", () => {
  const pass = "secret-material";
  const reply = safeReply("535-5.7.8 Error: authentication failed: Invalid user or password! " + pass +
    "\r\n535 5.7.8 https://private.invalid/token id-123 192.0.2.1 " + Buffer.from(pass).toString("base64"), [pass]);
  assert.equal(reply.length, 2);
  assert.match(reply[0], /^535-5\.7\.8 Authentication failed; Invalid user or password \[REDACTED\]$/);
  assert.equal(reply[1], "535 5.7.8 [REDACTED]");
  assert.deepEqual(safeReply("334 c2VjcmV0"), ["334 [AUTH_CHALLENGE_REDACTED]"]);
  const events: unknown[] = [];
  const logger = safeLogger((event: unknown) => events.push(event), [pass], {});
  logger.debug({ tnx: "client" }, "AUTH PLAIN " + pass);
  logger.error({ username: pass }, pass);
  logger.info({ username: pass }, pass);
  assert.deepEqual(events, []);
});

test("production configuration pins LOGIN for Yandex and allows explicit PLAIN, never OAuth guessing", () => {
  const env = { SMTP_HOST: "smtp.yandex.ru", SMTP_PORT: "465",
    SMTP_USER: "fixture@example.invalid", SMTP_PASS: "fixture-only" };
  assert.equal(getSmtpConfig(env)!.options.authMethod, "LOGIN");
  assert.equal(getSmtpConfig({ ...env, SMTP_AUTH_METHOD: "PLAIN" })!.options.authMethod, "PLAIN");
  assert.equal(getSmtpConfig({ ...env, SMTP_AUTH_METHOD: "XOAUTH2" }), null);
  assert.equal(getSmtpConfig(env)!.options.tls.rejectUnauthorized, true);
});
