const { test } = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');
const { loadLeadRoute } = require('./load-lead-route.cjs');

const valid = { name: 'QA', contact: '+7 (999) 123-45-67', consent: true };
function setup(success = true) {
  const messages = [];
  const route = loadLeadRoute(async message => {
    messages.push(message);
    return { success };
  });
  const post = async (body, raw = false) => {
    const response = await route.POST(new NextRequest('http://localhost/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': 'qa-test' },
      body: raw ? body : JSON.stringify(body),
    }));
    return { status: response.status, body: await response.json() };
  };
  return { messages, post };
}

test('malformed JSON and non-object bodies are 400 without mail', async () => {
  const { post, messages } = setup();
  for (const body of ['{', 'null', '[]', '"text"']) {
    assert.deepEqual(await post(body, true), { status: 400, body: { ok: false, error: 'BAD_REQUEST' } });
  }
  assert.equal(messages.length, 0);
});

test('consent must be the boolean true', async () => {
  const { post, messages } = setup();
  for (const consent of [false, undefined, 'true', 1]) {
    assert.equal((await post({ ...valid, consent })).body.error, 'CONSENT_REQUIRED');
  }
  assert.equal(messages.length, 0);
});

test('invalid phone is rejected; 8 and ten-digit forms normalize', async () => {
  const { post, messages } = setup();
  for (const contact of ['', '123', '+1 999 123 45 67', '+7 999 123 45 678']) {
    assert.equal((await post({ ...valid, contact })).body.error, 'INVALID_PHONE');
  }
  for (const contact of ['8 (999) 123-45-67', '9991234567']) {
    assert.equal((await post({ ...valid, contact })).status, 200);
  }
  assert.equal(messages.length, 2);
  assert(messages.every(m => m.text.includes('+7 (999) 123-45-67')));
});

test('blank and overlong names or messages are rejected', async () => {
  const { post, messages } = setup();
  for (const payload of [{ name: '   ' }, { name: 'x'.repeat(101) }, { message: 'x'.repeat(2001) }, { message: null }, { message: {} }, { contact: 'x'.repeat(151) + valid.contact }]) {
    assert.equal((await post({ ...valid, ...payload })).body.error, 'VALIDATION_ERROR');
  }
  assert.equal(messages.length, 0);
});

test('optional task uses the existing empty-message fallback', async () => {
  const { post, messages } = setup();
  for (const message of [undefined, '', '   ']) {
    assert.deepEqual(await post({ ...valid, message }), { status: 200, body: { ok: true } });
  }
  assert.equal(messages.length, 3);
  assert(messages.every(m => m.html.includes('Клиент не оставил описание задачи')));
});

test('user-provided email HTML is escaped', async () => {
  const { post, messages } = setup();
  await post({ ...valid, name: '<QA>', message: '<script>alert("QA")</script>\nnext' });
  assert(messages[0].html.includes('&lt;QA&gt;'));
  assert(messages[0].html.includes('&lt;script&gt;alert(&quot;QA&quot;)&lt;/script&gt;<br>next'));
  assert(!messages[0].html.includes('<script>'));
});

test('honeypot reports success without sending mail', async () => {
  const { post, messages } = setup();
  assert.deepEqual(await post({ website: 'bot' }), { status: 200, body: { ok: true } });
  assert.equal(messages.length, 0);
});

test('failed mail returns 500 and does not consume successful-submission quota', async () => {
  const { post, messages } = setup(false);
  for (let i = 0; i < 4; i++) {
    assert.deepEqual(await post(valid), { status: 500, body: { ok: false, error: 'SEND_FAILED' } });
  }
  assert.equal(messages.length, 4);
});

test('fourth successful submission is rate limited', async () => {
  const { post, messages } = setup();
  for (let i = 0; i < 3; i++) assert.equal((await post(valid)).status, 200);
  assert.equal((await post(valid)).status, 429);
  assert.equal(messages.length, 3);
});
