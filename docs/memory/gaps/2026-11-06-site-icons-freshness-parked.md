GAP 2026-09-05 ★2 | website: icon freshness and markdown link | `p:site:icons
--check` and a visible "view as markdown" link were never built | open, parked

**Source plan** `2026-09-05-site-seo-and-markdown`.

- `p:site:icons` has no `--check` mode. A changed favicon SVG can ship with
  stale committed icons. The idea: re-render into a temp directory, diff
  against `site/public/`, and join `p:site:check`.
- No visible "view as markdown" link exists on docs pages. Each page only
  carries the `rel="alternate"` link. The plan parked the link until the
  mirror had been live for a while.
- The Cloudflare-managed `robots.txt` that blocks AI crawlers is a zone
  setting in the dashboard, not a repo change. `site/CLAUDE.md` states the
  rule.

Facts that bit the run and are not in the manual:

- `png-to-ico@3` as a CLI writes four layers (48, 32, 16 and an upscaled 256),
  because its bin passes only the first argument. The 16, 32 and 48 layers need
  the library entry with an array.
- `sharp-cli` needs `--output`, so each size is staged as its own file.
