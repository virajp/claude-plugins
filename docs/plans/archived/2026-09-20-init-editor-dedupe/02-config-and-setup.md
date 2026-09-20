# U2 — the config key and the format bump

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/vwf-config.md`,
  `plugins/vwf/skills/setup/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing —
  `vwf-config.md` in full, its `enforcement` block (`:105-115`), the
  `config_format` bump rule (`:256-262`) and the migration notes at the end of
  the file; `setup/SKILL.md`'s migration step (`:147` and the procedure around
  it).
- **Lazy-load:** none.

## Ruling

Decision 3 — Persistence: "`enforcement.editor_keys: {}` beside `kept_files` in
the base's `.config/vwf.yaml`: `<file>: { <key>: keep | take | union }`, the
file path base-relative with the member prefix exactly as `kept_files` spells
it. A recorded answer applies on every later run without asking; editing the
block is how a user is re-asked. `config_format` 19 → 20 with a migration note;
`setup` adds the empty block on migrate. `init` now writes two keys into the
config."

The bump rule, quoted from `vwf-config.md:256-262`: "`config_format` versions
this file's own schema; bump it (with a migration note here) when a key's shape
changes. A bump never lands on 13 or 17". 20 is neither.

## Edits

1. **`plugins/vwf/assets/vwf-config.md`** — `config_format: 19` → `20` at `:41`;
   a new line under `enforcement` beside `kept_files` (`:111`):
   `editor_keys: {} # FORMAT 20. <file>: { <key>: keep | take | union } — …` in
   the same comment style, stating: the file path rule (base-relative, member
   prefix, as `kept_files`), the three values and what each makes the
   composition do, who writes it (`init`, consented in its single plan) and who
   reads it (`init` alone — doctor does not read `.vscode`), and that an absent
   block reads as empty. The writers table (`:214`) — `init`'s cell reads
   `kept_files` and `editor_keys`. A migration note at the end of the file in
   the shape of the existing ones (`:518` is the latest): 19 → 20 adds
   `enforcement.editor_keys: {}` where the block exists, and nothing else moves;
   readers of 19 tolerate the absent key.
2. **`plugins/vwf/skills/setup/SKILL.md`** — the migration procedure that steps
   the stamp (around `:147`) names 19 → 20 as: add `enforcement.editor_keys: {}`
   when absent, bump the stamp, nothing else. Any passage that names 19 as the
   current format reads 20.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "config_format: 20" plugins/vwf/assets/vwf-config.md` — one hit.
- `grep -n "editor_keys" plugins/vwf/assets/vwf-config.md plugins/vwf/skills/setup/SKILL.md`
  — hits in both.
- `grep -n "config_format.*19\b" plugins/vwf/skills/setup/SKILL.md` — no passage
  still names 19 as current.

## Guardrails

- Do not edit `plugins/vwf/skills/init/**` (U1) or `plugins/stackgen/**` (U3).
- No doc outside the two owned files — `DOCS FALSIFIED:` lines (this repo's own
  `.config/vwf.yaml` does not exist; nothing here to migrate).
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand; the
  config file's comment lines are long single lines by convention — keep that.
- Delete with `rm`, never `git rm`.

## Commit

`feat: config format 20 — enforcement.editor_keys` — written by the orchestrator
after the wave gate. Type from `.config/git-conventional-commits.yaml`; no
scopes.
