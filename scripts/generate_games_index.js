const fs = require('fs');
const path = require('path');
const gamesPath = path.join(__dirname, '..', 'data', 'games.json');
function loadGames(){ try{ const raw = fs.readFileSync(gamesPath,'utf8'); return JSON.parse(raw); }catch(e){ console.error('Failed to load games.json',e); process.exit(1);} }
function validateAssets(games){ const missing = []; games.forEach(g=>{ (g.assets||[]).forEach(a=>{ const p = path.join(__dirname,'..',a.replace(/\//g,path.sep)); if (!fs.existsSync(p)){ missing.push({game:g.id, asset:a}); } }); }); return missing; }
function main(){ const games = loadGames(); console.log('Loaded',games.length,'games'); const missing = validateAssets(games); if (missing.length){ console.log('Missing assets:'); missing.forEach(m=>console.log(' -',m.game,m.asset)); console.log('\nGenerator dry-run: FAIL (missing assets)'); process.exitCode=2; } else { console.log('All assets present. Dry-run PASS.'); } }
main();

