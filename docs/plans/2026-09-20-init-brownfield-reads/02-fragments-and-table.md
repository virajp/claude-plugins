# U2 — the tool-config table, the .gitignore merge, the licence spellings

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/references/tool-configs.md` (new),
  `plugins/vwf/skills/init/references/fragments-and-sections.md`,
  `plugins/vwf/skills/init/references/readme-and-license.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the two existing owned files, top to bottom —
  `fragments-and-sections.md:30-63` (the ignore append), `:101-119` (the hook
  merge), `:259-267` (the Deferred rule for editor answers);
  `readme-and-license.md:51-56` (LICENSE kept), `:114-119` (the renovate
  caveat).
- **Lazy-load:** the packs' `config/` trees under
  `plugins/stackgen/stacks/toolchain-gate/*/`, `toolchain-manager/mise/` and
  `repo-hygiene/repo-hygiene/`, only to confirm each tool's landed path;
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md:36-38`
  (Renovate's root-first discovery) and `:60-65` (the ignore-section rule);
  `plugins/stackgen/assets/output-tree.md:158-166` (the allowlist).

## Ruling

Decision 1 — Root tool configs: "A **tool-config table** — one row per tool a
pack ships: the tool, its known root spellings (`.pre-commit-config.yaml`;
`.mise.toml`, root `mise.toml`; `.gitleaks.toml`; `.grype.yaml`; `.dprint.json`,
root `dprint.json`; `.github/renovate.json`, `.renovaterc`, `renovate.json`;
`.github/dependabot.yml`), the `.config/` path the pack lands, and the merge
shape."

Decision 3 — `.gitignore`: "A **section merge** replaces the binary offer: the
repo's file is kept whole; each pack banner section whose patterns are not
already present is appended; patterns compared **normalised** — leading `/` and
trailing `/` stripped, a `**/` prefix ignored, blank and comment lines skipped.
A pattern present under a different spelling is never doubled."

Decision 6 — Hashes, the part this unit carries: the ignore append, the hook
merge and the editor block each end by naming that init re-hashes the file at
the end of the run (the mechanism is `existing-repo.md`'s; cite it).

Decision 7 — "`LICENSE`, `LICENSE.md`, `LICENCE`, `COPYING` all count as
"already carries a licence file"."

Decision 8, the Deferred rule half: the editor-answer Deferred rule
(`fragments-and-sections.md:259-267`) goes — the stub config U3 adds is the
home.

## Edits

1. **`tool-configs.md`** — new reference: one table, the columns *tool* · *root
   spellings* · *pack path* · *merge shape* (`move-and-offer` for a whole-file
   config; `yield` for the renovate twin; `move-and-split` for a root
   `mise.toml`, per decision 7's rule in `existing-repo.md`), one row per tool
   in decision 1's list, plus a one-paragraph lead-in saying pass 1 reads it and
   how a row becomes a plan row (cite `existing-repo.md`'s pass 1, do not
   restate the outcomes). Name the file in the same style as the other
   references; no frontmatter.
2. **`fragments-and-sections.md:30-63`** — the append becomes the section merge
   of decision 3: keep the file whole, append absent banner sections, the
   normalisation rules, never double a pattern; the passage that described the
   binary offer's consequence (base sections never reach a kept file) is
   replaced by "every file gets the sections it lacks". `:101-119` and
   `:278-290` end with the re-hash sentence. `:259-267` — the Deferred rule for
   an editor answer on a repo without a config file goes; cite the stub config
   (U3's) by name.
3. **`readme-and-license.md:51-56`** — the licence spellings of decision 7;
   `:114-119` — the renovate caveat corrected: the file lands at the root, which
   is where Renovate reads first; a repo's `.github/renovate.json` or
   `.renovaterc` wins and the pack's is not landed (decision 1).

## Verification

- `mise run p:plugins:check` green (rule 6 — if the new reference is cited with
  `${CLAUDE_PLUGIN_ROOT}`, the path must resolve).
- `command ls plugins/vwf/skills/init/references/tool-configs.md` — exists.
- `grep -n "normalised\|normalized" plugins/vwf/skills/init/references/fragments-and-sections.md`
  — the merge rule names it.
- `grep -n "COPYING" plugins/vwf/skills/init/references/readme-and-license.md` —
  present.
- grep `readme-and-license.md` for the phrase "under .config/" — zero hits in
  the renovate passage.

## Guardrails

- Do not edit `existing-repo.md` (U1), `SKILL.md` or `new-repo.md` (U3), or any
  pack (U4).
- No doc — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: init tool-config table; .gitignore section merge; licence spellings` —
written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
