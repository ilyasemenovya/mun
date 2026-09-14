# Графика лунной игры МУН

Текущий персонаж — официант с пивом: [актуальный файл и промпт](GAME_WAITER_ART.md). Лунный фон из этого документа сохранён. Описание космонавта ниже относится к предыдущей версии; он больше не используется игрой.

Режим: встроенный ImageGen (text-to-image). Оригинальные PNG сохранены без редактирования; четыре кадра космонавта выбираются при отрисовке по координатам в `frames.json`.

## Космонавт

Файл: `site/assets/game/astronaut.png`.

Финальный промпт:

> Use case: stylized-concept. Asset type: sprite sheet for a 2D browser side-scrolling lunar runner game for MUN lounge bar. Create a precise 2 by 2 grid of FOUR animation frames, transparent background, no separators, no lettering, no UI. Each grid cell contains the SAME cute compact astronaut in off-white spacesuit with burnt-orange bands, deep midnight-navy mirrored visor, small backpack. Strong clean silhouette, side profile facing RIGHT, premium retro editorial pixel-art aesthetic with crisp blocks and limited palette. Four consecutive jogging phases: frame top left left leg forward right arm forward, top right passing pose, bottom left right leg forward left arm forward, bottom right passing pose. Keep helmet and torso consistent size, in same center positions within cells; full body visible, feet aligned at same baseline within every cell. Characters occupy approximately 70 percent of cell height with ample transparent padding, separated with transparent margins. Exactly four astronauts, no rocks, no floor, no shadows outside the character, no logos. Square 1024x1024 sprite sheet. Genuine alpha transparency, not a checkerboard pattern.

## Луна

Файл: `site/assets/game/moon.png`.

Финальный промпт:

> Use case: stylized-concept. Asset type: seamless-feeling wide background scenery for a 2D lunar side-scrolling runner browser game by MUN lounge bar. A refined retro pixel art lunar landscape, 16:9 horizontal panoramic composition. Midnight navy (#101F33) deep empty space in upper 65%, sparse tiny cream stars, a small distant blue Earth in upper right. In the lower 35%, distant layered rounded lunar hills, craters and rock textures in muted blue grey and soft milk-cream tones; warm subtle orange accents from reflected sunlight. View exactly side-on from the surface of the Moon, low lunar horizon, no perspective road, no astronauts or people, no spacecraft, no text, no numbers, no letters, no border and no UI. Calm sophisticated pixel art, consistent chunky 2D pixel edges, not glossy 3D and not photography. Keep the middle and left sky empty for gameplay readability. The bottom 20% is unobstructed flat lunar ground, softly textured, for a running track.
