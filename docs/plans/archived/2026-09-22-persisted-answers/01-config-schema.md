# U1 — the config schema: the `answers:` block and `config_format` 21

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/vwf-config.md`,
  `plugins/vwf/skills/setup/references/format-lineage.md`,
  `plugins/vwf/skills/setup/references/migrate-pipeline.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `vwf-config.md:41-44` (the stamp), `:113-117` (the
  `enforcement:` block and its two keys), `:221` (the ownership row), `:263-269`
  (the bump rule), `:605-615` (the 19 → 20 precedent — the shape this bump
  copies); `format-lineage.md:126` (the `editor_keys` row);
  `migrate-pipeline.md:24-32` (step 1, where a missing `enforcement` key becomes
  one entry gaining `{}`).
- **Lazy-load:** `plugins/vwf/skills/init/SKILL.md:76-84` (U2's — the stub rule;
  cite it, never edit it).

## Ruling

Decision 1 — The key: "`.config/vwf.yaml` gains a top-level **`answers:`**
block: `editor` and `secrets` once for the product; `repos:` keyed by the member
path exactly as `enforcement.kept_files` spells one (`.` for the base) and each
entry carrying `forge` and `update_bot`. Every key is always present, `none`
where no answer was picked or nothing could be read. `config_format` steps 20 →
21."

Decision 2, the schema's part: "**Init writes the block**, in every mode, as
part of the pass that writes the stub — a third key it owns beside `kept_files`
and `editor_keys`. No other skill writes the block, with one exception: a caller
that reads a **stale forge** (the recorded value differs from the live `origin`
host) rewrites **that one value** and says so."

Decision 5, the schema's part: a config carrying `config_format` 20 and no
`answers:` block is what the migration converts.

## Edits

1. **`vwf-config.md`** — the stamp at `:41-44` reads 21. A new top-level
   `answers:` section in the schema, beside `enforcement:` and in the file's own
   commented style: the two product-level keys (`editor`, `secrets`) and the
   `repos:` map, keyed the way `kept_files` keys a member path, each entry
   carrying `forge` and `update_bot`; the vocabulary of each axis as the pack
   format states it (`forge: github | gitlab`, `editor: vscode`,
   `secrets: <slug>`, `update_bot: renovate | dependabot | none`) plus the
   spelling `none`, which means *no answer* on the first three and *no bot* on
   the fourth — the one axis where a pack may name it. Say what the block is
   **for** in one sentence: the answers every materializer caller evaluates a
   `conditional:` entry against, so a landing decided at init is honoured by a
   pass that runs months later. Extend the ownership row at `:221`: init writes
   `kept_files`, `editor_keys` **and** `answers`, and no other skill writes the
   block — with the one exception decision 2 names, a stale `forge` value
   rewritten in place by the caller that read the live host. Add the migration
   note in the form `:605-615` takes: 20 → 21 adds the block, converts nothing,
   and a config still reading 20 is handled by the callers' inference rule
   (decision 5) until its next reshape.
2. **`format-lineage.md`** — one row beside `:126`, in that table's shape:
   format 21, the `answers:` block, what it added and why.
3. **`migrate-pipeline.md:24-32`** — step 1 gains the `answers:` block on the
   same terms it already gives a missing `enforcement` key: absent → the reshape
   writes it from the answers that run asks; present → left alone.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "config_format" plugins/vwf/assets/vwf-config.md | head` — the stamp
  reads 21, and no passage still calls 20 the current format.
- `grep -n "answers" plugins/vwf/assets/vwf-config.md plugins/vwf/skills/setup/references/format-lineage.md plugins/vwf/skills/setup/references/migrate-pipeline.md`
  — hits in all three.

## Guardrails

- Do not edit init (U2), setup's pass (U3), stackgen (U4) or doctor (U5).
- `blueprint_format` is a different line and is not touched.
- No doc outside the three owned files — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: config format 21 — the answers block every materializer caller reads` —
written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
