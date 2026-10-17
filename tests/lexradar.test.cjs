const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const { NextRequest } = require("next/server");

function load(file, overrides = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext(source, {
    exports,
    require: (name) => overrides[name] || require(name),
    process,
    Buffer,
    URL,
    Map,
    Date,
    JSON,
    Number,
    Uint8Array,
    Boolean,
  });
  return exports;
}
const { lexradarSchema } = load("lib/lexradar-validation.ts");
const valid = {
  site: "https://example.ru",
  name: "Тест",
  email: "test@example.ru",
  consent: true,
};
let sendCount = 0;
let mailSuccess = false;
const { POST } = load("app/api/lexradar/route.ts", {
  "@/lib/lexradar-validation": { lexradarSchema },
  "@/lib/email-service": {
    sendEmail: async () => {
      sendCount++;
      return { success: mailSuccess };
    },
  },
});
let ip = 0;
function request(body, headers = {}) {
  return new NextRequest("http://localhost:3000/api/lexradar", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      "content-type": "application/json",
      "x-forwarded-for": `192.0.2.${++ip}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}
test("email required; phone and comment optional; consent must be explicit", () => {
  assert.equal(lexradarSchema.safeParse(valid).success, true);
  for (const patch of [
    { email: "" },
    { consent: false },
    { site: "javascript:alert(1)" },
    { site: "https://user:pass@example.ru" },
    { name: " " },
    { phone: "abc" },
    { comment: "a".repeat(2001) },
  ])
    assert.equal(
      lexradarSchema.safeParse({ ...valid, ...patch }).success,
      false,
    );
});
test("rejects cross-origin, invalid JSON, oversized body and honeypot without sending", async () => {
  assert.equal(
    (await POST(request(valid, { origin: "https://evil.example" }))).status,
    403,
  );
  assert.equal((await POST(request({ ...valid, company: "bot" }))).status, 400);
  assert.equal(
    (await POST(request({ ...valid, comment: "a".repeat(17000) }))).status,
    413,
  );
  assert.equal(
    (
      await POST(
        new NextRequest("http://localhost:3000/api/lexradar", {
          method: "POST",
          headers: {
            origin: "http://localhost:3000",
            "content-type": "application/json",
          },
          body: "{",
        }),
      )
    ).status,
    400,
  );
  assert.equal(sendCount, 0);
});
test("disabled configuration returns 503; transport failure cannot report success", async () => {
  const previous = {
    enabled: process.env.LEXRADAR_FORM_ENABLED,
    email: process.env.YANDEX_EMAIL,
    password: process.env.YANDEX_PASSWORD,
  };
  try {
    process.env.LEXRADAR_FORM_ENABLED = "false";
    assert.equal((await POST(request(valid))).status, 503);
    process.env.LEXRADAR_FORM_ENABLED = "true";
    process.env.YANDEX_EMAIL = "unit-test@example.ru";
    process.env.YANDEX_PASSWORD = "mock-only";
    assert.equal((await POST(request(valid))).status, 502);
    mailSuccess = true;
    const response = await POST(request(valid));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).ok, true);
  } finally {
    for (const [key, value] of Object.entries({
      LEXRADAR_FORM_ENABLED: previous.enabled,
      YANDEX_EMAIL: previous.email,
      YANDEX_PASSWORD: previous.password,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
test("rate limit counts failed attempts", async () => {
  const headers = { "x-forwarded-for": "198.51.100.1" };
  for (let index = 0; index < 5; index++)
    assert.equal((await POST(request({}, headers))).status, 400);
  assert.equal((await POST(request({}, headers))).status, 429);
});


test("page renders one H1, all local anchors, and a disabled honest form", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const Form = load("components/lexradar-form.tsx").default;
  const Page = load("app/lexradar/page.tsx", {
    "@/components/lexradar-form": { __esModule: true, default: Form },
    "./lexradar.css": {},
  }).default;
  const oldFlag = process.env.LEXRADAR_FORM_ENABLED;
  try {
    process.env.LEXRADAR_FORM_ENABLED = "false";
    const html = renderToStaticMarkup(React.createElement(Page));
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
    for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(match[1]), match[1]);
    for (const field of ["site", "name", "email", "consent"]) assert.match(html, new RegExp('name="' + field + '"[^>]*required|(?=[^>]*required)[^>]*name="' + field + '"'));
    assert.match(html, /Онлайн-приём заявок пока не подтверждён/);
    assert.match(html, /<button[^>]*disabled/);
    assert.doesNotMatch(html, /700 000|3 000 000/);
  } finally {
    if (oldFlag === undefined) delete process.env.LEXRADAR_FORM_ENABLED;
    else process.env.LEXRADAR_FORM_ENABLED = oldFlag;
  }
});
