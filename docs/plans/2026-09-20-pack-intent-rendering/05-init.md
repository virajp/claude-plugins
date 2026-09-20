# U5 — init: the editor and update-bot questions, the answers to the materializer

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/init/references/fragments-and-sections.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the three owned files, top to bottom (plans 2–4 re-shape them
  — locate by heading): the questions section (`SKILL.md:268-270`, q4
  `:355-373`, the visibility round), the stack read (plan 2's section), the
  editor merge input (`fragments-and-sections.md:152-155`), the section resolver
  (`:30-63`), the landing step in `new-repo.md` where the materializer is
  invoked.
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md` and
  `…/materializer.md` (U1's — the four axes and the answers they take; cite by
  name); `plugins/vwf/skills/init/references/tool-configs.md` (plan 3's table —
  the survey's update-bot evidence).

## Ruling

Decision 1, init's part: "The materializer evaluates `when:` against the answers
init passes it".

Decision 2 — Two new questions: "Init asks **editor** — once per product, "is VS
Code the editor here?", default yes when `.vscode/` or `code` exists — and
**update bot** — per repo, `renovate` / `dependabot` / `none`, seeded from the
survey (a `.github/renovate.json`, `.renovaterc` → renovate; `dependabot.yml` →
dependabot; else renovate). The count becomes **nine**; the forge (origin host)
and the provider (q4) are already known."

Decision 3, init's part: "the `fnox.local.toml` line … becomes an ignore-section
row keyed on the provider slug `fnox` (the stack read passes the pinned provider
as a component)".

## Edits

1. **`SKILL.md`** — two new rounds in the questions section, after the
   visibility round: **editor** (once, default rule as ruled) and **update bot**
   (per repo, the seed rule as ruled); every passage that counts the questions
   reads nine; the plan summary says which answers the materializer receives
   (forge from the origin host, editor, the provider slug from q4, the update
   bot) and that a skipped path is listed in the plan under its own heading.
2. **`new-repo.md`** — the landing step passes the four answers to the
   materializer (cite its evaluation step by name); the plan's shape gains the
   "skipped" rows; the questions' mechanics for the two new rounds (where the
   file carries them).
3. **`fragments-and-sections.md`** — `:152-155`: the editor merge's input is
   every `vscode.d/*.jsonc` **that landed** (a skipped fragment is not read);
   the section resolver (`:30-63`) takes the pinned provider slug as one more
   component so the hygiene table's provider row applies.

## Verification

- `mise run p:plugins:check` green (rule 10 — no technology token in `SKILL.md`;
  say "the editor" and "the update bot", name `vscode` only as the axis value in
  the reference).
- `grep -n "nine" plugins/vwf/skills/init/SKILL.md` — the count.
- `grep -n "update bot\|update_bot" plugins/vwf/skills/init/SKILL.md plugins/vwf/skills/init/references/new-repo.md`
  — hits in both.
- `grep -n "that landed\|skipped" plugins/vwf/skills/init/references/fragments-and-sections.md`
  — the merge input rule.

## Guardrails

- Do not edit the assets (U1), any pack (U3, U4), the checker (U2) or doctor
  (U6).
- Rule 10 in `SKILL.md`.
- No doc — `DOCS FALSIFIED:` lines (every "seven questions" passage in
  `CLAUDE.md`, the site and `.claude/**` is one).
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand;
  strict-YAML frontmatter untouched.
- Delete with `rm`, never `git rm`.

## Commit

`feat: init asks the editor and the update bot; answers drive the conditional landing`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
