# Decision — tool-config renders mise with a shipped node script

**Date** 2026-10-01 · **Branch** `2026-10-01-tool-config-script-mise` · **Plan**
[`docs/plans/2026-10-01-tool-config-script-mise/`](../../plans/2026-10-01-tool-config-script-mise/index.md)
· **Supersedes**
[`2026-09-20-pack-intent-rendering.md`](./2026-09-20-pack-intent-rendering.md)
on rendering ("a later plan if ever"), and stackgen's artifact doctrine §4 on
only packs shipping executable scripts

## What was decided before

On 2026-09-20 rendering the exclusion lists, the grype threshold or the branch
literals from one list at init was rejected — a checker invariant was enough,
and template rendering was "a later plan if ever". stackgen's artifact doctrine
let only a pack ship an executable script; a skill was prose the session
followed.

## What changed

The user, on 2026-10-01: *"There are many items which are static and mechanical:
These must be taken care by scripts (bash or node only, don't use python) with
placeholders/comments marking positions for different inserts. Some items will
really need LLM and only those must be done using LLM."*

- **R1 — a skill-time script.** `stackgen:tool-config` ships
  `skills/tool-config/scripts/tool-config.mjs` plus `scripts/lib/`, which
  renders the mise assets at skill time, fills their `MARKED POSITION` anchors
  and writes the `# >>> <requester>` blocks. The assets stay valid working
  files; there is no second template tree.
- **D1 — node, zero dependencies.** One ESM entry and `lib/` modules, node
  built-ins only, run with the `node` on `PATH`. Checker rule 16 holds every
  `skills/*/scripts/**/*.mjs` to a node shebang and exec bit on the entry and no
  `require(` or package import anywhere. Its gate is the `scripts/` vitest
  suite, which spawns it in temp repos against a fake `mise`.
- **D8 — a flag command line.**
  `mise add-tool --name <n> --version <v> --env dev --for <pack>`,
  `all --repo <slug> --members a,b …`, and `--answers r1:ok,r2:keep-existing` in
  place of `answers=`. The output is JSON on stdout; exit 0, 2 (refused) or 1
  (fault). The seven tools not yet on the script keep the word grammar until
  plans 2 and 3.

## The alternatives rejected

- **bash** — fragile JSON handling, BSD `sed`, no `jq` on every machine.
- **python** — banned by the user.
- **Keeping the word grammar** — a flag grammar parses without guessing where a
  value ends.
