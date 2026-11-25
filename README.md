# kiddoxy

Kiddoxy — starter scaffold for web-first kids games (PWA) with ad placeholders and Android packaging guidance.

What I added
- `index.html` — home / games grid + parental gate + ad banner placeholder
- `styles.css` — UI tokens and responsive layout for large touch targets
- `game-shell.js` — small runtime for parental gate and ad hook placeholders
- `game/newGame.html` — your existing demo game (alphabet matching)
- `game/missing-letter.html` — missing-letter word game
- `manifest.json` & `service-worker.js` — PWA metadata and offline caching
- `privacy.html` — starter privacy & safety page

Quick local test
1. Open `index.html` in your browser (or serve using a simple static server).
   - Recommended: run a local static server to allow the service worker and PWA features.
  - Example (PowerShell): `python -m http.server 8080` then open `http://localhost:8080/`.

Build & package for Android (high level)
- Option A — TWA (Trusted Web Activity) via Bubblewrap: good for minimal native code.
  1. Install Java JDK & Android Studio + Android SDK.
  2. Install Bubblewrap CLI: `npm install -g @bubblewrap/cli`.
  3. `bubblewrap init` and `bubblewrap build`, then open the generated project in Android Studio and build an AAB.

- Option B — Capacitor (recommended if you need native plugins like AdMob):
  1. `npm init -y` and build your web assets to a `www/` or `dist/` folder.
  2. `npm install @capacitor/core @capacitor/cli` and `npx cap init com.yourdomain.kiddoxy Kiddoxy`.
  3. `npx cap add android`, `npx cap copy android`, and `npx cap open android` to finish in Android Studio.

Ad & compliance notes (summary)
- Use non-personalized ads for children (AdMob supports this via request flags).
- Add parental gate for purchases or rewarded ads.
- Prepare a detailed privacy policy and make correct Play Console Families declarations.

Next steps (recommended)
1. Add more games under `game/` (each game as a standalone HTML/JS); keep the shell hooks clean.
2. Integrate analytics (Firebase) and AdMob SDK or web ad tags in the placeholder containers.
3. Implement a robust parental gate and age flow before enabling monetized ads.

Contact
- For scaffold changes or questions, edit files in this repo or open an issue.

## Deploy to Cloudflare Pages

The site is 100% static (HTML/CSS/JS + JSON), so it runs on Cloudflare Pages with no code changes.

**Git-connected (recommended)** — Cloudflare dashboard → Workers & Pages → Create → Pages → connect the repo:
- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `dist`

**Direct upload from your PC**
```
npm run build
npx wrangler pages deploy dist --project-name kiddoxy
```

`npm run build` (`scripts/build-pages.mjs`) copies only the public site into `dist/` — it deliberately
leaves out `kids/` (OAuth secrets/tokens), `node_modules/`, `.idea/`, Python and Docker files, and writes a
`_headers` file (security headers, no-cache for `service-worker.js` and `data/`).
Run `npm run check` to verify every game listed in `data/games.json` has its icon.

## Adding a game
1. Create `game/<id>.html` (new games use `/styles/kid-kit.css` + `/scripts/kid-kit.js` for sounds, speech, results modal and best scores).
2. Add an entry to `data/games.json` with `"category"` set to one of the home-page categories and an icon under `assets/games/<id>/`.

## Pack games (115 games from one engine)
Most games are defined as data in `data/packs.js` and run by `scripts/pack-engine.js`.
There are 6 game types: `quiz`, `sort`, `sequence`, `match`, `spell`, `pop`.

To add a game, add an entry in `data/packs.js` (copy a similar one), then run:
```
npm run packs
```
This writes `game/<id>.html`, an icon in `assets/games/<id>/icon.svg` and the `data/games.json` entry.
`npm run build` runs it automatically before building `dist/` for Cloudflare.
