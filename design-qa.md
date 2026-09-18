# Design QA — MUN reference adaptation

Date: 2026-09-18
Result: passed

## Scope and evidence

Reference: owner-supplied screenshot “Снимок экрана — 2026-09-18 в 15.51.49.png”. The reference contains a desktop hero on the left and a narrow continuation on the right. Its outer black canvas and screenshot controls are excluded from the product layout. Palette and logo substitution are intentional requirements, not fidelity defects.

Source screenshot and browser captures were viewed together in comparison inputs: desktop hero at 1440×1000, and mobile tilted menu cards at 390×844. Additional focused captures covered the editorial collage, mobile hero, booking dialog, menu, contacts, karaoke and delivery/feedback sections. Comparison uses the corresponding product regions, not the screenshot's outer presentation canvas. The reference has no complete responsive specification; mobile stacking is an adaptation.

## Visual checks

- Layout: inset dark navigation, centered oversized condensed title, illustrated lounge, scalloped edge, cream/red/navy rhythm, cutout collage, rotated paper cards and category strip implemented.
- Brand: original logo bytes unchanged. Four existing brand color tokens unchanged. Small type on terracotta uses white for AA contrast; large display lettering retains cream.
- Typography: Oswald Cyrillic headings and Manrope body copy load locally. Display hierarchy, line breaks and paragraph measure checked in rendered pages.
- Assets: transparent generated PNGs, original venue photography, existing game imagery and licensed Phosphor icons. No placeholder images or custom SVG illustration substitutes.
- Shape: minimal rounded buttons/navigation; square photo and menu cards with controlled rotation, no generic floating card UI.
- Content: restaurant facts, routes and contact methods retained. No fabricated reviews, opening hours, delivery prices or competition awards.

## Responsive and interaction checks

All six main pages checked at 320, 390, 768 and 1440 pixels wide. No final document horizontal overflow; heading and paragraph overflow checks pass. Images retain proportions. Mobile menu expands/collapses. Booking dialog opens/closes. Kitchen/bar navigation switches panels and active state; “Горячее” disclosure expands. Gallery opens, advances from 1/3 to 2/3 and closes. Delivery and pickup open their respective confirmation dialogs. Game starts, counts score and pauses.

All local HTML/CSS asset paths resolve. Console error check: none on the new homepage. All 219 rendered menu items and 34 category headings match the previous release. `menu.json`, logo and every game file are byte-identical to the previous release. No game physics changes.

## Corrections made during QA

- P1: intrinsic HTML image heights stretched mobile photo cards and caused horizontal overflow. Added explicit auto heights; rechecked 390 and 320 widths.
- P2: hero lettering descender was too close to the tagline. Increased line height and bottom spacing.
- P2: body margin collapse exposed a navy strip above the inset header. Isolated body formatting context.
- P1: gallery's long “Продолжение” heading overflowed at 320 pixels. Applied responsive secondary CTA typography; final overflow 0.
- P2: small cream text on terracotta was below AA. Added white utility text while preserving brand colors; darkened feedback accent to navy on sand.

Outstanding P0/P1/P2 findings: none.

Publication status is checked separately through the GitHub Pages workflow and live asset hashes.

## Concurrent repository update

Before publication, fetched and fast-forwarded the newer `e4e6534` header commit. Preserved its centered-logo intent in the redesign. Header verified at 320/390/768/1280/1440 widths: logo center equals viewport center, booking remains clear, collapsed navigation stays available, no document overflow. The base `styles.css` change is retained without modification.
