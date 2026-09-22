# U2 — init writes the answers it asks

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/init/references/existing-repo.md`,
  `plugins/vwf/skills/init/references/fragments-and-sections.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `SKILL.md:76-84` (the stub rule — the passage that names the
  keys init writes), `:360-367` (the provider ignore section), `:387-393` (q7
  and q8), `:492` (q4), `:605` (the passage that says nothing is written),
  `:631-639` (the plan summary and the Skipped heading), `:719-726` (the
  `answers:` map every fetch carries); `new-repo.md:97-135` (§2's axis table);
  `existing-repo.md` — the report's sections and where the config stub is
  written on a reshape; `fragments-and-sections.md:317-325`
  (`enforcement.editor_keys`).
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` (U1's — the `answers:`
  schema, cited by key name, never edited).

## Ruling

Decision 2 — Who writes it: "**Init writes the block**, in every mode, as part
of the pass that writes the stub — a third key it owns beside `kept_files` and
`editor_keys`. No other skill writes the block, with one exception: a caller
that reads a **stale forge** (the recorded value differs from the live `origin`
host) rewrites **that one value** and says so. Setup's pass and sync never write
any other key."

Decision 1, init's part: the block's shape — `editor` and `secrets` once,
`repos:` keyed by member path (`.` for the base) each carrying `forge` and
`update_bot`, every key always present, `none` where nothing was picked or read.

Decision 3, init's part: "Every caller reads the forge from `origin` at run time
and passes **that** as the `forge` axis; the recorded value is the record and
the fallback for a repo with no remote reachable."

## Edits

1. **`SKILL.md`** — the stub rule (`:76-84`) writes three keys: `config_format`,
   `enforcement` and `answers`. The pass that writes the config records the
   block from the answers this run holds — the editor (q7) and the provider slug
   (q4) once, the forge (each repo's live `origin` host) and the update bot (q8)
   per repo, keyed as `kept_files` keys a member — in **every** mode, on a repo
   whose config already exists as much as on the stub. Replace `:605`: the two
   answers **are** written into the tree now, under `answers:`, and a later run
   reads them rather than asking again — a reshape still asks, seeded by the
   recorded value. One sentence at `:719-726`: the map every fetch carries is
   the recorded block with the forge refreshed from `origin`, and a recorded
   forge that no longer matches the live host is rewritten in place, reported in
   the run's own summary.
2. **`new-repo.md:97-135`** — §2's axis table gains the source of each value
   **after** the first run: the config's `answers:` block, the forge always
   re-read. State the rule that the block is written as part of the landing
   pass, and that the recorded value is the fallback only where `origin` cannot
   be read at all.
3. **`existing-repo.md`** — the reshape path records the block the same way, and
   its report names the answers recorded, so a reshape on a repo that has no
   block (a `config_format` 20 config) visibly gains one.
4. **`fragments-and-sections.md`** — one sentence where `editor_keys` is
   described (`:317-325`): the editor **answer** now lives under
   `answers.editor` and the collision record stays what it is — two different
   things in two different blocks.

## Verification

- `mise run p:plugins:check` green (rule 10 — no technology token in `SKILL.md`:
  say "the editor", "the update bot"; `vscode` and the bot names appear only as
  axis values in the references).
- `grep -n "answers" plugins/vwf/skills/init/SKILL.md plugins/vwf/skills/init/references/new-repo.md plugins/vwf/skills/init/references/existing-repo.md`
  — hits in all three.
- `grep -n "written into the tree\|asks again" plugins/vwf/skills/init/SKILL.md`
  — no passage still says the answers are unrecorded.

## Guardrails

- Do not edit the config asset (U1), setup (U3), stackgen (U4) or doctor (U5).
- `enforcement.editor_keys` and `kept_files` keep their meaning — this unit adds
  a third key, it does not move the other two.
- No doc outside the four owned files — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand;
  strict-YAML frontmatter untouched.
- Delete with `rm`, never `git rm`.

## Commit

`feat: init records the four conditional answers in the config` — written by the
orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
