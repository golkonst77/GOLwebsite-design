const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

test('analytics starts only with consent and retained callbacks stop on withdrawal', () => {
  const filename = path.resolve(__dirname, '../components/consent/consent-shell.tsx');
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  let consent = null;
  const ref = { current: false };
  const component = new Module(filename, module);
  component.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = component.require.bind(component);
  component.require = name => {
    if (name === 'react') return { ...originalRequire(name), useRef: () => ref };
    if (name === '@vercel/analytics/next') return { Analytics: () => null };
    if (name === './consent-provider') return { ConsentProvider: () => null, useConsent: () => ({ consent }) };
    if (name === './consent-banner') return { ConsentBanner: () => null };
    return originalRequire(name);
  };
  // Expose the private component only inside this test's compiled module.
  component._compile(source + '\nmodule.exports.renderAnalytics = ConsentAnalytics;', filename);
  const previousEnvironment = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    assert.equal(component.exports.renderAnalytics(), null);
    consent = { analytics: false };
    assert.equal(component.exports.renderAnalytics(), null);
    consent = { analytics: true };
    const callback = component.exports.renderAnalytics().props.beforeSend;
    const event = { type: 'pageview', url: '/privacy' };
    assert.equal(callback(event), event);
    consent = { analytics: false };
    assert.equal(component.exports.renderAnalytics(), null);
    assert.equal(callback(event), null);
    consent = { analytics: true };
    assert.equal(component.exports.renderAnalytics().props.beforeSend(event), event);
  } finally {
    if (previousEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousEnvironment;
  }
});
