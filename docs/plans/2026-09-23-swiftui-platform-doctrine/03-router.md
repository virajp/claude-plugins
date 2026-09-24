# U3 — The router rows for platforms and integrations

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:**
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the router, then every file U1 and U2 wrote (first lines
  suffice for the one-line descriptions).

## Ruling

Quoted from index.md:

- **S4** — "The platform and integration rows are added to the router in the
  same plan as their files, after them."

## Edits

1. Replace the router's sentence promising per-platform and integration
   references with two sections in the topic table's shape: **Platforms** — the
   six `platforms/` files, each with its vwf token and one line on when to read
   it; **Integrations (topic 12)** — the five `integrations/` files, one line
   each. Leave the topic 1–11 rows and the frontmatter unchanged.

## Verification

- `mise run p:plugins:check` green (rule 4 — the frontmatter still parses).
- Every relative link in the router resolves.

## Guardrails

- Touch nothing outside Owns.
- `plugins/**/*.md` is not formatted — keep the router's fold width.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`feat: SwiftUI router links the platform and integration references`
