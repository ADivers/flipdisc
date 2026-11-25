Flipdisc is a website system modelled on the electromechanical flip-disc sign: a black housing, a grid of round discs, and each disc showing either its black face or its lit face — white, or fluorescent orange. Sites built on it stay simple and load fast: the signature display is plain CSS circles driven by a tiny dot font, with no images, canvases or web fonts.

## Principles

- **One board, one message.** A page leads with a single DiscDisplay. It says one short thing, in capitals, and flips to the next. Never stack two animated boards in one viewport.
- **Three colours, used like a sign.** Black is the ground, white is information, orange is the signal. If everything is orange, nothing is.
- **Fast by default.** System fonts, no image assets, no runtime dependencies beyond React. A full board of 1,000 discs is 1,000 `<span>`s and one stylesheet.
- **Mechanical, not digital.** Discs flip; they do not fade, glow, blur or scroll smoothly. Corners are nearly square. Nothing is round except discs.

## Content fundamentals

- **Boards speak in capitals.** Two to four words, 16 characters or fewer per message: `NOW BOARDING`, `FAST TO LOAD`, `PLATFORM 04`. Use the punctuation the dot font has (`. , : - ! ? / ' & + # = * ( ) < >`); anything else renders blank.
- **Body copy is sentence case**, plain and short. Second person ("you"), present tense. No exclamation marks outside a board.
- **Labels are mono capitals** in the `label` style: `DEPARTURES`, `STATUS`, `UPDATED 14:32`.
- **No emoji.** The disc is the only pictogram.

## Colour

- Ground every page in `surface-000`; set panels on `surface-100`; hover fills use `surface-200`.
- Set headings and body in `ink`; secondary copy and labels in `ink-muted`.
- `orange-500` fills the primary button and at most one emphasised block per view. Text on it is always `on-orange`. Never set text in `orange-500` — use `orange-text` for orange words and small marks.
- Boards use `housing`, `disc-off`, `disc-white` and `disc-orange`, which are the same in both themes: a board is a physical object and stays black on the light Paper theme too.
- Light the board white for information and orange for status, alerts or the single message that must stand out.
- Hairlines are `line`; anything a person operates (a secondary button, an input) gets `line-strong`, which meets 3:1.
- **Themes.** Board (dark) is primary. Paper (light) swaps the surfaces and ink; set `data-theme="paper"` on `<html>`.

## Type

- System stacks only: `--font-sans` for everything people read, `--font-mono` for labels, status words and data. This is deliberate — zero font requests.
- The real display face is the DiscDisplay's 5×7 dot font. Use the `display` text style only where a board can't go (an email, a meta image).
- Page title `h1`, sections `h2`, panel titles `h3`; running copy `body`; the paragraph under a hero `lede` in `ink-muted`, max 60ch.

## Layout and spacing

- Content column max 1104px, side gutter `space-6`.
- Sections are separated by a `line` hairline and padded `space-12` top and bottom; the hero gets `space-16` on top.
- Grids of panels use a `space-4` gutter and `minmax(260px, 1fr)` columns.
- Corners: `radius-sm` on buttons, panels and board housings; `radius-disc` only for discs.
- No shadows. Depth comes from the housing being darker than the page.

## The board (DiscDisplay)

- A full-width hero uses `fit` so discs scale with the column; everything else uses a fixed `pitch` (`pitch-sm` for nav and table rows, `pitch-md` for section boards, `pitch-lg` for a fixed hero).
- Keep `rows` at 9 (the 7-disc font plus one empty row above and below).
- Cycling boards hold each message at least 3 seconds (`interval` 3200 default).

## The whole page as a board (DiscField)

- Wrap a page in DiscField to make its entire background one flip-disc board. Inside it, colours are always the board's (light on black), in both themes.
- Put on discs only what a real sign would carry: the wordmark, the hero message, section labels, schedule rows, button and panel edges. Mark them with `data-disc="text"`, `fill` or `outline`. Leave headings, paragraphs and nav links as real text over the field.
- Field pitch is 8px on wide screens and 4–5px on phones; hero text uses `data-disc-scale` 2–3 and shrinks itself to fit.
- Primary buttons are `fill` + `data-disc-color="orange"` + `data-disc-hover="white"`; secondary buttons are `outline` + `data-disc-hover="orange"`.
- Sections flip in as they scroll into view. A field with nothing changing does no work: unlit discs are a CSS pattern, and the canvas only covers the visible window.

## Motion

- The only motion is the disc flip: 180ms, a horizontal squash to edge-on and back, colour switching at the midpoint, staggered 14ms per column left to right.
- Buttons change colour in 120ms linear; the primary button "flips" from orange to `ink` on hover.
- Under `prefers-reduced-motion`, discs change instantly.

## States and focus

- Every interactive element shows a 2px solid `focus` ring offset 2px (≥6:1 on both themes' surfaces).
- Disabled controls drop to 45% opacity and keep their colours.
- Status is never colour alone: a StatusDisc always carries its word.

## Iconography

- There is no icon set and no logo. The wordmark is the brand name set on a small DiscDisplay (NavBar does this). Where a pictogram is unavoidable, use a single disc (StatusDisc) or a dot-font character such as `>`.

---

## Repository layout

| Path | What it is |
|---|---|
| `tokens.json` | Colour (Board and Paper themes), type, spacing, radius and disc-pitch tokens |
| `components/bundle.js`, `components/bundle.css` | The components (`window.Flipdisc`: DiscDisplay, DiscField, Button, NavBar, Panel, StatusDisc) |
| `components/index.d.ts` | TypeScript declarations |
| `components/<Name>/` | Each component's notes and preview |
| `tools/build_pages.py` | Builds the GitHub Pages site into `docs/` (generates `tokens.css`, makes every preview a standalone page) |
| `docs/` | The published site — rebuild with `python3 tools/build_pages.py` after changing anything above |
| `vendor/` | React 18.3.1 UMD builds used by the site (MIT) |

Live site: https://adivers.github.io/flipdisc/
