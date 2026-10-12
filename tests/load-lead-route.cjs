const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// Test-only loader: the real route runs with an in-memory mail handler.
function loadLeadRoute(sendEmail) {
  const filename = path.resolve(__dirname, '../app/api/lead/route.ts');
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const route = new Module(filename, module);
  route.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = route.require.bind(route);
  route.require = name => name === '@/lib/email-service'
    ? { sendEmail }
    : originalRequire(name);
  route._compile(source, filename);
  return route.exports;
}

module.exports = { loadLeadRoute };
