// Pixel shapes share the obstacle bounds used by the simulation.
export function drawFood(context, obstacle, ground) {
  context.save();
  context.translate(Math.round(obstacle.x), ground - obstacle.height);
  context.scale(obstacle.width / 48, obstacle.height / 36);
  const rect = (color, x, y, width, height) => {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  };

  if (obstacle.type === 'burger') {
    // Toasted sesame bun, lettuce, tomato, cheese and a grilled patty.
    rect('#603829', 12, 0, 24, 3);
    rect('#603829', 6, 3, 36, 3);
    rect('#603829', 3, 6, 42, 6);
    rect('#603829', 0, 12, 48, 21);
    rect('#603829', 6, 33, 36, 3);
    rect('#edaf56', 12, 3, 24, 3);
    rect('#edaf56', 6, 6, 36, 6);
    rect('#edaf56', 3, 12, 42, 3);
    rect('#ffc873', 12, 3, 21, 3);
    rect('#ffc873', 6, 6, 9, 3);
    rect('#c77936', 3, 15, 42, 3);
    for (const [x, y] of [[12, 7], [23, 5], [32, 8], [20, 11]]) rect('#fff0be', x, y, 3, 2);
    rect('#719444', 0, 18, 48, 3);
    rect('#acc36a', 3, 17, 12, 3);
    rect('#acc36a', 23, 18, 12, 3);
    rect('#719444', 9, 21, 6, 2);
    rect('#719444', 36, 21, 6, 2);
    rect('#cb492b', 3, 21, 42, 3);
    rect('#f18048', 6, 21, 12, 1);
    rect('#f5bd44', 3, 24, 42, 2);
    rect('#6d3527', 3, 26, 42, 4);
    rect('#a05831', 6, 26, 6, 2);
    rect('#a05831', 27, 27, 12, 1);
    rect('#f5bd44', 15, 26, 9, 2);
    rect('#f5bd44', 18, 28, 3, 2);
    rect('#e8a04a', 3, 30, 42, 3);
    rect('#f4bf6c', 6, 30, 30, 1);
    rect('#bc7135', 6, 33, 36, 2);
  } else if (obstacle.type === 'ribs') {
    // A glazed rack with six pale rib bones projecting from the meat.
    for (let index = 0; index < 6; index++) {
      const x = 3 + index * 7;
      rect('#b59876', x, 0, 5, 36);
      rect('#f0dec0', x, 0, 4, 35);
      rect('#fff0d2', x, 1, 2, 7);
      rect('#fff0d2', x, 28, 2, 6);
    }
    rect('#512a24', 3, 7, 42, 21);
    rect('#512a24', 0, 11, 48, 14);
    rect('#873e28', 3, 10, 42, 15);
    rect('#b86132', 3, 10, 42, 5);
    rect('#a04a29', 0, 14, 48, 8);
    rect('#d48645', 4, 9, 9, 3);
    rect('#d48645', 18, 9, 11, 3);
    rect('#d48645', 34, 10, 9, 3);
    for (let index = 0; index < 6; index++) {
      const x = 5 + index * 7;
      rect('#5d2d23', x, 13, 2, 11);
      rect('#d27a3d', x - 2, 15, 2, 5);
    }
    rect('#c97137', 7, 24, 10, 2);
    rect('#c97137', 26, 24, 14, 2);
  }
  context.restore();
}
