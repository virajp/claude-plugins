DECISION 2026-09-14 ★3 | stylesheet axis and web head | The stylesheet is a
choice, so it is a seventh vwf axis (config_format 18 to 19); the page head is a
contract, so it is doctrine plus a per-screen Metadata block (blueprint_format
24 to 25) | alt bundle multiplication, landed public/ files, always-on SEO
rejected

**Source plan** `2026-09-14-web-frontend-surface` (backlog B07 and B08).

- Axis: `projects.<name>.stylesheet`, asked only of a project with a `site` or
  `webapp` platform. Menu: `tailwindcss`, `stylex`, `plain-css`, plus the
  `generate` door. Rejected: sibling bundles per stylesheet (the Astro
  four-bundle decision refuses pairs differing by one choice); a framework-pack
  option (needs a derived-questions mechanism that does not exist).
- Stylesheet packs are doctrine like `framework/astro`: no `config/`. Each
  `conventions.md` has a `## Tokens` section that realizes the design-system
  tokens, so vwf keeps naming no technology. Integration files are edits that
  `/vwf:execute` makes. Rejected: landed integration files. `stylesheet` is a
  minted kind. Rejected: `language-bundle` as a placeholder.
- Deferral: the round offers "defer this axis", recorded `unresolved`. The
  18 to 19 migration writes `unresolved` on each `site` or `webapp` project and
  nothing else moves. Rejected: require an answer at migration; leave it absent.
- Head contract lives in a cross-pack contract file, not in Astro prose. `site`
  gets the full set. `webapp` gets favicons, manifest and `<title>` always, and
  the SEO and OpenGraph set only when its `capabilities:` lists `seo`.
- Per-screen `Metadata` block: `title`, `description`, `index`, `image`.
  Rejected:
  a full head per screen (JSON-LD type, canonical, locale). Text defaults live
  in `conventions.md` under `## Web metadata`; visual assets live in the design
  system under `## Brand assets`. A platform file without the block is `24`
  drift, proposed row by row and never auto-filled.
- `public/` files are written by `/vwf:execute` from the doctrine. Rejected: a
  landed `public/` payload (it widens checker rule 11). The `icons` task runs
  `sharp-cli` with `pnpx` and installs `png-to-ico` in a temp dir, as this
  repo's
  site does. No package dependency.

Problem met. The icons task first zeroed every `rx` and `ry` to square the
touch icon. On an `<ellipse>` that erases the shape and renders a blank icon.
The fix zeroes the radii on `<rect>` tags only, in node, because line-scoped
edits fail on a minified one-line SVG.
