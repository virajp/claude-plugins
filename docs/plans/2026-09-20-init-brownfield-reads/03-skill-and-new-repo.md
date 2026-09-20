# U3 — SKILL.md and new-repo.md: the shared post-landing steps, the stub config

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom (plan 2 re-shaped the mode
  table and added the stack read — locate passages by heading): `SKILL.md`'s
  plan summary (`:70-78`), the questions (`:268-270`, q4 `:355-373`, 6a
  `:426-434`, 6b `:436-445`), the licence rule (`:433-434`), the `kept_files`
  sentence; `new-repo.md` §3 (`:77-86`), §4 (`:88-112`), §8 (`:386-390`), §9
  (`:392-430`), §10 (`:432-446`), §11.
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md:41-142` (the config schema —
  the stub carries `config_format` and `enforcement` only; read, never edit);
  `existing-repo.md` (U1's — cite the pass that calls each section).

## Ruling

Decision 5 — Post-landing steps: "After its landing and before the git pass, the
existing pipeline runs `N` §3 (placeholders), §4 (licence and security files),
§8 (secrets provider), §9 (fills it does not already own) and §10 (the
aggregator offer) exactly as `N` states them — cited by section, not restated;
every mode shares those five steps."

Decision 8 — Config home: "When no `.config/vwf.yaml` exists, init writes a
**stub** carrying `config_format` and the `enforcement` block alone so
`kept_files` and `editor_keys` have a home; setup's migration and fill passes
complete it later; the Deferred rule for those two keys goes."

Decision 7, the licence half: "`LICENSE`, `LICENSE.md`, `LICENCE`, `COPYING` all
count".

## Edits

1. **`new-repo.md`** — §3, §4, §8, §9 and §10 each gain one lead-in sentence
   stating they run in every mode, after the mode's landing and before the git
   pass (the `shaped` and `source` pipelines call them from `existing-repo.md`'s
   post-landing paragraph — cite it); §9 says which fills the existing
   pipeline's pass 9 already owns and are skipped here. The passage that says
   init writes one or two keys into `.config/vwf.yaml` gains the **stub** rule
   of decision 8: the file, its two blocks, and that setup completes it.
2. **`SKILL.md`** — the plan summary (`:70-78`) lists the five shared steps once
   for every mode; the `kept_files` / `editor_keys` sentence names the stub;
   `:433-434` the licence spellings; any "Deferred when no config file" sentence
   goes.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "every mode" plugins/vwf/skills/init/references/new-repo.md` — at
  least five hits (one per section).
- `grep -n "stub" plugins/vwf/skills/init/SKILL.md plugins/vwf/skills/init/references/new-repo.md`
  — hits in both.
- `grep -n "COPYING" plugins/vwf/skills/init/SKILL.md` — present.
- `grep -n "Deferred" plugins/vwf/skills/init/SKILL.md` — no remaining rule for
  a keep or an editor answer without a config file.

## Guardrails

- Do not edit `existing-repo.md` (U1) or the three U2 files; cite.
- No doc — `DOCS FALSIFIED:` lines.
- Rule 10 — no technology token in `SKILL.md` prose.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand;
  strict-YAML frontmatter untouched.
- Delete with `rm`, never `git rm`.

## Commit

`feat: init runs the post-landing steps in every mode; a stub config homes kept_files`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
