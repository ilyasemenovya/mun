import { LunarRun } from './game-core.mjs';

const $ = selector => document.querySelector(selector);
const canvas = $('#canvas');
const context = canvas.getContext('2d');
const stage = $('#stage');
const overlay = $('#overlay');
const play = $('#play');
const pause = $('#pause');
const jump = $('#jump');
const scoreLabel = $('#score');
const bestLabel = $('#best');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const STORAGE_KEY = 'mun_lunar_waiter_best_v2';
const HEIGHT = 480;
const GROUND = 377;
const run = new LunarRun();
let assets = null;
let loading = true;
let loadFailed = false;
let storageAvailable = true;
let best = 0;
let size = { width: 960, height: 480, scale: 1, top: 0, dpr: 1 };
let previousTime = 0;
let displayedScore = -1;
let lastCleared = 0;
let clearAt = -10;

try {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (Number.isSafeInteger(stored?.score) && stored.score >= 0 && stored.score <= 1000000) best = stored.score;
  localStorage.setItem('mun_storage_probe', '1');
  localStorage.removeItem('mun_storage_probe');
} catch {
  storageAvailable = false;
  $('#storage-note').hidden = false;
}
bestLabel.textContent = best.toLocaleString('ru-RU');

function imageAt(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timeout = setTimeout(() => { image.onload = null; image.onerror = null; reject(new Error('Image timeout')); }, 15000);
    image.onload = () => { clearTimeout(timeout); resolve(image); };
    image.onerror = () => { clearTimeout(timeout); reject(new Error('Image unavailable')); };
    image.src = url;
  });
}

async function loadAssets() {
  loading = true;
  loadFailed = false;
  play.disabled = true;
  play.textContent = 'Загружаем Луну…';
  try {
    if (!context) throw new Error('Canvas unavailable');
    const frameRequest = new AbortController();
    const frameTimeout = setTimeout(() => frameRequest.abort(), 15000);
    const framesPromise = fetch('assets/game/waiter-frames.json', { signal: frameRequest.signal }).then(response => {
      if (!response.ok) throw new Error('Frames unavailable');
      return response.json();
    }).finally(() => clearTimeout(frameTimeout));
    const [waiter, moon, frames, helmet] = await Promise.all([
      imageAt('assets/game/waiter.png'),
      imageAt('assets/game/moon.png'),
      framesPromise,
      imageAt('assets/game/helmet.png')
    ]);
    if (!Array.isArray(frames) || frames.length !== 4) throw new Error('Invalid frames');
    if (frames.some(frame => ![frame.x, frame.y, frame.width, frame.height, frame.pivotX].every(Number.isFinite) || frame.x < 0 || frame.y < 0 || frame.width <= 0 || frame.height <= 0 || frame.pivotX < 0 || frame.pivotX > frame.width || frame.x + frame.width > waiter.width || frame.y + frame.height > waiter.height)) throw new Error('Invalid sprite bounds');
    assets = { waiter, moon, frames, helmet };
    $('#overlay-kicker').textContent = 'На низком старте';
    $('#overlay-title').textContent = 'Луна ждёт.';
    $('#overlay-description').textContent = 'Официант с пивом на Луне. Перепрыгивайте столы и стулья, чтобы набрать больше очков.';
    play.textContent = 'Начать пробежку';
  } catch {
    loadFailed = true;
    $('#overlay-kicker').textContent = 'Нужна ещё попытка';
    $('#overlay-title').textContent = 'Луна не загрузилась.';
    $('#overlay-description').textContent = 'Проверьте подключение к интернету и повторите загрузку.';
    play.textContent = 'Повторить загрузку';
  } finally {
    loading = false;
    play.disabled = false;
    render();
  }
}

function resize() {
  if (run.status === 'running') pauseRun();
  const bounds = stage.getBoundingClientRect();
  const width = Math.max(1, bounds.width);
  const height = Math.max(1, bounds.height);
  const oldX = run.playerX;
  run.width = Math.max(560, width / height * HEIGHT);
  run.playerX = Math.min(125, run.width * 0.19);
  for (const obstacle of run.obstacles) obstacle.x += run.playerX - oldX;
  const scale = Math.min(width / run.width, height / HEIGHT);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  size = { width, height, scale, top: (height - HEIGHT * scale) / 2, dpr };
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  render();
}

function drawBackground() {
  const { moon } = assets;
  const scale = Math.max(run.width / moon.width, HEIGHT / moon.height);
  const sourceWidth = run.width / scale;
  const sourceHeight = HEIGHT / scale;
  context.drawImage(moon, (moon.width - sourceWidth) * 0.45, 0, sourceWidth, sourceHeight, 0, 0, run.width, HEIGHT);
  const tileWidth = 770;
  const scroll = reducedMotion ? 0 : run.distance % tileWidth;
  for (let x = -scroll; x < run.width; x += tileWidth) {
    context.drawImage(moon, 0, moon.height * 0.83, moon.width, moon.height * 0.17, x, GROUND, tileWidth, HEIGHT - GROUND);
  }
  context.fillStyle = '#d9d0bf';
  context.fillRect(0, GROUND, run.width, 3);
}

function drawFurniture(obstacle) {
  const x = Math.round(obstacle.x);
  const y = GROUND - obstacle.height;
  const width = obstacle.width;
  context.fillStyle = 'rgba(12,26,45,.24)';
  context.beginPath();
  context.ellipse(x + width / 2, GROUND + 5, width / 2 + 8, 6, 0, 0, Math.PI * 2);
  context.fill();
  // Every solid shape stays inside the same bounds used by the physics.
  if (obstacle.type === 'table') {
    context.fillStyle = '#5b3025';
    context.fillRect(x + 9, y + 10, 9, obstacle.height - 10);
    context.fillRect(x + width - 18, y + 10, 9, obstacle.height - 10);
    context.fillRect(x + 14, GROUND - 17, width - 28, 6);
    context.fillStyle = '#c97543';
    context.fillRect(x + 9, y + 10, 3, obstacle.height - 10);
    context.fillRect(x + width - 18, y + 10, 3, obstacle.height - 10);
    context.fillStyle = '#bd693b';
    context.fillRect(x, y, width, 10);
    context.fillStyle = '#f3c988';
    context.fillRect(x, y, width, 3);
    context.fillStyle = '#84412c';
    context.fillRect(x + 3, y + 10, width - 6, 5);
  } else {
    context.fillStyle = '#684435';
    context.fillRect(x + 3, y, 8, obstacle.height);
    context.fillRect(x + width - 11, y + 38, 8, obstacle.height - 38);
    context.fillStyle = '#bd7750';
    context.fillRect(x + 3, y, 3, obstacle.height);
    context.fillRect(x + width - 11, y + 38, 3, obstacle.height - 38);
    context.fillStyle = '#c14025';
    context.fillRect(x, y, width - 6, 12);
    context.fillRect(x + 8, y + 12, 5, 21);
    context.fillRect(x + width - 19, y + 12, 5, 21);
    context.fillRect(x, y + 33, width, 9);
    context.fillStyle = '#f0b078';
    context.fillRect(x, y, width - 6, 3);
    context.fillRect(x, y + 33, width, 3);
    context.fillStyle = '#8e3529';
    context.fillRect(x + 5, GROUND - 16, width - 11, 5);
  }
}

function drawWaiter() {
  const airborne = run.elevation > 1;
  const frameIndex = run.status === 'running' && !airborne ? Math.floor(run.time * 10) % 4 : 1;
  const source = assets.frames[frameIndex];
  const height = 124;
  const width = source.width / source.height * height;
  const foot = GROUND - run.elevation + (run.status === 'over' ? 13 : 0);
  if (run.status !== 'over') {
    context.fillStyle = `rgba(15,30,48,${Math.max(0.06, 0.22 - run.elevation / 1000)})`;
    context.beginPath(); context.ellipse(run.playerX, GROUND + 11, 28 - run.elevation * 0.04, 5, 0, 0, Math.PI * 2); context.fill();
  }
  if (!reducedMotion && run.status === 'running' && !airborne) {
    context.fillStyle = '#dcd5c8';
    for (let i = 0; i < 4; i++) {
      const phase = (run.time * 4 + i / 4) % 1;
      context.globalAlpha = (1 - phase) * 0.65;
      context.fillRect(run.playerX - 25 - phase * 38, GROUND - 4 - phase * 11, 4 - phase * 2, 4 - phase * 2);
    }
    context.globalAlpha = 1;
  }
  context.save();
  context.translate(run.playerX, foot - height / 2);
  if (airborne) context.rotate(-0.06);
  if (run.status === 'over') context.rotate(0.22);
  const bodyOffset = source.pivotX / source.height * height;
  context.drawImage(assets.waiter, source.x, source.y, source.width, source.height, -bodyOffset, -height / 2, width, height);
  // Keep the original waiter intact; the transparent visor reveals his face.
  context.drawImage(assets.helmet, 120, 106, 1027, 1051, -20, -height / 2 - 3, 42, 43);
  context.restore();
  if (!reducedMotion && run.time - clearAt < 0.65 && run.status === 'running') {
    const progress = (run.time - clearAt) / 0.65;
    context.globalAlpha = 1 - progress;
    context.fillStyle = '#fff3d2';
    context.font = '600 22px Manrope, sans-serif';
    context.fillText('+25', run.playerX + 40, GROUND - 110 - progress * 35);
    context.globalAlpha = 1;
  }
}

function render() {
  if (!context) return;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = '#101f33'; context.fillRect(0, 0, canvas.width, canvas.height);
  context.setTransform(size.dpr * size.scale, 0, 0, size.dpr * size.scale, 0, size.top * size.dpr);
  context.imageSmoothingEnabled = false;
  if (!assets) return;
  drawBackground();
  run.obstacles.forEach(drawFurniture);
  drawWaiter();
}

function announce(text) { $('#announcement').textContent = text; }

function setPlaying(playing) {
  overlay.hidden = playing;
  pause.disabled = !playing;
  jump.disabled = !playing;
  stage.classList.toggle('is-running', playing);
}

function startRun() {
  if (loading) return;
  if (loadFailed) { loadAssets(); return; }
  if (run.status === 'paused') {
    run.resume();
  } else {
    const seed = window.crypto?.getRandomValues ? crypto.getRandomValues(new Uint32Array(1))[0] : Date.now();
    run.reset(seed);
    run.start();
    displayedScore = -1;
    lastCleared = 0;
    clearAt = -10;
  }
  previousTime = performance.now();
  setPlaying(true);
  canvas.focus({ preventScroll: true });
  announce('Пробежка началась. Нажмите пробел, стрелку вверх или кнопку «Прыжок».');
}

function pauseRun() {
  if (run.status !== 'running') return;
  run.pause();
  setPlaying(false);
  $('#overlay-kicker').textContent = 'Можно выдохнуть';
  $('#overlay-title').textContent = 'Пауза.';
  $('#overlay-description').textContent = 'Официант подождёт. Продолжим с того же места.';
  $('#run-result').hidden = true;
  play.textContent = 'Продолжить';
  announce(`Пауза. ${run.score} очков.`);
}

function finishRun() {
  const isBest = run.score > best;
  if (isBest) {
    best = run.score;
    bestLabel.textContent = best.toLocaleString('ru-RU');
    if (storageAvailable) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ score: best, recordedAt: Date.now() })); }
      catch { storageAvailable = false; $('#storage-note').hidden = false; }
    }
  }
  setPlaying(false);
  $('#overlay-kicker').textContent = isBest ? 'Новый личный рекорд' : 'Это была хорошая пробежка';
  $('#overlay-title').textContent = 'Ещё один шаг?';
  $('#overlay-description').textContent = isBest ? 'На этом устройстве вы ещё не забирались так далеко.' : 'Попробуйте перепрыгнуть следующий стол или стул.';
  $('#run-result').textContent = `${run.score.toLocaleString('ru-RU')} очков`;
  $('#run-result').hidden = false;
  play.textContent = 'Ещё попытка';
  announce(`${isBest ? 'Новый личный рекорд. ' : ''}Пробежка закончилась: ${run.score} очков. Можно начать заново.`);
  play.focus({ preventScroll: true });
}

play.addEventListener('click', startRun);
pause.addEventListener('click', () => { pauseRun(); play.focus({ preventScroll: true }); });
jump.addEventListener('pointerdown', event => { event.preventDefault(); run.jump(); });
jump.addEventListener('click', event => { if (event.detail === 0) run.jump(); });
stage.addEventListener('pointerdown', event => {
  if (event.target.closest('button') || run.status !== 'running') return;
  event.preventDefault();
  run.jump();
});
document.addEventListener('keydown', event => {
  if (event.code === 'Escape' && run.status === 'running') {
    event.preventDefault(); pauseRun(); play.focus({ preventScroll: true });
  }
  if ((event.code === 'Space' || event.code === 'ArrowUp') && run.status === 'running' && !event.target.closest('button,a,input,select,textarea')) {
    event.preventDefault();
    if (!event.repeat) run.jump();
  }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseRun(); previousTime = performance.now(); });
window.addEventListener('blur', pauseRun);
window.addEventListener('resize', resize);

function frame(now) {
  const wasRunning = run.status === 'running';
  run.advance((now - previousTime) / 1000);
  previousTime = now;
  if (lastCleared !== run.cleared) { lastCleared = run.cleared; clearAt = run.time; }
  if (displayedScore !== run.score) { displayedScore = run.score; scoreLabel.textContent = run.score.toLocaleString('ru-RU'); }
  if (wasRunning && run.status === 'over') finishRun();
  render();
  requestAnimationFrame(frame);
}

resize();
loadAssets();
requestAnimationFrame(frame);
