# W1 — init pass 1 exempts `.vscode/`; pass 7 is named for what it holds

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/references/existing-repo.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `existing-repo.md` at `:20-45` (the "ten passes"), `:85-125`
  (pass 1's strays and exempt kinds), `:640-660` (pass 7); commit `c62e2445`'s
  diff of this file for the removed fifth kind's wording.

## Ruling

> G1 — Pass 1 exempts `.vscode/` by name, as the user's — a fifth kind beside
> `.git/`, `.gitmodules`, `.claude/` and member paths; `.idea/` stays reported.

> G2 — Retitle §7 for its live rows (the ignore file, the template fallback) and
> drop the "Retired" line; still ten passes, numbers unchanged.

## Edits

1. Pass 1: "Four kinds" → "Five kinds". Add a bullet for **`.vscode/`** — named
   explicitly, by name — saying it is the user's editor settings: no pack lands
   it (output-tree's fence), `init` writes nothing there, and no pass reads it,
   so listing it would be a permanent finding in every repo whose owner uses
   that editor. Do not cite the retired fragment convention. Update the closing
   paragraph's count and its breakdown ("all four sit outside that question —
   two are git's, one is this command's own output, and the fourth is a
   repository of its own") to cover five, the fifth being the user's.
2. Pass 7: retitle `### 7 — Editor fragments` to a heading naming its live
   content — the ignore file and the template fallback — and remove the "Retired
   — …" paragraph. Keep the two live rows' meaning unchanged. Keep "ten passes"
   and every pass number.
3. Keep the fold width by hand (this tree is not formatted); code spans stay on
   one line.

## Verification

- `grep -n '\.vscode/' plugins/vwf/skills/init/references/existing-repo.md`
  shows the pass-1 bullet.
- `grep -n -i 'retired' plugins/vwf/skills/init/references/existing-repo.md` no
  longer shows a pass-7 "Retired" line.
- `grep -c 'ten passes' plugins/vwf/skills/init/references/existing-repo.md`
  unchanged (3).
- `mise run p:plugins:check` green.
- The full wave gate.

## Guardrails

- Touch no other pass, and no other file.
- Delete with `rm`, never `git rm`.

## Commit

`fix: init pass 1 exempts .vscode/ as the user's; pass 7 named for its rows`
