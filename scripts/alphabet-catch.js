// Alphabet Catch Game Logic
const board = document.getElementById('catchBoard');
const targetLetterEl = document.getElementById('targetLetter');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const announcer = document.getElementById('gameAnnounce');

const BALLOON_COUNT = 8;
const GAME_TIME = 30;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let targetLetter = 'A';
let score = 0;
let timeLeft = GAME_TIME;
let timer = null;
let gameActive = false;
let balloons = [];
let balloonSize = 64;

function announce(message) {
  if (!announcer) return;
  announcer.textContent = '';
  setTimeout(() => {
    announcer.textContent = message;
  }, 10);
}

function getBalloonSize() {
  const width = board.offsetWidth;
  if (width <= 360) return 48;
  if (width <= 480) return 52;
  if (width <= 700) return 58;
  return 64;
}

function updateBalloonSize() {
  balloonSize = getBalloonSize();
}

function randomLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

function randomPos() {
  const w = Math.max(10, board.offsetWidth - balloonSize);
  const h = Math.max(10, board.offsetHeight - balloonSize);
  return {
    x: Math.random() * w,
    y: Math.random() * h
  };
}

function playSound(type) {
  // Web Audio API for pop and error
  const ctx = window.AudioContext ? new AudioContext() : (window.webkitAudioContext ? new webkitAudioContext() : null);
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  if (type === 'pop') {
    o.type = 'triangle';
    o.frequency.value = 420;
    g.gain.value = 0.18;
    o.start();
    o.stop(ctx.currentTime + 0.09);
  } else if (type === 'error') {
    o.type = 'sawtooth';
    o.frequency.value = 160;
    g.gain.value = 0.13;
    o.start();
    o.stop(ctx.currentTime + 0.18);
  }
}

function setTargetLetter() {
  targetLetter = randomLetter();
  targetLetterEl.textContent = targetLetter;
}

function spawnBalloons() {
  updateBalloonSize();
  // Remove old
  board.innerHTML = '';
  balloons = [];
  // Ensure at least one correct
  const correctIdx = Math.floor(Math.random() * BALLOON_COUNT);
  for (let i = 0; i < BALLOON_COUNT; i++) {
    let letter = i === correctIdx ? targetLetter : randomLetter();
    // Avoid duplicate corrects
    if (i !== correctIdx && letter === targetLetter) letter = randomLetter();
    const pos = randomPos();
    const el = document.createElement('div');
    el.className = 'balloon';
    el.textContent = letter;
    el.style.width = balloonSize + 'px';
    el.style.height = balloonSize + 'px';
    el.style.fontSize = Math.round(balloonSize * 0.5) + 'px';
    el.style.left = pos.x + 'px';
    el.style.top = pos.y + 'px';
    el.addEventListener('click', () => handleBalloonClick(letter, el));
    board.appendChild(el);
    balloons.push(el);
  }
}

function handleBalloonClick(letter, el) {
  if (!gameActive) return;
  if (letter === targetLetter) {
    playSound('pop');
    score++;
    scoreEl.textContent = score;
    announce('Great! You caught letter ' + targetLetter + '. Score ' + score + '.');
    el.classList.add('is-correct');
    setTimeout(() => {
      setTargetLetter();
      spawnBalloons();
    }, 250);
  } else {
    playSound('error');
    announce('Try again. Find letter ' + targetLetter + '.');
    el.classList.add('is-wrong');
    setTimeout(() => {
      el.classList.remove('is-wrong');
    }, 350);
  }
}

function startGame() {
  score = 0;
  timeLeft = GAME_TIME;
  scoreEl.textContent = score;
  timerEl.textContent = timeLeft;
  setTargetLetter();
  spawnBalloons();
  gameActive = true;
  startBtn.disabled = true;
  announce('Game started. Catch letter ' + targetLetter + '.');
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameActive = false;
  clearInterval(timer);
  timer = null;
  startBtn.disabled = false;
  announce('Time is up. Your score is ' + score + '.');
  // Optionally show a message
  setTimeout(() => {
    alert('Time\'s up! Your score: ' + score);
  }, 100);
}

function resetGame() {
  gameActive = false;
  clearInterval(timer);
  timer = null;
  score = 0;
  timeLeft = GAME_TIME;
  scoreEl.textContent = score;
  timerEl.textContent = timeLeft;
  board.innerHTML = '';
  startBtn.disabled = false;
  targetLetterEl.textContent = '-';
  announce('Game reset. Press Start to play.');
}

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

window.addEventListener('resize', () => {
  if (gameActive) spawnBalloons();
});

resetGame();
