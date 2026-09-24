# «По рукам» — обновление сайта · 24 сентября 2026

Источник содержания: финальный бриф «По рукам», версия 1.0 от 23 сентября 2026, из задачи «NEW Концепция и нейминг».

Сохранены терракотовый, кремовый и тёмно-синий цвета, шрифты, графическая подача, исправленные панорамные окна и вид на лес с дорогой. Название в шапке набрано текстом; это временное написание до утверждения логотипа. Старые фотографии залов не возвращались. Объявления о ремонте не добавлялись.

Главная, о нас, кухня и бар, контакты, заказ с собой и игра адаптированы под новое название. Утверждённое описание размещено дословно. Доставка отмечена как ещё не запущенная, терраса не рекламируется как действующая. Цены ланча 500 ₽ и банкетов 2700/3000 ₽ взяты из брифа. Старый полный список блюд и цен не представлен как новое меню: до его утверждения опубликованы категории и связь с командой.

Игра «Не расплескай»: официант в баре, без шлема. Физика, пять типов препятствий, управление и ключ личного рекорда сохранены. Общий рейтинг и призы не включены. Новогодние корпоративы исключены из ребрендинга по прямому указанию Ильи. Весь каталог `site/new-year/`, включая прежнее название МУН, логотип, программу, даты, цены, форму и PDF-меню, сохранён без изменений. Адрес сайта и действующие контакты/VK сохранены.

## Изображения

Режим: встроенный ImageGen.

- `site/assets/redesign/porukam-panoramic.png` — 1942×809, прозрачный PNG.
- `site/assets/game/bar-interior.png` — 1774×887, PNG.

### Запрос для главной иллюстрации

Use case: precise-object-edit. Edit the attached approved website illustration. Remove ONLY the crescent moon above the central roofline, replacing its area with genuine transparent alpha and naturally completing the short underlying cream roof edge. Keep everything else exactly the same: rectangular panoramic windows, forest, poplar trees and uphill road outside, sofas, tables, plants, bar, lamps, all object positions, ink lines, cream / dark navy / terracotta colors, 1942 by 809 wide composition. Do not add any object, text, logo or new ornament. Preserve true transparent background and the original alpha edges. This is a tiny edit for a restaurant rename; lunar imagery is no longer part of the brand. Output transparent PNG.

### Запрос для фона игры

Use case: illustration-story. Create one wide 2:1 landscape background for a side-scrolling pixel-art restaurant waiter running game. Output 1536x768 or similar exact 2:1 wide PNG. Style: polished 16-bit pixel art, crisp square pixel edges matching the attached waiter sprite (the sprite is STYLE REFERENCE ONLY, do not include any characters). Scene: an inviting modern bar interior with long straight panoramic rectangular windows showing a wooded hillside and ascending road; navy metal frames, warm cream walls, terracotta accents, wooden floor, bar counter and bottles to the far background right, a few warm pendant lamps, plants. All furnishings sit behind the running lane. Entire lower 24% is an EMPTY flat horizontal wooden floor for the runner and code-drawn obstacles. Floor/wall boundary exactly horizontal at 76% height. No objects, tables, chairs, counters, people, food, text, logo or obstacles in the lower 24%. Upper area scenery calm, legible and uncluttered. Palette navy #101F33, warm cream #F1E8DA, sand #D3C1AE, terracotta #C14025; warm bar lighting. View is a flat side-on game scene, no isometric perspective. No moon, no stars, no space theme, no planets. Background is opaque. No captions or watermark.

## Проверка

8 HTML-страниц, 190 локальных ссылок и якорей: ошибок нет. Браузер: ширины 320, 390 и 1440 px; горизонтального переполнения после исправления заголовка афиши нет. Проверены диалог бронирования, мобильная навигация, переключение разделов меню, загрузка иллюстраций, запуск, прыжок и пауза игры. 17 существующих тестов игровой механики прошли; синтаксис изменённого JavaScript проверен. Отдельно проверено полное отсутствие изменений в `site/new-year/`.
