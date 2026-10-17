import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readConsent,
  writeConsent,
  CONSENT_STORAGE_KEY,
  CONSENT_POLICY_VERSION,
} from "../lib/consent-storage";

test("cookie choice: persistence failure does not break interaction; invalid storage is ignored", () => {
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const oldStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  let stored: string | null = null;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {},
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () => stored,
      setItem: () => {
        throw new Error("blocked");
      },
    },
  });
  try {
    const choice = writeConsent({ essential: true, analytics: false });
    assert.equal(choice.analytics, false);
    assert.equal(choice.version, CONSENT_POLICY_VERSION);
    for (const invalid of [
      "null",
      "[]",
      "{",
      JSON.stringify({
        essential: true,
        analytics: true,
        version: "old",
        timestamp: "bad",
      }),
    ]) {
      stored = invalid;
      assert.equal(readConsent(), null);
    }
    stored = JSON.stringify(choice);
    assert.deepEqual(readConsent(), choice);
    assert.equal(CONSENT_STORAGE_KEY, "gol_consent_v1");
  } finally {
    if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
    else Reflect.deleteProperty(globalThis, "window");
    if (oldStorage)
      Object.defineProperty(globalThis, "localStorage", oldStorage);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
