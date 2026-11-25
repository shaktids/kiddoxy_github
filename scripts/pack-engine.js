// pack-engine.js — runs any game defined in data/packs.js.
// Page sets window.PACK_ID; the engine renders one of 6 game types:
//   quiz     – prompt + 4 choices          sort  – tap the right bin for each item
//   sequence – tap items in the right order match – flip cards to find pairs
//   spell    – tap letters to build a word  pop   – pop the bubbles that follow a rule
(function () {
  const pack = window.PACKS && window.PACKS[window.PACK_ID];
  const root = document.getElementById('game');
  const roundEl = document.getElementById('round'), scoreEl = document.getElementById('score');
  if (!pack) { root.innerHTML = '<p class="prompt">Game not found.</p>'; return; }
  const ROUNDS = pack.rounds || 10;
  let round = 0, score = 0, missed = false, busy = false, recent = [];

  const setHud = () => { roundEl.textContent = Math.min(round, ROUNDS) + '/' + ROUNDS; scoreEl.textContent = score; };
  const cheer = () => Kit.pick(['Great job! 🎉', 'Yes! ⭐', 'Super! 🌟', 'You got it! 👍', 'Awesome! 🚀']);
  const feedback = (t) => { const f = root.querySelector('.fb'); if (f) f.textContent = t; };

  // Avoid repeating the same question twice in a short span
  function fresh(make) {
    for (let i = 0; i < 12; i++) {
      const q = make(); const k = JSON.stringify(q.key || q.prompt || q.answer || q.word || q.items);
      if (!recent.includes(k)) { recent.push(k); if (recent.length > 6) recent.shift(); return q; }
    }
    return make();
  }

  function finish(extra) {
    const total = pack.type === 'pop' ? score : ROUNDS;
    const r = Kit.best('pack-' + pack.id, score);
    const ratio = pack.type === 'pop' ? Math.min(1, score / 15) : score / ROUNDS;
    const stars = ratio >= 0.9 ? '⭐⭐⭐' : ratio >= 0.6 ? '⭐⭐' : '⭐';
    Kit.sfx.win(); if (ratio >= 0.6) Kit.celebrate();
    Kit.showResult({
      emoji: stars, title: ratio >= 0.6 ? 'Well done!' : 'Good try!',
      text: (extra || (pack.type === 'pop' ? `You scored ${score}.` : `You got ${score} of ${total} right first try.`)) + (r.isNew ? ' New best!' : ''),
      onAgain: start,
    });
  }

  function nextRound() {
    busy = false; missed = false;
    round++; setHud();
    if (round > ROUNDS) return finish();
    TYPES[pack.type].round();
  }
  function correct(el, after = 900) {
    busy = true;
    if (!missed) score++;
    setHud(); el && el.classList.add('ok', 'pop'); feedback(cheer()); Kit.sfx.good();
    setTimeout(nextRound, after);
  }
  function wrong(el, hint) {
    missed = true; if (el) { el.classList.add('no', 'shake'); setTimeout(() => el.classList.remove('shake'), 300); }
    feedback(hint || 'Try again!'); Kit.sfx.bad();
  }
  const btn = (html, cls, on) => { const b = document.createElement('button'); b.className = cls; b.innerHTML = html; b.onclick = () => on(b); return b; };

  const TYPES = {
    quiz: {
      round() {
        const q = fresh(() => pack.question(Kit));
        root.innerHTML = `<div class="q-prompt ${q.small ? 'small' : ''}">${q.prompt}</div>${q.sub ? `<p class="q-sub">${q.sub}</p>` : ''}<div class="opts"></div><div class="fb" aria-live="polite"></div>`;
        if (q.say) Kit.speak(q.say);
        const opts = root.querySelector('.opts');
        const options = [...new Set([q.answer, ...q.options].map(String))].slice(0, 4);
        if (options.length < 2) return nextRound();
        Kit.shuffle(options).forEach(o => opts.appendChild(btn(o, 'opt' + (o.length > 8 ? ' wide' : ''), b => {
          if (busy || b.classList.contains('no')) return;
          if (o === String(q.answer)) correct(b); else wrong(b, q.hint);
        })));
      },
    },

    sort: {
      round() {
        const [item, bin] = fresh(() => { const it = Kit.pick(pack.items); return Object.assign([...it], { key: it[0] }); });
        root.innerHTML = `<p class="q-sub">${pack.prompt}</p><div class="q-prompt">${item}</div><div class="bins"></div><div class="fb" aria-live="polite"></div>`;
        if (pack.sayItem) Kit.speak(String(item));
        const bins = root.querySelector('.bins');
        pack.bins.forEach((label, i) => bins.appendChild(btn(label, 'bin', b => {
          if (busy) return;
          if (i === bin) correct(b); else wrong(b, pack.hint || 'Not that one — try the other box!');
        })));
      },
    },

    sequence: {
      round() {
        const q = fresh(() => pack.question(Kit));
        const order = q.items;
        let pos = 0;
        root.innerHTML = `<p class="q-sub">${q.prompt}</p><div class="strip">${order.map(() => '<span class="slot"></span>').join('')}</div><div class="opts seq"></div><div class="fb" aria-live="polite"></div>`;
        const slots = root.querySelectorAll('.slot'), opts = root.querySelector('.opts');
        Kit.shuffle(order.map((v, i) => [v, i])).forEach(([v, i]) => opts.appendChild(btn(v, 'opt', b => {
          if (busy || b.disabled) return;
          if (String(order[pos]) === String(v)) {
            slots[pos].innerHTML = v; slots[pos].classList.add('filled', 'pop'); b.disabled = true; b.classList.add('used');
            pos++; Kit.beep(500 + pos * 70, 0.08, 'triangle', 0.15);
            if (pos === order.length) correct(null, 1100);
          } else wrong(b, q.hint || 'Hmm, what comes next?');
        })));
      },
    },

    match: {
      round() {
        const pairs = Kit.shuffle(pack.pairs.slice()).slice(0, pack.size || 6);
        const deck = Kit.shuffle(pairs.flatMap((p, i) => [{ v: p[0], id: i }, { v: p[1], id: i }]));
        root.innerHTML = `<p class="q-sub">${pack.prompt || 'Find the matching pairs!'}</p><div class="cards"></div><div class="fb" aria-live="polite"></div>`;
        const cards = root.querySelector('.cards');
        cards.style.gridTemplateColumns = `repeat(${deck.length <= 8 ? 4 : window.innerWidth < 480 ? 3 : 4}, 1fr)`;
        let open = [], found = 0, lock = false, flips = 0;
        deck.forEach(c => {
          const b = btn(`<span class="back">?</span><span class="front">${c.v}</span>`, 'mcard', () => {
            if (lock || b.classList.contains('up') || b.classList.contains('ok')) return;
            b.classList.add('up'); Kit.sfx.tap(); open.push([b, c]);
            if (open.length < 2) return;
            flips++;
            const [[b1, c1], [b2, c2]] = open; open = [];
            if (c1.id === c2.id) {
              setTimeout(() => { b1.classList.add('ok', 'pop'); b2.classList.add('ok', 'pop'); }, 200);
              Kit.sfx.good(); found++;
              if (found === pairs.length) { busy = true; score = Math.max(0, Math.round(10 - (flips - pairs.length) * 0.7)); setTimeout(() => finish(`All pairs in ${flips} turns!`), 700); }
            } else { lock = true; setTimeout(() => { b1.classList.remove('up'); b2.classList.remove('up'); lock = false; }, 850); }
          });
          cards.appendChild(b);
        });
      },
    },

    spell: {
      round() {
        const [pic, word] = fresh(() => { const w = Kit.pick(pack.words); return Object.assign([...w], { key: w[1] }); });
        const letters = word.toUpperCase().split('');
        const extra = 'ABCDEFGHIJKLMNOPRSTUVWY'.split('').filter(l => !letters.includes(l));
        const tiles = Kit.shuffle(letters.concat(Kit.shuffle(extra).slice(0, letters.length <= 3 ? 2 : 3)));
        let pos = 0;
        root.innerHTML = `<div class="q-prompt">${pic}</div><button class="btn secondary hear">🔈 Hear it</button><div class="strip">${letters.map(() => '<span class="slot"></span>').join('')}</div><div class="opts letters"></div><div class="fb" aria-live="polite"></div>`;
        const say = () => Kit.speak(pack.sayOnly ? word : `${word}. ${letters.join(', ')}`);
        root.querySelector('.hear').onclick = say; say();
        const slots = root.querySelectorAll('.slot'), opts = root.querySelector('.opts');
        tiles.forEach(l => opts.appendChild(btn(l, 'opt', b => {
          if (busy || b.disabled) return;
          if (letters[pos] === l) {
            slots[pos].textContent = l; slots[pos].classList.add('filled', 'pop'); b.disabled = true; b.classList.add('used');
            pos++; Kit.beep(520 + pos * 60, 0.08, 'triangle', 0.15);
            if (pos === letters.length) { Kit.speak(word); correct(null, 1200); }
          } else wrong(b, `Look for the letter ${letters[pos]}`);
        })));
      },
    },

    pop: {
      start() {
        let time = pack.time || 30, alive = true, spawnT = 0, last = performance.now();
        root.innerHTML = `<p class="q-sub"><b>${pack.prompt}</b> — <span class="tleft">${time}</span>s</p><div class="sky"></div><div class="fb" aria-live="polite"></div>`;
        if (pack.say) Kit.speak(pack.say);
        const sky = root.querySelector('.sky'), tEl = root.querySelector('.tleft');
        const COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a78bfa', '#f472b6'];
        const bubbles = [];
        const tick = setInterval(() => { time--; tEl.textContent = time; if (time <= 0) stop(); }, 1000);
        function stop() { alive = false; clearInterval(tick); bubbles.forEach(b => b.el.remove()); finish(); }
        function spawn() {
          const good = Math.random() < 0.5;
          const v = good ? pack.good(Kit) : pack.bad(Kit);
          const el = document.createElement('button'); el.className = 'bubble';
          el.innerHTML = v; el.style.background = pack.colorful === false ? '#e0f2fe' : Kit.pick(COLORS);
          const b = { el, good, y: sky.clientHeight + 40, x: 8 + Math.random() * 78, v: 50 + Math.random() * 40 + (30 - time) * 2 };
          el.style.left = b.x + '%';
          el.onclick = () => {
            if (!alive) return;
            if (b.good) { score++; Kit.beep(800, 0.07, 'triangle', 0.15); feedback('+1 ' + cheer()); }
            else { score = Math.max(0, score - 1); Kit.sfx.bad(); feedback(pack.hint || 'Oops — not that one!'); }
            setHud(); el.classList.add('burst'); b.dead = true; setTimeout(() => el.remove(), 200);
          };
          sky.appendChild(el); bubbles.push(b);
        }
        (function loop(t) {
          if (!alive) return;
          const dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
          spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = 0.75; }
          for (const b of bubbles) { if (b.dead) continue; b.y -= b.v * dt; b.el.style.transform = `translateY(${b.y}px)`; if (b.y < -90) { b.dead = true; b.el.remove(); } }
          requestAnimationFrame(loop);
        })(last);
      },
    },
  };

  function start() {
    round = 0; score = 0; recent = [];
    if (pack.type === 'pop' || pack.type === 'match') {
      roundEl.parentElement.hidden = true; setHud();
      TYPES[pack.type][pack.type === 'pop' ? 'start' : 'round']();
    } else nextRound();
  }
  start();
})();
