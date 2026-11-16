const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const ROUTE_PATH = path.join(__dirname, '..', 'app', 'api', 'ai-analysis', 'route.ts');
const FIXTURE = { insights: [], overallAIReadiness: 'fixture', topPriorities: [] };

function loadRoute() {
  const source = fs.readFileSync(ROUTE_PATH, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: 'route.ts',
  });

  const calls = [];
  const moduleObj = { exports: {} };
  const context = {
    require(id) {
      if (id === 'next/server') {
        return { NextResponse: { json: (body, { status = 200 } = {}) => ({ status, body }) } };
      }
      if (id === 'openai') {
        return { __esModule: true, default: class OpenAIStub { constructor() {} } };
      }
      throw new Error('Unexpected require: ' + id);
    },
    module: moduleObj,
    exports: moduleObj.exports,
    process: { env: { OPENAI_API_KEY: 'dummy-openai', GROQ_API_KEY: 'dummy-groq' } },
    console: { error() {}, log() {} },
    fetch: async (url, options) => {
      calls.push({ url, body: JSON.parse(options.body) });
      return {
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(FIXTURE) } }],
        }),
      };
    },
  };

  vm.runInNewContext(outputText, context, { filename: 'route.ts' });
  assert.equal(typeof moduleObj.exports.POST, 'function');
  return { POST: moduleObj.exports.POST, calls };
}

function request(payload) {
  return { json: async () => payload };
}

function userPrompt(call) {
  return call.body.messages[1].content;
}

test('unique HTML marker appears in captured user prompt', async () => {
  const { POST, calls } = loadRoute();
  const marker = 'UNIQUE_HTML_MARKER_7c2e';
  const res = await POST(
    request({
      url: 'https://example.test',
      htmlContent: `<html><body>${marker}</body></html>`,
      currentChecks: [{ id: 'readability', label: 'Readability', score: 70 }],
    })
  );
  assert.equal(res.status, 200);
  assert.equal(calls.length, 1);
  assert.ok(userPrompt(calls[0]).includes(marker));
});

test('different HTML content produces different prompts', async () => {
  const { POST, calls } = loadRoute();
  const base = { url: 'https://example.test', currentChecks: [] };
  await POST(request({ ...base, htmlContent: '<html>alpha</html>' }));
  await POST(request({ ...base, htmlContent: '<html>beta</html>' }));
  assert.equal(calls.length, 2);
  assert.notEqual(userPrompt(calls[0]), userPrompt(calls[1]));
});

test('HTML beyond first 10000 chars is excluded', async () => {
  const { POST, calls } = loadRoute();
  await POST(
    request({
      url: 'https://example.test',
      htmlContent: 'A'.repeat(10000) + 'TAIL_MARKER_EXCLUDED',
      currentChecks: [],
    })
  );
  const prompt = userPrompt(calls[0]);
  assert.ok(prompt.includes('A'.repeat(10000)));
  assert.ok(!prompt.includes('TAIL_MARKER_EXCLUDED'));
});

test('URL and check score remain in prompt', async () => {
  const { POST, calls } = loadRoute();
  await POST(
    request({
      url: 'https://example.test',
      htmlContent: '<html></html>',
      currentChecks: [{ id: 'readability', label: 'Readability', score: 70 }],
    })
  );
  const prompt = userPrompt(calls[0]);
  assert.ok(prompt.includes('https://example.test'));
  assert.ok(prompt.includes('Readability: 70'));
});

test('missing htmlContent returns 400 and does not call fetch', async () => {
  const { POST, calls } = loadRoute();
  const res = await POST(request({ url: 'https://example.test', currentChecks: [] }));
  assert.equal(res.status, 400);
  assert.equal(calls.length, 0);
});
