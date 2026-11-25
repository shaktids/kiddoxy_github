// kid-kit.js — shared helpers for Kiddoxy games: sound, speech, celebration, result modal, best scores.
window.Kit = (function () {
  let ac = null;
  let muted = false;
  try { muted = localStorage.getItem('kiddoxy-muted') === '1'; } catch (_) {}

  function audio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ac) ac = new AC();
    if (ac.state === 'suspended') { try { ac.resume(); } catch (_) {} }
    return ac;
  }

  function beep(freq = 660, dur = 0.1, type = 'sine', vol = 0.2, delay = 0) {
    if (muted) return;
    const a = audio(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    const t = a.currentTime + delay;
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  const sfx = {
    tap: () => beep(720, 0.06, 'triangle', 0.15),
    good: () => { beep(660, 0.1); beep(880, 0.12, 'sine', 0.2, 0.09); },
    bad: () => beep(200, 0.16, 'sawtooth', 0.12),
    win: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.18, 'sine', 0.2, i * 0.12)),
  };

  function speak(text, rate = 0.9) {
    if (muted || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate; u.pitch = 1.15; u.lang = 'en-US';
      speechSynthesis.speak(u);
    } catch (_) {}
  }

  function celebrate() {
    if (window.Celebration) { try { window.Celebration.celebrate(); return; } catch (_) {} }
    if (window.gameCore) { try { window.gameCore.celebrate('confetti'); } catch (_) {} }
  }

  function best(key, value, higherIsBetter = true) {
    const k = 'kiddoxy-best-' + key;
    let cur = null;
    try { const v = localStorage.getItem(k); cur = v === null ? null : Number(v); } catch (_) {}
    if (value === undefined) return cur;
    const better = cur === null || (higherIsBetter ? value > cur : value < cur);
    if (better) { try { localStorage.setItem(k, String(value)); } catch (_) {} return { best: value, isNew: true }; }
    return { best: cur, isNew: false };
  }

  // Result modal. opts: {title, text, emoji, onAgain}
  function showResult(opts) {
    let m = document.getElementById('kit-modal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'kit-modal';
      m.className = 'kit-modal';
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-modal', 'true');
      m.innerHTML = '<div class="kit-dialog"><div class="kit-emoji"></div><h2></h2><p></p>' +
        '<div class="kit-row"><button class="kit-btn" data-again>Play again</button>' +
        '<a class="kit-btn kit-secondary" href="/index.html">Home</a></div></div>';
      document.body.appendChild(m);
    }
    m.querySelector('.kit-emoji').textContent = opts.emoji || '🎉';
    m.querySelector('h2').textContent = opts.title || 'Great job!';
    m.querySelector('p').textContent = opts.text || '';
    const btn = m.querySelector('[data-again]');
    btn.onclick = () => { m.classList.remove('open'); opts.onAgain && opts.onAgain(); };
    m.classList.add('open');
    btn.focus();
  }

  function toggleMute() {
    muted = !muted;
    try { localStorage.setItem('kiddoxy-muted', muted ? '1' : '0'); } catch (_) {}
    if (muted && 'speechSynthesis' in window) speechSynthesis.cancel();
    return muted;
  }

  // Wire a mute button if the page has one
  document.addEventListener('DOMContentLoaded', () => {
    const b = document.getElementById('muteBtn');
    if (!b) return;
    const paint = () => { b.textContent = muted ? '🔇' : '🔊'; b.setAttribute('aria-label', muted ? 'Sound off' : 'Sound on'); };
    paint();
    b.addEventListener('click', () => { toggleMute(); paint(); });
  });

  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

  return { beep, sfx, speak, celebrate, best, showResult, toggleMute, shuffle, pick, rand };
})();
