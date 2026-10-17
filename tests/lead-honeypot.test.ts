import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/lead/route";

test("legacy lead honeypot cannot report a fictitious successful send", async () => {
  const response = await POST(new NextRequest("http://localhost/api/lead", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ website: "bot" }),
  }));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { ok: false, error: "VALIDATION_ERROR" });
});
