// The man and his sign stay inside the collision rectangle.
export function drawVillain(context, obstacle, ground) {
  context.save();
  context.translate(Math.round(obstacle.x), ground - obstacle.height);
  context.scale(obstacle.width / 80, obstacle.height / 104);
  const rect = (color, x, y, width, height) => {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  };

  // Heavy boots, trousers and a dark burgundy coat.
  rect('#172136', 21, 73, 16, 26);
  rect('#172136', 44, 73, 16, 26);
  rect('#3b4355', 24, 76, 5, 22);
  rect('#3b4355', 49, 76, 5, 22);
  rect('#0d1726', 15, 98, 23, 6);
  rect('#0d1726', 43, 98, 23, 6);
  rect('#647081', 15, 98, 15, 2);
  rect('#647081', 52, 98, 14, 2);
  rect('#322333', 17, 32, 46, 43);
  rect('#55303c', 21, 34, 38, 37);
  rect('#912f32', 33, 34, 15, 37);
  rect('#211e2d', 27, 34, 6, 18);
  rect('#211e2d', 48, 34, 6, 18);
  rect('#322333', 8, 35, 12, 28);
  rect('#322333', 60, 35, 12, 28);
  rect('#73505b', 8, 35, 4, 19);
  rect('#73505b', 68, 35, 4, 19);

  // A scowling face with swept-back hair, moustache and a short beard.
  rect('#171e2b', 29, 0, 22, 4);
  rect('#171e2b', 25, 4, 30, 18);
  rect('#3c3440', 29, 3, 18, 3);
  rect('#d79a70', 29, 8, 22, 22);
  rect('#f0b88a', 30, 9, 16, 14);
  rect('#b57658', 26, 14, 4, 9);
  rect('#b57658', 51, 14, 4, 9);
  rect('#282030', 30, 10, 6, 2);
  rect('#282030', 34, 12, 4, 2);
  rect('#282030', 44, 10, 6, 2);
  rect('#282030', 42, 12, 4, 2);
  rect('#161e2c', 33, 15, 3, 3);
  rect('#161e2c', 44, 15, 3, 3);
  rect('#b57658', 38, 17, 4, 4);
  rect('#292332', 33, 22, 14, 3);
  rect('#f1c296', 36, 25, 8, 2);
  rect('#292332', 32, 28, 16, 3);
  rect('#292332', 35, 31, 10, 3);

  // A broad, high-contrast sign keeps the exact name readable in motion.
  rect('#4b302a', 0, 48, 80, 29);
  rect('#d8b98b', 2, 50, 76, 25);
  rect('#f5e3bf', 4, 52, 72, 20);
  rect('#b2875b', 2, 74, 76, 2);
  rect('#b57658', 0, 57, 6, 13);
  rect('#f0b88a', 0, 57, 5, 9);
  rect('#b57658', 74, 57, 6, 13);
  rect('#f0b88a', 75, 57, 5, 9);
  context.fillStyle = '#38292c';
  context.font = '800 18px Manrope, Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('Тутла', 40, 62, 64);
  context.restore();
}
