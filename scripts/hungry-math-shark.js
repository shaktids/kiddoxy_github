// Wrong answer sound
function playWrongSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = 180;
    g.gain.value = 0.18;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    o.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.18);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.22);
    o.stop(ctx.currentTime + 0.22);
    o.onended = () => ctx.close();
  } catch(e) {}
}

// Hungry Math Shark Game Logic (Drag-and-Drop Version)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');

let GAME_WIDTH = canvas.width;
let GAME_HEIGHT = canvas.height;

function resizeCanvas() {
  const parent = canvas.parentElement;
  if (!parent) return;
  const rect = parent.getBoundingClientRect();
  const w = Math.max(320, Math.floor(rect.width));
  const h = Math.max(360, Math.floor(rect.height));
  GAME_WIDTH = w;
  GAME_HEIGHT = h;
  canvas.width = w;
  canvas.height = h;
  shark.x = GAME_WIDTH / 2;
  shark.y = GAME_HEIGHT - Math.max(58, Math.round(GAME_HEIGHT * 0.1));
  if (!draggingBubble) spawnBubbles();
}

// Shark
const shark = {
  x: GAME_WIDTH / 2,
  y: GAME_HEIGHT - 60,
  w: 64,
  h: 40
};

// Bubbles
let bubbles = [];
let currentQ = null;

let score = 0;
let timeLeft = 60;
let gameOver = false;

let draggingBubble = null;
let dragOffset = {x:0, y:0};

// Feedback
let feedbackText = '';
let feedbackTimer = null;

// Sound
function playYummySound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = 420;
    g.gain.value = 0.18;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    o.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.18);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.22);
    o.stop(ctx.currentTime + 0.22);
    o.onended = () => ctx.close();
  } catch(e) {}
}

function randomInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function generateQuestion() {
  // Addition, subtraction, multiplication, division
  const ops = ['+', '-', '×', '÷'];
  const op = ops[randomInt(0, ops.length - 1)];
  let a, b, ans;
  if (op === '+') { a = randomInt(1, 20); b = randomInt(1, 20); ans = a + b; }
  else if (op === '-') { a = randomInt(5, 30); b = randomInt(1, a); ans = a - b; }
  else if (op === '×') { a = randomInt(2, 10); b = randomInt(2, 10); ans = a * b; }
  else { b = randomInt(2, 10); ans = randomInt(2, 10); a = b * ans; }
  return { text: `${a} ${op} ${b}`, answer: ans };
}

function spawnBubbles() {
  currentQ = generateQuestion();
  const correctIdx = randomInt(0, 2);
  bubbles = [];
  const y = Math.round(GAME_HEIGHT * 0.54);
  const spacing = GAME_WIDTH / 4;
  const bubbleR = Math.max(28, Math.min(42, Math.round(Math.min(GAME_WIDTH, GAME_HEIGHT) * 0.075)));
  for (let i = 0; i < 3; i++) {
    let val = currentQ.answer;
    if (i !== correctIdx) {
      do { val = currentQ.answer + randomInt(-10, 10); } while (val === currentQ.answer || bubbles.some(b => b.value === val));
    }
    bubbles.push({
      x: Math.round(spacing * (i + 1)),
      y: y,
      r: bubbleR,
      value: val,
      correct: i === correctIdx
    });
  }
}

function drawShark() {
  ctx.save();
  ctx.font = '48px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🦈', shark.x, shark.y);
  ctx.restore();
  // Draw mouth highlight for drop target
  if (draggingBubble) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(shark.x, shark.y + 10, Math.max(18, Math.round(Math.min(GAME_WIDTH, GAME_HEIGHT) * 0.04)), 0, Math.PI, false);
    ctx.lineWidth = 4;
    ctx.strokeStyle = draggingBubble.correct ? '#43a047' : '#e53935';
    ctx.stroke();
    ctx.restore();
  }
}

function drawBubbles() {
  bubbles.forEach(b => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.correct ? '#b2ff59' : '#ffffff';
    ctx.globalAlpha = 0.92;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#0288d1';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#0b3a63';
    ctx.font = 'bold ' + Math.max(18, Math.round(b.r * 0.8)) + 'px system-ui,Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.value, b.x, b.y);
    ctx.restore();
  });
}

function drawQuestion() {
  ctx.save();
  ctx.font = 'bold ' + Math.max(20, Math.round(Math.min(GAME_WIDTH, GAME_HEIGHT) * 0.045)) + 'px system-ui,Arial';
  ctx.fillStyle = '#0288d1';
  ctx.textAlign = 'center';
  ctx.fillText(currentQ.text, GAME_WIDTH / 2, Math.max(48, Math.round(GAME_HEIGHT * 0.09)));
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  drawQuestion();
  drawBubbles();
  drawShark();
  // Draw feedback
  if (feedbackText) {
    ctx.save();
    ctx.font = 'bold ' + Math.max(24, Math.round(Math.min(GAME_WIDTH, GAME_HEIGHT) * 0.06)) + 'px system-ui,Arial';
    let color = '#43a047';
    if (feedbackText === 'Oops! Wrong!') color = '#e53935';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.92;
    ctx.fillText(feedbackText, GAME_WIDTH/2, shark.y - Math.max(24, Math.round(GAME_HEIGHT * 0.05)));
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

function update() {
  // No auto-movement or collision; handled by drag events
}

function gameLoop() {
  update();
  draw();
  if (!gameOver) requestAnimationFrame(gameLoop);
}

function startGame() {
  score = 0;
  timeLeft = 60;
  gameOver = false;
  shark.x = GAME_WIDTH / 2;
  scoreEl.textContent = 'Score: 0';
  timerEl.textContent = 'Time: 60';
  spawnBubbles();
  draw();
  requestAnimationFrame(gameLoop);
  timerTick();
}

function timerTick() {
  if (gameOver) return;
  timeLeft--;
  timerEl.textContent = 'Time: ' + timeLeft;
  if (timeLeft <= 0) {
    gameOver = true;
    setTimeout(() => {
      alert('Time\'s up! Your score: ' + score + '\nReload to play again.');
    }, 100);
    return;
  }
  setTimeout(timerTick, 1000);
}


function pointFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

// Drag-and-drop logic (pointer events for mouse + touch)
canvas.addEventListener('pointerdown', e => {
  if (gameOver) return;
  const p = pointFromEvent(e);
  const mx = p.x;
  const my = p.y;
  for (let b of bubbles) {
    if (Math.hypot(mx - b.x, my - b.y) < b.r) {
      draggingBubble = b;
      dragOffset.x = mx - b.x;
      dragOffset.y = my - b.y;
      if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
      break;
    }
  }
}, { passive: false });

canvas.addEventListener('pointermove', e => {
  if (!draggingBubble) return;
  const p = pointFromEvent(e);
  const mx = p.x;
  const my = p.y;
  draggingBubble.x = mx - dragOffset.x;
  draggingBubble.y = my - dragOffset.y;
}, { passive: true });

canvas.addEventListener('pointerup', e => {
  if (!draggingBubble) return;
  // Check if dropped in shark's mouth
  const dx = draggingBubble.x - shark.x;
  const dy = draggingBubble.y - (shark.y + 10);
  const mouthRadius = Math.max(28, Math.round(Math.min(GAME_WIDTH, GAME_HEIGHT) * 0.065));
  if (Math.hypot(dx, dy) < mouthRadius) {
    if (draggingBubble.correct) {
      score++;
      scoreEl.textContent = 'Score: ' + score;
      feedbackText = (Math.random() < 0.5 ? 'Yummy!' : 'Tasty!');
      playYummySound();
      if (feedbackTimer) clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(() => { feedbackText = ''; }, 900);
      spawnBubbles();
    } else {
      score = Math.max(0, score - 1);
      scoreEl.textContent = 'Score: ' + score;
      feedbackText = 'Oops! Wrong!';
      playWrongSound();
      if (feedbackTimer) clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(() => { feedbackText = ''; }, 900);
      spawnBubbles();
    }
  } else {
    spawnBubbles();
  }
  draggingBubble = null;
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

startGame();
