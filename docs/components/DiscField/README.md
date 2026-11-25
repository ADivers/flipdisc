Turns a whole region — usually the entire page — into one flip-disc board, drawn on a single canvas so it stays light.

**Provide** `children`: ordinary page content. Opt elements onto the board with attributes:
- `data-disc="text"` draws the element's text in dot type (`data-disc-messages="HELLO.|FAST."` cycles; `data-disc-scale="2"` doubles the dot size, shrinking automatically to fit; `data-disc-align="center"`).
- `data-disc="fill"` lights every disc behind the element; `data-disc="outline"` lights its edge; `data-disc="clear"` forces discs off behind it.
- `data-disc-color="orange"` for the signal colour; `data-disc-hover="white"` re-flips on hover and keyboard focus (buttons).
Optional props: `pitch` (8px), `pitchSm` (5px under 640px wide), `interval`, `sweep`.

**How it stays fast**
- Unlit discs are a CSS background pattern — no drawing at all.
- The canvas is only as big as the visible window and paints only lit discs and the ones mid-flip; a still page does no work.
- Sections flip in as they scroll into view.
- Without JavaScript, or before it runs, the page shows as normal text on the disc pattern. Under reduced motion, discs change without flipping.

**Do**
- Keep `data-disc="text"` to headlines, labels and board rows; leave paragraphs as real text over the field.
- Use one `data-disc-messages` element per screen.
- Pair a `fill` button with `data-disc-hover` so hover is a flip, not a fade.

**Don't**
- Don't nest DiscDisplay boards inside a field — use `data-disc="text"` instead.
- Don't put long or small text on discs; it can't be read.

Text drawn on discs stays in the HTML (transparent), so it remains selectable, searchable and read by screen readers. Inside a field the colours are forced to the board's (light on black) in both themes.
