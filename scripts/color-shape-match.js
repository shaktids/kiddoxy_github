// Play sound for correct/wrong answer
function playCSMSound(type) {
  const ctx = window.AudioContext ? new AudioContext() : (window.webkitAudioContext ? new webkitAudioContext() : null);
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  if (type === 'correct') {
    o.type = 'triangle';
    o.frequency.value = 480;
    g.gain.value = 0.16;
    o.start();
    o.stop(ctx.currentTime + 0.13);
  } else if (type === 'wrong') {
    o.type = 'sawtooth';
    o.frequency.value = 180;
    g.gain.value = 0.13;
    o.start();
    o.stop(ctx.currentTime + 0.18);
  }
}
// Color & Shape Match Game
function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function withRotation(ctx, deg, drawFn) {
  ctx.save();
  ctx.translate(40, 40);
  ctx.rotate(toRadians(deg));
  ctx.translate(-40, -40);
  drawFn();
  ctx.restore();
}

function regularPolygonPath(ctx, sides, radius, rotationDeg) {
  const step = (Math.PI * 2) / sides;
  const start = toRadians(rotationDeg - 90);
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = start + i * step;
    const x = 40 + Math.cos(a) * radius;
    const y = 40 + Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function starPath(ctx, points, outerR, innerR, rotationDeg) {
  const total = points * 2;
  const step = Math.PI / points;
  const start = toRadians(rotationDeg - 90);
  ctx.beginPath();
  for (let i = 0; i < total; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = start + i * step;
    const x = 40 + Math.cos(a) * r;
    const y = 40 + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function flowerPath(ctx, petals, depth) {
  const samples = 160;
  const baseR = 22;
  const amp = 14 * depth;
  ctx.beginPath();
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * Math.PI * 2;
    const r = baseR + amp + amp * Math.sin(petals * t);
    const x = 40 + Math.cos(t) * r;
    const y = 40 + Math.sin(t) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function roundedRectPath(ctx, x, y, w, h, r) {
  const rr = Math.max(2, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

function heartPath(ctx, size) {
  const s = size;
  ctx.beginPath();
  ctx.moveTo(40, 40 + s * 0.82);
  ctx.bezierCurveTo(40 - s * 1.25, 40 + s * 0.2, 40 - s * 0.95, 40 - s * 0.75, 40, 40 - s * 0.15);
  ctx.bezierCurveTo(40 + s * 0.95, 40 - s * 0.75, 40 + s * 1.25, 40 + s * 0.2, 40, 40 + s * 0.82);
  ctx.closePath();
}

function buildShapes() {
  const shapes = [];
  let id = 0;

  const pushShape = (name, draw) => {
    id += 1;
    shapes.push({ id: 'shape_' + id, name, draw });
  };

  // Regular polygons: 60 variants
  const polygonRotations = [0, 8, 16, 24, 32];
  for (let sides = 3; sides <= 14; sides++) {
    polygonRotations.forEach((rot) => {
      pushShape('Poly ' + sides, (ctx, color) => {
        ctx.fillStyle = color;
        regularPolygonPath(ctx, sides, 30, rot);
        ctx.fill();
      });
    });
  }

  // Stars: 108 variants
  const innerRatios = [0.32, 0.42, 0.52, 0.62];
  const starRotations = [0, 10, 20];
  for (let points = 4; points <= 12; points++) {
    innerRatios.forEach((ratio) => {
      starRotations.forEach((rot) => {
        pushShape('Star ' + points, (ctx, color) => {
          ctx.fillStyle = color;
          starPath(ctx, points, 31, 31 * ratio, rot);
          ctx.fill();
        });
      });
    });
  }

  // Flowers: 32 variants
  const petalDepths = [0.16, 0.24, 0.32, 0.4];
  for (let petals = 4; petals <= 11; petals++) {
    petalDepths.forEach((depth) => {
      pushShape('Flower ' + petals, (ctx, color) => {
        ctx.fillStyle = color;
        flowerPath(ctx, petals, depth);
        ctx.fill();
      });
    });
  }

  // Rounded squares: 20 variants
  const cornerRadii = [8, 14, 20, 26, 32];
  const squareRotations = [0, 12, 24, 36];
  cornerRadii.forEach((radius) => {
    squareRotations.forEach((rot) => {
      pushShape('Rounded', (ctx, color) => {
        ctx.fillStyle = color;
        withRotation(ctx, rot, () => {
          roundedRectPath(ctx, 12, 12, 56, 56, radius);
          ctx.fill();
        });
      });
    });
  });

  // Hearts: 10 variants
  const heartSizes = [20, 22, 24, 26, 28];
  const heartRotations = [-12, -6, 0, 6, 12];
  for (let i = 0; i < heartSizes.length; i++) {
    const size = heartSizes[i];
    const rot = heartRotations[i];
    pushShape('Heart', (ctx, color) => {
      ctx.fillStyle = color;
      withRotation(ctx, rot, () => {
        heartPath(ctx, size);
        ctx.fill();
      });
    });
    pushShape('Heart', (ctx, color) => {
      ctx.fillStyle = color;
      withRotation(ctx, -rot, () => {
        heartPath(ctx, Math.max(18, size - 2));
        ctx.fill();
      });
    });
  }

  // Circle keeps one classic simple shape
  pushShape('Circle', (ctx, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(40, 40, 30, 0, 2 * Math.PI);
    ctx.fill();
  });

  return shapes;
}

const SHAPES = buildShapes();
const COLORS = [
  { name: 'Red', value: '#f87171' },
  { name: 'Yellow', value: '#facc15' },
  { name: 'Green', value: '#22d3ee' },
  { name: 'Blue', value: '#2563eb' }
];

const csmTarget = document.getElementById('csmTarget');
const csmShapes = document.getElementById('csmShapes');
const csmScore = document.getElementById('csmScore');
const csmRestart = document.getElementById('csmRestart');
const csmHint = document.getElementById('csmHint');
const csmAnnounce = document.getElementById('csmAnnounce');

let score = 0;
let target = null;
let options = [];

function announce(message) {
  if (!csmAnnounce) return;
  csmAnnounce.textContent = '';
  setTimeout(() => {
    csmAnnounce.textContent = message;
  }, 10);
}

function randomShapeColor() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { shape, color };
}

function drawShapeCanvas(shape, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 80; canvas.height = 80;
  shape.draw(canvas.getContext('2d'), color.value);
  return canvas;
}

function setTargetAndOptions() {
  // Pick a random target
  target = randomShapeColor();
  csmTarget.innerHTML = '';
  csmTarget.appendChild(drawShapeCanvas(target.shape, target.color));
  // Generate options (1 correct, 3 random)
  options = [target];
  while (options.length < 4) {
    const opt = randomShapeColor();
    if (!options.some(o => o.shape === opt.shape && o.color === opt.color)) {
      options.push(opt);
    }
  }
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  renderOptions();
}

function renderOptions() {
  csmShapes.innerHTML = '';
  options.forEach((opt, idx) => {
    const div = document.createElement('div');
    div.className = 'csm-shape';
    div.appendChild(drawShapeCanvas(opt.shape, opt.color));
    div.addEventListener('click', () => handleShapeClick(opt, div));
    csmShapes.appendChild(div);
  });
}

function handleShapeClick(opt, div) {
  if (opt.shape === target.shape && opt.color === target.color) {
    playCSMSound('correct');
    score++;
    csmScore.textContent = score;
    div.classList.add('correct');
    announce('Great job! Correct match. Score ' + score + '.');
    setTimeout(() => { setTargetAndOptions(); }, 400);
  } else {
    playCSMSound('wrong');
    div.classList.add('wrong');
    announce('Try again. Match the same color and shape.');
    setTimeout(() => { div.classList.remove('wrong'); }, 240);
  }
}

function restartGame() {
  score = 0;
  csmScore.textContent = score;
  setTargetAndOptions();
  announce('Game reset. Find the matching color and shape.');
}

csmRestart.addEventListener('click', restartGame);

if (csmHint) {
  csmHint.addEventListener('click', () => {
    const firstCorrect = Array.from(csmShapes.children).find((node, idx) => {
      const opt = options[idx];
      return opt && opt.shape === target.shape && opt.color === target.color;
    });
    if (!firstCorrect) return;
    firstCorrect.animate(
      [
        { transform: 'scale(1)', boxShadow: '0 8px 14px rgba(15,53,113,0.13)' },
        { transform: 'scale(1.08)', boxShadow: '0 0 0 6px rgba(37,99,235,0.35)' },
        { transform: 'scale(1)', boxShadow: '0 8px 14px rgba(15,53,113,0.13)' }
      ],
      { duration: 720, easing: 'ease-in-out' }
    );
    announce('Hint: look for the exact same color and shape as the target.');
  });
}

window.addEventListener('DOMContentLoaded', restartGame);
