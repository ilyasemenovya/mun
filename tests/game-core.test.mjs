import test from 'node:test';
import assert from 'node:assert/strict';
import { LunarRun, STEP, GRAVITY, JUMP_VELOCITY, randomFromSeed } from '../site/game-core.mjs';

test('ready, paused, and finished runs cannot accrue points', () => {
  const game = new LunarRun();
  game.advance(0.1);
  assert.equal(game.score, 0);
  game.start();
  game.advance(0.1);
  game.pause();
  const snapshot = [game.time, game.distance, game.score];
  for (let i = 0; i < 100; i++) game.advance(0.1);
  assert.deepEqual([game.time, game.distance, game.score], snapshot);
  assert.equal(game.jump(), false);
  game.status = 'over';
  game.advance(0.1);
  assert.deepEqual([game.time, game.distance, game.score], snapshot);
});

test('jump has a finite height and cannot be repeated in midair', () => {
  const game = new LunarRun();
  game.start(); game.nextObstacle = Infinity;
  assert.equal(game.jump(), true);
  assert.equal(game.jump(), false);
  let peak = 0;
  for (let i = 0; i < 100; i++) { game.advance(STEP); peak = Math.max(peak, game.elevation); }
  assert.ok(peak > 165 && peak < 171, `peak=${peak}`);
  assert.equal(game.elevation, 0);
  assert.equal(game.jump(), true);
});

test('scores and physics are equivalent at 30, 60, and 120 frames per second', () => {
  const results = [30, 60, 120].map(fps => {
    const game = new LunarRun({ seed: 37 });
    game.start(); game.nextObstacle = Infinity; game.jump();
    for (let i = 0; i < fps * 10; i++) game.advance(1 / fps);
    return [game.score, game.distance, game.time, game.elevation];
  });
  assert.deepEqual(results[0], results[1]);
  assert.deepEqual(results[1], results[2]);
});

test('ground-level furniture collision ends a run without a bonus', () => {
  const game = new LunarRun(); game.start();
  game.obstacles = [{ type: 'table', x: game.playerX - 25, width: 100, height: 54, passed: false }];
  game.advance(STEP);
  assert.equal(game.status, 'over');
  assert.equal(game.cleared, 0);
});

test('passed furniture earns its bonus exactly once', () => {
  const game = new LunarRun(); game.start(); game.nextObstacle = Infinity;
  game.obstacles = [{ type: 'chair', x: game.playerX - 120, width: 52, height: 72, passed: false }];
  game.advance(STEP);
  assert.equal(game.cleared, 1);
  for (let i = 0; i < 300; i++) game.advance(STEP);
  assert.equal(game.cleared, 1);
  assert.equal(game.score, Math.floor(game.distance / 10) + 25);
});

test('tables, chairs, ribs and burgers remain jumpable at all difficulty levels', () => {
  const clearedTypes = new Set();
  for (const width of [560, 960]) {
    for (let seed = 1; seed <= 36; seed++) {
      const game = new LunarRun({ width, seed }); game.start();
      for (let i = 0; i < 120 * 90; i++) {
        const next = game.obstacles.find(obstacle => !obstacle.passed);
        if (next && next.x + next.width / 2 - game.playerX < game.speed * JUMP_VELOCITY / GRAVITY && game.elevation === 0) game.jump();
        game.advance(STEP);
        for (const obstacle of game.obstacles) if (obstacle.passed) clearedTypes.add(obstacle.type);
        assert.notEqual(game.status, 'over', `width=${width}, seed=${seed}, time=${game.time}`);
      }
      assert.equal(game.speed, 440);
      assert.ok(game.cleared > 30);
    }
  }
  assert.deepEqual(clearedTypes, new Set(['table', 'chair', 'ribs', 'burger']));
});

test('a new attempt fully resets the previous run', () => {
  const game = new LunarRun(); game.start(); game.advance(0.1); game.jump();
  game.reset(2);
  assert.equal(game.status, 'ready');
  assert.equal(game.score, 0);
  assert.equal(game.distance, 0);
  assert.equal(game.elevation, 0);
  assert.equal(game.jumpCount, 0);
  assert.deepEqual(game.obstacles, []);
});

test('furniture height matters: low jumps clear a table but hit a chair', () => {
  for (const [type, height, expected] of [['table', 54, 'running'], ['chair', 72, 'over']]) {
    const game = new LunarRun(); game.start(); game.nextObstacle = Infinity;
    game.elevation = 62;
    game.obstacles = [{ type, x: game.playerX - 5, width: 50, height, passed: false }];
    game.advance(STEP);
    assert.equal(game.status, expected, type);
    assert.equal(game.cleared, 0);
  }
});

test('landing on furniture causes a collision', () => {
  const game = new LunarRun(); game.start(); game.nextObstacle = Infinity;
  game.elevation = 90; game.velocity = -250;
  game.obstacles = [{ type: 'chair', x: game.playerX - 5, width: 52, height: 72, passed: false }];
  for (let i = 0; i < 20 && game.status === 'running'; i++) game.advance(STEP);
  assert.equal(game.status, 'over');
  assert.equal(game.cleared, 0);
});

test('all four obstacle types appear with matching dimensions', () => {
  const types = new Set();
  for (let seed = 1; seed <= 40; seed++) {
    const game = new LunarRun({ seed }); game.start(); game.nextObstacle = 0;
    game.advance(STEP);
    const obstacle = game.obstacles[0];
    types.add(obstacle.type);
    if (obstacle.type === 'table') {
      assert.equal(obstacle.height, 54); assert.ok(obstacle.width >= 90 && obstacle.width <= 110);
    } else if (obstacle.type === 'chair') {
      assert.equal(obstacle.height, 72); assert.ok(obstacle.width >= 42 && obstacle.width <= 52);
    } else if (obstacle.type === 'ribs') {
      assert.equal(obstacle.height, 38); assert.ok(obstacle.width >= 84 && obstacle.width <= 102);
    } else if (obstacle.type === 'burger') {
      assert.equal(obstacle.height, 54); assert.ok(obstacle.width >= 58 && obstacle.width <= 72);
    } else {
      assert.fail(`Unexpected obstacle: ${obstacle.type}`);
    }
  }
  assert.deepEqual(types, new Set(['table', 'chair', 'ribs', 'burger']));
});

for (const [type, width, height] of [['ribs', 102, 38], ['burger', 72, 54]]) {
  test(`${type}: a completed jump awards +25 exactly once`, () => {
    const game = new LunarRun(); game.start(); game.nextObstacle = Infinity;
    game.obstacles = [{ type, x: game.playerX + 75, width, height, passed: false }];
    game.jump();
    // Being above the food is not enough: the bonus arrives after clearing it.
    for (let i = 0; i < 40; i++) game.advance(STEP);
    assert.equal(game.cleared, 0);
    assert.equal(game.score, Math.floor(game.distance / 10));
    for (let i = 0; i < 320; i++) game.advance(STEP);
    assert.equal(game.status, 'running');
    assert.equal(game.cleared, 1);
    assert.equal(game.score, Math.floor(game.distance / 10) + 25);
  });

  test(`${type}: running into or landing on food ends the run without a bonus`, () => {
    for (const landing of [false, true]) {
      const game = new LunarRun(); game.start(); game.nextObstacle = Infinity;
      game.elevation = landing ? height + 10 : 0;
      game.velocity = landing ? -250 : 0;
      game.obstacles = [{ type, x: game.playerX - 5, width, height, passed: false }];
      for (let i = 0; i < 20 && game.status === 'running'; i++) game.advance(STEP);
      assert.equal(game.status, 'over');
      assert.equal(game.cleared, 0);
      assert.equal(game.score, Math.floor(game.distance / 10));
    }
  });
}

test('seeded random streams are repeatable and long interruptions are bounded', () => {
  const a = randomFromSeed(123), b = randomFromSeed(123);
  for (let i = 0; i < 50; i++) assert.equal(a(), b());
  const game = new LunarRun(); game.start(); game.advance(60);
  assert.ok(game.time <= 0.10001);
  game.advance(NaN); game.advance(-1);
  assert.ok(game.time <= 0.10001);
});
