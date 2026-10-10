# U6 — Docs and the decision record

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4, U5
- **Owns:** `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`,
  `.claude/skills/**`, `.claude/docs/**`, `plugins/stackgen/stacks/readme.md`,
  `docs/memory/decisions/2026-10-10-os-device-frames.md` (new), and any other
  human-facing passage `vwf:docs-sync` finds outside the Owns of U1 to U5 and U7
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions; the U1 to U5
  diffs; then each owned passage before editing it.

## Ruling

> **Goal.** A canvas frame shows the OS that the product ships on. A SwiftUI
> phone shows a Dynamic Island, a Compose phone shows a punch-hole camera, a
> Wear OS watch is round. A project whose stack targets more than one OS on one
> platform (Flutter on `mobile`) switches between its OS frames with a `device`
> tweak on the one coded frame. A flow's `features:` entry shows on the frame of
> its own OS, and its fallback on every other frame. This plan finishes backlog
> item B58.

> - Decision D11: No vendor worked case ships. The decision doc records the
>   research (Facts) so the next plan does not repeat it. The capability-check
>   rule already lets a product build a vendor feature.

Two reversals, both confirmed by the user on 2026-10-10:
`2026-09-23-watch-tv-spatial-platforms` D7 (a list of sizes per product, now
accepted) and `2026-10-09-web-canvas-layout` D4 (desktop window chrome that
follows the stack, now accepted).

## Edits

1. Run `vwf:docs-sync` over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings, plus every
   `DOCS FALSIFIED:` line U1 to U5 returned.
2. **`site/src/content/docs/plugins/vwf.md`** — `:2345-2358` (the viewport
   defaults paragraph): the OS frames, the resolution order, the list form of
   `design.viewports`, the `device` tweak. `:2085-2096` (the platforms
   paragraph): the OS vocabulary, and that a `features:` entry shows on the
   frame of its OS.
3. **`site/src/content/docs/plugins/stackgen.md`** — where bundles and the
   payload are described, the `os:` key; `:349` and `:442` if they now read
   wrong.
4. **`docs/memory/decisions/2026-10-10-os-device-frames.md`** (new), in the
   shape of the other docs in that folder: the date, the branch, a link to this
   plan folder, "Finishes backlog item B58". Then: what was decided before (one
   viewport for each platform; D7 and D4 above), the decisions D1 to D16 with
   their rejected alternatives, both reversals named as reversals, the vendor
   research from index.md's Facts with its URLs, and Not in scope from index.md.

## Verification

- The full wave gate, notably `mise run p:site:check` and
  `mise run code:precommit`.

## Guardrails

- Never edit a file in the Owns of U1 to U5 or U7 — a falsified passage there is
  a `GAP:`.
- Do not edit `docs/plans/**` or any other decisions doc.
- `readme.md`, `CLAUDE.md` and the site pages are dprint-formatted: keep each
  code span on one line, and never end a table cell in a bare asterisk.
- No `git checkout` or `git restore`, and no formatter `--fix`, outside Owns.

## Commit

`docs: describe OS device frames and record the B58 decisions`
