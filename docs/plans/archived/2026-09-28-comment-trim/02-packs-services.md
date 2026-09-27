# U2 — Trim the service, framework and capability packs

- **Wave:** 1
- **Depends on:** —
- **Owns:** under
  `plugins/stackgen/stacks/{cloud-service,framework,capability-provider}/*/`:
  `config/**`, `hooks/**`, `conventions.md` — today containers, workers-ssr,
  workers-static-assets, astro, html, doppler, fnox
- **Model:** opus
- **Kind:** edit
- **Read first:** each pack's `pack.yaml` and `conventions.md`, then its payload
  files top to bottom before editing.
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md:520-567` (how
  `MARKED POSITION` comments are read).

## Ruling

> - Decision 1 — Scope: The shipped files — tool-config assets, pack payloads
>   and pack hooks — plus this repo's repo-only tooling. This repo's landed
>   copies of the assets and its root `.gitignore` wait for the next
>   `/vwf:setup reshape` (gate-hardening B6).

> - Decision 3 — The trim rule: Keep every comment a tool or skill reads:
>   `#MISE`/`#USAGE`, shebangs, `# shellcheck` directives, `# >>>`/`# <<<`
>   markers, `MARKED POSITION` lines, grype reason comments, fill-in templates,
>   and any comment a reference names as load-bearing. Keep a single-line
>   warning where a reader would otherwise break something non-obvious. Every
>   longer explanation goes: dropped when the owning reference already says it,
>   moved into that reference (tool-config `references/*.md`, the pack's
>   `conventions.md`) when it does not. Repeated boilerplate goes; a directive
>   under it stays.

> - Decision 6 — Proof that only comments changed: After each wave, the
>   orchestrator compares every touched file before and after with comment and
>   blank lines stripped; the diff must be empty. No review row.

## Edits

1. **Every payload file** under the owned packs' `config/**`, and the fnox hook
   `hooks/fnox-ciphertext-guard.sh`. Highest volume first: the three
   `wrangler.jsonc` (JSONC `//` comments), the three
   `.config/mise/tasks/p/_project/deploy`, the two
   `.config/mise/tasks/p/_project/icons`.
2. **The "helpers ships with stackgen:tool-config…" sentence** above each
   `# shellcheck source=/dev/null` directive: remove the sentence, keep the
   directive.
3. **The "THIS FILE SHIPS UNDER `p/_project/` AND MUST BE RENAMED…" block** (~14
   lines in each deploy and icons): cut to one line saying the file is renamed
   per project on landing; the rest moves to the pack's `conventions.md` when it
   is not already there.
4. **`MARKED POSITION` blocks** (the `wrangler.jsonc`, deploys and icons): keep
   the marker line and whatever a filler needs to identify the value; the
   explanatory paragraph goes, moved to `conventions.md` when it lacks it.
5. **The byte-identical pair** `framework/astro` and `framework/html`
   `p/_project/icons` stay byte-identical after the trim.
6. Moved explanations go into that pack's `conventions.md`, in its voice. Keep
   each file's structure: no reordering, no value or code changes.
7. Format a payload file only with the **shipped** dprint config
   (`plugins/stackgen/skills/tool-config/assets/dprint/.config/dprint.json`),
   never this repo's.

## Verification

- `mise run p:plugins:check` and `mise run p:plugins:shellcheck` green.
- Per file, the counts of `MARKED POSITION`, `#MISE`, `#USAGE`, `# shellcheck`
  and `// >>>`/`// <<<` lines are unchanged.
- `cmp` of the astro and html `p/_project/icons` succeeds.
- Run the comment-stripped comparison the index's *Gates the orchestrator keeps*
  describes over your files yourself before returning; it must be empty.
- Report the before/after comment-line totals per pack in `DECIDED:`.

## Guardrails

- Touch no `pack.yaml` (U7 bumps versions), no bundle, no `inventory.md`, and no
  pack outside the three owned types (U3 owns the rest).
- Never change a value, a key, a code line or a directive.
- `plugins/**/*.md` is not dprint-formatted: match fold width by hand.
- Delete with `rm`, never `git rm`; never run `git checkout`/`git restore` or a
  formatter's `--fix` outside Owns.

## Commit

`refactor: trim service, framework and capability pack comments`
