Top bar with a dot-font wordmark, mono uppercase links and one action slot.

**Provide** `brand` (the name, rendered as a small DiscDisplay), `links` (`{label, href, active}`; mark the current page `active`), and optionally `action` (one Button, usually `size="sm"`). `brandColor="orange"` lights the wordmark orange.

**Do**
- Keep to five links or fewer; labels one or two words.
- Place it first in the page, full width, on `surface-000`.

**Don't**
- Don't put a second board in the nav.

The active link gets `aria-current="page"`, `ink` text and a small `orange-text` disc. Links wrap below the wordmark on narrow screens.
