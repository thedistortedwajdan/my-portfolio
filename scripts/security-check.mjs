// Static security checks on the source and the production build. Run after `npm run build`.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const problems = [];
const fail = (message) => problems.push(message);

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

// 1. Source must not use APIs that inject raw HTML or evaluate strings.
const banned = [
  [/dangerouslySetInnerHTML/, 'dangerouslySetInnerHTML'],
  [/\.innerHTML\s*=/, 'innerHTML assignment'],
  [/\beval\s*\(/, 'eval()'],
  [/new Function\s*\(/, 'new Function()'],
  [/document\.write\s*\(/, 'document.write()'],
];
for (const file of walk('src').filter((f) => /\.(js|jsx)$/.test(f))) {
  const text = readFileSync(file, 'utf8');
  for (const [pattern, label] of banned) if (pattern.test(text)) fail(`${file}: uses ${label}`);
}

// 2. Build output.
if (!existsSync('dist/index.html')) {
  fail('dist/index.html is missing. Run `npm run build` first.');
} else {
  const html = readFileSync('dist/index.html', 'utf8');
  if (/<script(?![^>]*\bsrc=)[^>]*>/i.test(html)) fail('dist/index.html has an inline <script>, which the CSP blocks');
  if (/\son\w+\s*=/i.test(html)) fail('dist/index.html has an inline event handler');
  if (/(src|href)=["']http:\/\//i.test(html)) fail('dist/index.html loads a resource over http://');

  const assets = walk('dist').filter((f) => /\.(js|css)$/.test(f));
  for (const file of assets) {
    const text = readFileSync(file, 'utf8');
    const urls = text.match(/http:\/\/[^\s"'<>)]+/g) ?? [];
    // `http://${host}` is a template, and example.com is a placeholder inside PDF.js; neither is loaded.
    const insecure = urls.filter((u) => !/^http:\/\/(www\.w3\.org|localhost|example\.com|\$\{)/.test(u));
    if (insecure.length) fail(`${file}: insecure URL(s) ${[...new Set(insecure)].join(', ')}`);
  }
  if (walk('dist').some((f) => f.endsWith('.map'))) fail('dist contains source maps');
}

// 3. Security headers file for the host.
if (!existsSync('dist/_headers')) fail('dist/_headers is missing');
else {
  const headers = readFileSync('dist/_headers', 'utf8');
  for (const required of [
    'Content-Security-Policy',
    "frame-ancestors 'self'",
    "frame-src 'self'",
    'X-Content-Type-Options: nosniff',
    'Referrer-Policy',
    'Strict-Transport-Security',
  ]) {
    if (!headers.includes(required)) fail(`dist/_headers is missing ${required}`);
  }
  if (/unsafe-eval/.test(headers) || /script-src[^;]*unsafe-inline/.test(headers)) {
    fail("dist/_headers allows 'unsafe-eval' or inline scripts");
  }
}

// 4. No secrets committed by accident.
const secretPattern = /(api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']{8,}["']/i;
for (const file of walk('src')) {
  if (secretPattern.test(readFileSync(file, 'utf8'))) fail(`${file}: looks like a hard-coded secret`);
}

if (problems.length) {
  console.error('Security check failed:\n' + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
console.log('Security check passed: no unsafe APIs, no inline scripts, headers present, no secrets in src.');
