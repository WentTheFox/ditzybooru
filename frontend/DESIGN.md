# Design System: Ditzybooru

Ditzybooru has no design system of its own. Its look is
[PhilomenaCSS](https://meow.github.io/PhilomenaCSS/) (`@philomena/philomena-css`),
the design of Philomena as an HTML/CSS-only framework, used through typed React
wrappers. This file records how the two are joined, so that the next change
reaches for the package before it reaches for CSS.

## The rule

**New UI is built from the package, not beside it.** In order of preference:

1. A component from `src/components/philomena/` (`Button`, `Alert`, `Block`,
   `Card`, `Table`, `Tag`, `Avatar`, `Pagination`, `Communication`, `MediaBox`,
   forms, navbar, burger, dropdown ...).
2. A class helper from the same folder (`navLinkClass`, `burgerItemClass`,
   `buttonClass` ...) where a router `Link` or other element has to carry the
   classes. Helpers exist so routes stay type-checked; components with an `as`
   prop would lose that.
3. The package's utility classes: `flex`, `flex-center`, `flex-grow`, `gap-*`,
   `layout-columns`, `layout-narrow`, `grid-flex`, `ms-*`/`p-*` spacing,
   `hidden-below-*`, `text-center`.
4. The package's tokens (`--spacing-*`, `--surface-color`, `--text-color`,
   `--tint-color`, `--border-radius-*`, `--z-*` ...) in a rule of our own.

Only then write CSS. The leftover is deliberately small (about 220 lines in nine
files) and every rule is there because the package has no equivalent:

| File | Why it exists |
| --- | --- |
| `styles/app.css` | `.muted-text`, `.truncate`, `.plain-text`, and a global `scroll-padding` for the sticky header. The package styles muted text only inside its own components. |
| `styles/view-transitions.css` | Cross-route view transitions for the media grid. |
| `components/layout/BottomNav.css` | The phone tab bar. The package has none. |
| `components/layout/SiteFooter.css` | The footer band. The package has none. |
| `components/layout/NavDropdown.css` | Closes a hover menu once a link in it was followed. The package only opens on hover and focus. |
| `components/home/MediaBox.css` | One override so the media box's overflow menu is not clipped. |
| `components/ui/Prose.css` | The site's markup carries the package's `hidden` utility on embedded images. |
| `routes/__root.css` | Page shell: full-height column that clears the bottom nav. |

If a change adds to this table, say why the package cannot do it.

## Theme

Light and dark follow `prefers-color-scheme`. A visitor can pin one with the
header toggle, stored in the `ditzy-settings` cookie (see `lib/settings.ts`) and
rendered by the server as `data-theme` on `<html>`, so the first paint is right.
`system` is the absence of the attribute. Motion follows `prefers-reduced-motion`
and nothing else. There are no user-facing display dials.

## Typeface

The package's `--base-font` is `"Montserrat"` and it ships no font file. The site
self-hosts it through `@fontsource/montserrat` (regular and bold, imported in
`styles/index.css`, the regular latin file preloaded in `__root.tsx`). The static
build is used rather than the variable one because it registers the family name
the token already asks for, so no override is needed.

## Per-site accent

Each site names an accent in its config (`Site.themeColor`, one of red, orange,
yellow, green, teal, blue, purple, pink, gray). The server renders it as
`data-accent` on `<html>`. The package computes every color derived from its base
color at build time, so an accent cannot be a runtime variable. Instead:

- `scripts/build-accents.ts` compiles the package once per accent (only
  `$base-color-dark` and `$base-color-light` change; the saturation and
  lightness are the package's own, so its contrast checks carry over) and keeps
  just the declarations that differ.
- The result is `src/styles/accents.css`, generated and committed. Blue is the
  package default and emits nothing.
- Regenerate after upgrading the package or changing an accent:
  `pnpm --filter frontend run build:accents`.

Never hardcode a site name, origin or color in a component; use `useSite()`.

## Stylesheet

`styles/index.css` is the single entry point. It imports the package whole
(it resets the page, so nothing may rely on a browser default), then
`accents.css`, then the files in the table above. No `.tsx` imports CSS.

The package is CSS only. What it leaves to script is left to script here:
hover menus do not close on Escape, the burger does not trap focus (`MobileMenu`
does, and locks scroll), tabs need a script for selection, and a combobox's
filtering and keyboard handling are ours.

## Components

`src/components/philomena/` holds one thin typed wrapper per package class
group; props map to modifier classes and nothing else. `philomena.test.ts`
renders every component with its modifiers on and fails if any class it emits is
missing from the compiled stylesheet. Several classes that the documentation
site shows are not in the package (`menu-check-*`, `dropdown-actions`,
`.form-control-combobox`) and are deliberately not wrapped.

The `ui/` folder keeps only logic helpers that render package components
(`Pagination`, `QueryState`, `BrowserRetry`, `CommunityPost`, `Prose`, `Int`,
`RelativeTime`, `HCaptcha`).

## Tag categories

A tag's category is a color the package already defines: rating, spoiler,
origin, oc, error, character, official, fanmade, species, body. A general tag has
no category. The category is also available as text; color is never the only
carrier of meaning.

## Accessibility

WCAG 2 AA, verified by axe-core (`a11y/a11y.test.ts`) in light and dark, across
every accent. The package's palette is built for 4.5:1 text and control contrast
and ships its own contrast check (`check:contrast`). Links inside running text
rely on color alone, so the `link-in-text-block` rule stays disabled in the
suite; re-enable it if prose links get an underline.

## Do and do not

- Do check the package (`node_modules/@philomena/philomena-css/css/components`)
  before writing a rule. Its class list is the source of truth, not the docs
  page, which is a strict subset and includes classes the package does not ship.
- Do use `Flex` or the `flex-*` utilities. `.flex-center` is cross-axis
  centering; `.flex-middle` centers on both axes.
- Do keep a stack of blocks free of wrapper `gap`s: the package spaces
  consecutive blocks itself.
- Do not copy package CSS into the repo or fork a component's look.
- Do not reintroduce a token layer, theme dials, or a utility framework.
