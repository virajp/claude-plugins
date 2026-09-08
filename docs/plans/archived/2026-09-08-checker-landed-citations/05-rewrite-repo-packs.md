# U5 — Rewrite the repo-level packs' citations (capability providers, mise, gates, hygiene)

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/{capability-provider,toolchain-manager,toolchain-gate,repo-hygiene}/**`
- **Model:** opus
- **Read first:** every owned file that a grep below reports, top to bottom,
  before editing it.
- **Lazy-load:** `plugins/stackgen/assets/ids.md` (read-only, to write the
  invariant accurately), `assets/contracts/secrets.md` and
  `assets/contracts/local-stack.md` (the capability providers' two main
  citations), `assets/kinds.md` and `assets/pack-format.md` (the hygiene pack's
  two). Never edit anything under `assets/`.

## Ruling

Quoted from index.md:

> **1. Rule 13 scope.** Refuse all four citation forms in landed tiers: (a) the
> literal `${CLAUDE_PLUGIN_ROOT}` anywhere; (b) bare `assets/<path>.md`; (c) a
> `../` chain leaving the file's own `skills/<name>/` directory; (d) a path into
> another pack.
>
> **8. Rewrite doctrine.** Name the cited asset **by role** when the sentence
> already carries its own reason; **state the rule inline** when the passage
> depends on the cited content. Never delete a sentence to satisfy the rule.
>
> **9. Canonical role names.** `contracts/<x>.md` → "stackgen's <x> contract";
> `output-tree.md` → "stackgen's output charter"; `taxonomy.md` → "stackgen's
> taxonomy"; `kinds.md` → "stackgen's kind vocabulary"; `pack-format.md` →
> "stackgen's pack format"; `artifact-doctrine.md` → **never named**, its rule
> stated inline.
>
> **11. ids.md.** Both mise-pack citations reduce to the invariant: `REPO_NAME`,
> the `p:<id>:*` group, the member flag and the `setup-<id>` alias carry one
> identical token, the one `/vwf:init` showed and the user confirmed. The slug
> derivation stays single-sourced in ids.md.

Why: these files are copied verbatim into a target repo where no stackgen asset
exists. The mise pack is special: its `config/` tier is the target repo's own
task library, and `/vwf:init` (a vwf skill, installed wherever a repo is shaped)
is what reads ids.md and confirms each slug with the user — so the pack needs
only the invariant its tasks depend on, never the derivation.

## Edits

The survey found: `capability-provider` 14 form-(b) hits across 12 files (`fnox`
6 files / 8 hits, `doppler` 3 files, the rest in `oidc`, `otel-lgtm`,
`temporal`); `toolchain-manager/mise` 2 form-(a) and 1 form-(b) across 3 files;
`toolchain-gate` 2 form-(b) across 2 files; `repo-hygiene/repo-hygiene` 2
form-(a) in `conventions.md:7` (kinds.md) and `:115` (pack-format.md).

```sh
cd plugins/stackgen/stacks
D="capability-provider toolchain-manager toolchain-gate repo-hygiene"
grep -rn 'CLAUDE_PLUGIN_ROOT' $D
grep -rnE '(^|[^A-Za-z0-9_./])assets/[A-Za-z0-9_./-]+\.(md|ya?ml)' $D
grep -rnE '(^|[^A-Za-z0-9_])(\.\./)+[A-Za-z0-9_./-]+' $D --include='*.md'
grep -rnE '(^|[^A-Za-z0-9_./-])(app-framework|capability-provider|ci-system|cloud-provider|cloud-service|datastore|deploy-target|design-tool|framework|language|package-manager|repo-hygiene|toolchain-gate|toolchain-manager)/[a-z0-9-]+/[A-Za-z0-9_]' $D
```

Skip a hit inside a fenced code block (two fenced `extends` examples in
`toolchain-gate/tsconfig/skills/tsconfig/SKILL.md:102,110` are **valid** and
untouched) and a `../` that stays inside the same `skills/<name>/` directory.
Per hit, in order of preference:

1. **The sentence already carries its reason** — drop the path and name the
   asset by its canonical role, or drop the citation if the role adds nothing.
2. **The sentence depends on the cited content** — state that one fact inline
   and name the asset by role as its source.
3. **The two ids.md citations**,
   `toolchain-manager/mise/skills/mise/SKILL.md:147` and
   `toolchain-manager/mise/skills/mise/references/task-library.md:462`: replace
   each with the invariant of decision 11, worded for its spot. The
   `task-library.md:462` sentence currently says the asset "is the rule and the
   measured reason behind it, and nothing here restates either" — replace that
   whole sentence with: the four surfaces (`REPO_NAME`, the `p:<id>:*` group,
   the member flag, the `setup-<id>` alias) carry one identical project-id
   token, which `/vwf:init` derives, shows and has the user confirm before any
   of them is written; a mismatch between any two is a defect, and this library
   never derives the id itself.
4. **`repo-hygiene/conventions.md:7`** (kinds.md) — "stackgen's kind
   vocabulary"; **`:115`** (pack-format.md) — "stackgen's pack format", or state
   inline the one fact the sentence needs (likely the `_licenses/` pack-private
   rule).

Keep every sentence's meaning. Match the surrounding fold width by hand —
`plugins/**/*.md` is **not** dprint-formatted. Do not reflow a paragraph you did
not change.

## Verification

- The four greps above return nothing outside fenced blocks.
- `node scripts/src/check.ts 2>&1 | grep -E 'stacks/(capability-provider|toolchain-manager|toolchain-gate|repo-hygiene)/'`
  prints nothing once U1 has landed (concurrent — the greps are the check until
  then).
- No new rule-12 (retired vocabulary) finding in your Owns.
- `mise run plugins:shellcheck` still green — you should not have touched a
  shell file, and this proves it.
- `git diff --stat` touches only files under your Owns.

## Guardrails

- Do not touch anything under a pack's `config/` tier. The survey found no
  citation there; if a grep reports one, report it as a `GAP:` with the line and
  leave it — that tier is byte-copied payload and formatted by the shipped
  config, not this repo's.
- Do not touch the pnpm pack's `hooks/` or the fnox pack's `hooks/` scripts.
- Do not edit `assets/ids.md` or anything under `assets/`, and no doc.
- Do not touch frontmatter on any SKILL.md beyond a line a grep reported.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.
- A hit you cannot rewrite without inventing doctrine is an `UNRESOLVED:`.

## Commit

`refactor(stackgen): repo-level packs cite assets by role; the mise pack carries the project-id invariant, not the slug rule`
— written by the orchestrator after the wave gate, not by the unit.
