# U3 — the `stacks:` roster in the schema; setup names the three modes

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/vwf-config.md`,
  `plugins/vwf/skills/setup/SKILL.md`,
  `plugins/vwf/skills/setup/references/onboard-pipeline.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the three owned files, top to bottom, before editing —
  `vwf-config.md:41-142` (the format-20 schema, `:112` the retirement note),
  `setup/SKILL.md:62-80` (reshape), `:126-142` (Step 0), `:168-174` (the
  blank-vs-code fork), `onboard-pipeline.md:3-5, 12, 85`.
- **Lazy-load:** `plugins/vwf/assets/stack-adapter.md:53-59, 171` (where the
  roster is documented today); `plugins/vwf/skills/init/SKILL.md:239-259` (where
  it is read — U1's, cite only).

## Ruling

Decision 6 — `stacks:` roster: "Documented in `vwf-config.md` where init reads
it (`I/SKILL.md:239-259`) as the adapter roster, with the `:112` retirement note
corrected to name `enforcement.stacks`; **no** `config_format` bump — the key is
already read and written."

Decision 1 — Mode, the part setup carries: "Init still takes no argument;
setup's fork stays for its onboard sub-paths." Setup's Step 0 offer and its
reshape line describe init as deciding `blank`, `source` or `shaped` from the
tree.

## Edits

1. **`vwf-config.md`** — add the top-level `stacks:` key to the format-20 schema
   block (`:41-142`) with a comment in the file's style: the adapter roster, a
   list of stack-plugin names (`[stackgen]` today), written by setup, read by
   init, setup's topology and workspace references and the adapter's menu skill
   (cite the four readers by path); mark it "present since format 10 as the
   roster; the retired `stacks:` of the `:112` note was `enforcement.stacks`".
   Correct `:112`. The writers table gains the row. No migration note, no bump.
2. **`setup/SKILL.md`** — `:168-174`: the fork's paragraph gains one sentence:
   init re-derives the same evidence and decides `blank`, `source` or `shaped`
   for each repo; this fork chooses setup's onboard sub-path only. Step 0
   (`:126-142`) and the reshape line (`:74-80`): where they say init "shapes" or
   "lays down", one clause that a source-bearing repo is shaped as `source`, its
   existing files offered, never overwritten.
3. **`onboard-pipeline.md:3-5, 12, 85`** — the same clause at the lead-in; the
   Blank and Code branches unchanged.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "^stacks:" plugins/vwf/assets/vwf-config.md` — one hit inside the
  schema block.
- `grep -n "enforcement.stacks" plugins/vwf/assets/vwf-config.md` — the
  corrected note.
- `grep -n "config_format: 20" plugins/vwf/assets/vwf-config.md` — unchanged.
- `grep -n "source" plugins/vwf/skills/setup/SKILL.md` — the mode named at the
  fork.

## Guardrails

- Do not edit `init/**` (U1, U2) or any pack (U4).
- No format bump; no migration note.
- No doc outside the three owned files — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand; the
  config file's comment lines are long single lines by convention.
- Delete with `rm`, never `git rm`.

## Commit

`docs: vwf-config documents the stacks roster; setup names init's three modes` —
written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
