export const STEP = 1 / 120;
export const GRAVITY = 1950;
export const JUMP_VELOCITY = 800;
export const PLAYER_HALF_WIDTH = 12;

const OBSTACLES = [
  { type: 'table', minWidth: 90, widthRange: 21, height: 54 },
  { type: 'chair', minWidth: 42, widthRange: 11, height: 72 },
  { type: 'ribs', minWidth: 84, widthRange: 19, height: 38 },
  { type: 'burger', minWidth: 58, widthRange: 15, height: 54 },
  { type: 'villain', minWidth: 80, widthRange: 9, height: 104 }
];

export function randomFromSeed(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// This simulation is for practice only. Client scores cannot authorize prizes.
export class LunarRun {
  constructor({ width = 960, seed = 1 } = {}) {
    this.width = Math.max(560, width);
    this.reset(seed);
  }

  reset(seed = 1) {
    this.random = randomFromSeed(seed);
    this.status = 'ready';
    this.time = 0;
    this.distance = 0;
    this.score = 0;
    this.cleared = 0;
    this.hitObstacle = null;
    this.speed = 260;
    this.elevation = 0;
    this.velocity = 0;
    this.obstacles = [];
    this.nextObstacle = 330;
    this.accumulator = 0;
    this.jumpCount = 0;
    this.playerX = Math.min(125, this.width * 0.19);
  }

  start() {
    if (this.status === 'ready') this.status = 'running';
  }

  jump() {
    if (this.status !== 'running' || this.elevation > 0.01 || this.velocity > 0) return false;
    this.velocity = JUMP_VELOCITY;
    this.jumpCount++;
    return true;
  }

  pause() {
    if (this.status === 'running') {
      this.status = 'paused';
      this.accumulator = 0;
    }
  }

  resume() {
    if (this.status === 'paused') this.status = 'running';
  }

  advance(delta) {
    if (this.status !== 'running' || !Number.isFinite(delta) || delta <= 0) return;
    // A hidden tab or a blocked frame must not produce a large surprise jump.
    this.accumulator += Math.min(delta, 0.1);
    while (this.accumulator + 1e-10 >= STEP && this.status === 'running') {
      this.step();
      this.accumulator = Math.max(0, this.accumulator - STEP);
    }
  }

  step() {
    this.time += STEP;
    this.speed = Math.min(440, 260 + this.time * 5);
    const move = this.speed * STEP;
    this.distance += move;
    if (this.elevation > 0 || this.velocity > 0) {
      this.elevation = Math.max(0, this.elevation + this.velocity * STEP);
      this.velocity -= GRAVITY * STEP;
      if (this.elevation === 0) this.velocity = 0;
    }

    this.nextObstacle -= move;
    if (this.nextObstacle <= 0) {
      const { type, minWidth, widthRange, height } = OBSTACLES[Math.floor(this.random() * OBSTACLES.length)];
      const width = minWidth + Math.floor(this.random() * widthRange);
      this.obstacles.push({ type, x: this.width + 65, width, height, passed: false });
      // Leave enough time to land before the next obstacle arrives.
      this.nextObstacle = width + this.speed * (1.12 + this.random() * 0.3);
    }

    for (const obstacle of this.obstacles) {
      obstacle.x -= move;
      const inside = this.playerX + PLAYER_HALF_WIDTH > obstacle.x && this.playerX - PLAYER_HALF_WIDTH < obstacle.x + obstacle.width;
      if (inside && this.elevation < obstacle.height) {
        this.status = 'over';
        this.hitObstacle = obstacle.type;
        this.accumulator = 0;
        break;
      }
      if (!obstacle.passed && obstacle.x + obstacle.width < this.playerX - PLAYER_HALF_WIDTH) {
        obstacle.passed = true;
        this.cleared++;
      }
    }
    this.obstacles = this.obstacles.filter(obstacle => obstacle.x + obstacle.width > -60);
    this.score = Math.floor(this.distance / 10) + this.cleared * 25;
  }
}
