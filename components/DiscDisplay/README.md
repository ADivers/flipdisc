The flip-disc board: renders short uppercase text in a 5×7 dot font on a grid of discs that flip, column by column, when the message changes.

**Provide** `text` (one message) or `messages` (cycles every `interval` ms). Optionally `color` (`white` default, `orange` for status), `pitch` (`sm` / `md` / `lg` or px) or `fit` to fill the container width, `rows` (default 9), `cols`, `align`.

**Use it for** the hero message, section openers, schedule/status rows and the nav wordmark.

**Do**
- Keep each message to 16 characters or fewer; capitals only (input is uppercased).
- Use `fit` for a full-width hero so the board scales on phones.
- Use `color="orange"` for status or alerts, not for decoration.

**Don't**
- Don't run more than one cycling board in a viewport.
- Don't put long sentences on a board — set them in `body` beside it.
- Don't recolour the housing or discs; they are the same in every theme.

The board has `role="img"` and an `aria-label` of its message(s); pass `label` to override. With `boot` (default) it starts blank and flips its first message in after mount; set `boot={false}` for boards that should paint instantly (the nav wordmark does).
