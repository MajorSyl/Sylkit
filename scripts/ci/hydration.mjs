// Finds the cause of React hydration warnings: serves a development build (full error messages)
// and records what each page logs. Usage: node scripts/ci/hydration.mjs dist-dev
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.argv[2] || 'dist-dev');
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  const tries = [p, p + '.html', path.join(p, 'index.html')];
  for (const t of tries) { const f = path.join(root, t); if (f.startsWith(root) && fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'application/octet-stream' }); return fs.createReadStream(f).pipe(res); } }
  res.writeHead(404); res.end('{}');
}).listen(8811);
const b = await chromium.launch();
const out = [];
for (const u of ['/', '/terms', '/account', '/product/punto-de-venta']) {
  const p = await (await b.newContext({ locale: 'en-US' })).newPage();
  const logs = [];
  p.on('console', (m) => { if (/hydrat|did not match|server rendered|418/i.test(m.text())) logs.push(m.text().slice(0, 3000)); });
  p.on('pageerror', (e) => logs.push('pageerror: ' + e.message.slice(0, 3000)));
  await p.goto('http://localhost:8811' + u, { waitUntil: 'networkidle' }).catch(() => null);
  await p.waitForTimeout(1500);
  out.push({ page: u, logs });
}
fs.mkdirSync('.ci/e2e', { recursive: true });
fs.writeFileSync('.ci/e2e/hydration.json', JSON.stringify(out, null, 1));
await b.close(); srv.close();
