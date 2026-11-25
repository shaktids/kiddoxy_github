// quiz-race.js — shared engine for "answer to go faster" race games (Math Race, Letter Race).
// Page provides: window.QUIZ_RACE = { key, question(level) -> {text, say, answer, options[]}, levels:[names] }
(function () {
  const cfg = window.QUIZ_RACE;
  const RACERS = [
    { name: 'You', icon: '🏎️', you: true },
    { name: 'Turtle', icon: '🐢', speed: 0.55 },
    { name: 'Bunny', icon: '🐰', speed: 0.8 },
    { name: 'Cheetah', icon: '🐆', speed: 1.0 },
  ];
  const track = document.getElementById('track'), qEl = document.getElementById('question'), optsEl = document.getElementById('options');
  const posEl = document.getElementById('place'), fbEl = document.getElementById('feedback');
  let level = 0, racers = [], running = false, last = 0, current = null, finished = [], streak = 0, boost = 0, lockUntil = 0, startT = 0;

  function build() {
    track.innerHTML = '';
    racers = RACERS.map((r, i) => {
      const lane = document.createElement('div'); lane.className = 'lane' + (r.you ? ' you' : '');
      lane.innerHTML = `<span class="lane-name">${r.name}</span><span class="finish">🏁</span><span class="racer">${r.icon}</span>`;
      track.appendChild(lane);
      return { ...r, el: lane.querySelector('.racer'), p: 0, done: false };
    });
  }

  function ask() {
    current = cfg.question(level);
    qEl.textContent = current.text;
    if (current.say) Kit.speak(current.say);
    optsEl.innerHTML = '';
    Kit.shuffle(current.options.slice()).forEach(o => {
      const b = document.createElement('button'); b.className = 'qopt'; b.textContent = o;
      b.onclick = () => answer(b, o);
      optsEl.appendChild(b);
    });
  }

  function answer(btn, o) {
    if (!running || performance.now() < lockUntil) return;
    if (String(o) === String(current.answer)) {
      streak++;
      boost = Math.min(0.3, boost + Math.min(0.14, 0.075 + streak * 0.012)); // a burst of speed, bigger with a streak
      fbEl.textContent = streak >= 3 ? `🔥 ${streak} in a row — turbo!` : Kit.pick(['Zoom! 💨', 'Vroom! 🏎️', 'Great! ⭐']);
      btn.classList.add('right'); Kit.sfx.good();
      setTimeout(ask, 250);
    } else {
      streak = 0; lockUntil = performance.now() + 900; // short pit stop on a wrong answer
      btn.classList.add('wrong', 'shake'); Kit.sfx.bad();
      fbEl.textContent = `Pit stop! The answer was ${current.answer}.`;
      [...optsEl.children].forEach(b => { if (String(b.textContent) === String(current.answer)) b.classList.add('right'); });
      setTimeout(ask, 900);
    }
  }

  function loop(t) {
    if (!running) return;
    const dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
    const elapsed = (t - startT) / 1000;
    racers.forEach(r => {
      if (r.done) return;
      if (r.you) {
        const add = Math.min(boost, dt * 0.5); boost -= add; r.p += add + dt * 0.004;
      } else {
        // bots: steady pace, scaled by level, with a little wobble
        const base = [0.022, 0.03, 0.038][level] * r.speed;
        r.p += dt * base * (0.85 + 0.3 * Math.sin(elapsed * r.speed * 2 + r.speed * 10));
      }
      if (r.p >= 1) { r.p = 1; r.done = true; finished.push(r); if (r.you) end(); }
      r.el.style.left = `calc(${r.p * 100}% - ${r.p * 44}px)`;
    });
    const ranked = racers.slice().sort((a, b) => b.p - a.p);
    const place = finished.includes(racers[0]) ? finished.indexOf(racers[0]) + 1 : ranked.indexOf(racers[0]) + 1;
    posEl.textContent = ['1st 🥇', '2nd 🥈', '3rd 🥉', '4th'][place - 1];
    if (running) requestAnimationFrame(loop);
  }

  function start() {
    build(); finished = []; streak = 0; boost = 0; lockUntil = 0; fbEl.textContent = '';
    document.getElementById('startPanel').hidden = true;
    document.getElementById('racePanel').hidden = false;
    let n = 3; qEl.textContent = n; optsEl.innerHTML = '';
    const count = setInterval(() => {
      n--; Kit.beep(n ? 440 : 880, 0.15, 'square', 0.1);
      if (n > 0) { qEl.textContent = n; return; }
      clearInterval(count); qEl.textContent = 'GO!';
      running = true; last = startT = performance.now(); requestAnimationFrame(loop);
      setTimeout(ask, 300);
    }, 700);
    Kit.beep(440, 0.15, 'square', 0.1);
  }

  function end() {
    running = false;
    const place = finished.indexOf(racers[0]) + 1;
    const medal = ['🥇', '🥈', '🥉', '🏅'][place - 1];
    const r = Kit.best(cfg.key + '-' + level, 5 - place);
    if (place === 1) { Kit.sfx.win(); Kit.celebrate(); } else Kit.sfx.good();
    Kit.showResult({
      emoji: medal, title: place === 1 ? 'You won the race!' : `You finished ${['1st', '2nd', '3rd', '4th'][place - 1]}!`,
      text: place === 1 ? 'Super fast answers!' + (r.isNew ? ' New best!' : '') : 'Answer faster to beat the animals!',
      onAgain: start,
    });
  }

  document.getElementById('levelSeg').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    document.querySelectorAll('#levelSeg button').forEach(x => x.classList.toggle('active', x === b));
    level = Number(b.dataset.level);
  });
  document.getElementById('go').onclick = start;
  build();
})();
