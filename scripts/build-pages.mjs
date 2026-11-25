// build-pages.mjs — copies ONLY the public website files into dist/ for Cloudflare Pages.
// Allow-list on purpose: kids/ (OAuth secrets, tokens, video scripts), node_modules/, .idea/, Python files
// and Docker files must never be published.
import { cpSync, rmSync, mkdirSync, existsSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');

const DIRS = ['game', 'assets', 'data', 'scripts', 'styles'];
const ROOT_FILES = ['game-shell.js', 'service-worker.js', 'manifest.json', 'styles.css', 'kiddoxy.png', 'favicon.ico', '_headers', '_redirects'];
const SKIP_IN_SCRIPTS = new Set(['build-pages.mjs', 'generate_games_index.js', 'generate-packs.mjs']);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const d of DIRS) {
  const src = join(root, d);
  if (!existsSync(src)) continue;
  cpSync(src, join(out, d), {
    recursive: true,
    filter: (p) => !p.endsWith('.DS_Store') && !(d === 'scripts' && SKIP_IN_SCRIPTS.has(p.split(/[\\/]/).pop())),
  });
}
for (const f of readdirSync(root)) if (f.endsWith('.html')) cpSync(join(root, f), join(out, f));
for (const f of ROOT_FILES) if (existsSync(join(root, f))) cpSync(join(root, f), join(out, f));

// Default headers if the repo does not ship its own _headers file
if (!existsSync(join(root, '_headers'))) {
  writeFileSync(join(out, '_headers'), [
    '/*',
    '  X-Content-Type-Options: nosniff',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
    '',
    '/service-worker.js',
    '  Cache-Control: no-cache',
    '',
    '/data/*',
    '  Cache-Control: no-cache',
    '',
    '/assets/*',
    '  Cache-Control: public, max-age=604800',
    '',
  ].join('\n'));
}
console.log('Built Cloudflare Pages output in dist/');
