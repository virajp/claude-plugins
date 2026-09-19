# U3 — hygiene pack: the fallback lines, the security template, 1.1.1

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/**`,
  `plugins/stackgen/stacks/bundles/repo-hygiene.md`,
  `plugins/stackgen/stacks/inventory.md` (regenerated, never hand-edited)
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing — `pack.yaml`,
  `conventions.md`, `config/CONTRIBUTING.md`, `config/SECURITY.md`, the bundle
  file.
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md` (the marked-position
  and placeholder conventions);
  `.claude/skills/plugin-authoring/references/checks.md:34-210` (rules 11 and
  13, which walk this pack).

## Ruling

Decision 9 — Hygiene pack: "`config/CONTRIBUTING.md`'s by-hand default-branch
line becomes the fallback — "`/vwf:init` sets this on GitHub and GitLab;
elsewhere run …" — and gains the protection rules of decision 4 in the same
by-hand form; `config/SECURITY.md` accepts an email; `conventions.md`
§licence-and-security records the visibility rule. **Patch** `1.1.0` → `1.1.1`;
the bundle pin follows and U3 runs `mise run p:plugins:inventory` so the three
land in one commit."

Decision 4 — the rules the by-hand form states: on both `develop` and `main`, no
force-push, no deletion; require a pull request only when the landing model is
`pr`.

Decision 2 — Security contact: "a `private` repo is asked a free contact — an
email or an internal URL — with no default; decline writes no `SECURITY.md`
either way."

Decision 1 — the visibility rule `conventions.md` records: a `private` repo gets
no licence row and no LICENSE; a `public` repo keeps MIT / Apache-2.0 / none.

## Edits

1. **`config/CONTRIBUTING.md`** (`:34-36` today) — the default-branch paragraph
   is reworded: init's forge pass sets the default branch and protects `develop`
   and `main` on GitHub and GitLab; on another forge the maintainer sets them
   once by hand — the existing `gh repo edit` / `glab repo update` line stays as
   the example, and a second by-hand line states the protection rules in plain
   words (the three rules, the PR one conditional on the landing model). Cite
   nothing by plugin path (rule 13): this file lands in a repo with no plugin.
2. **`config/SECURITY.md`** (`:5-6`) — the sentence around the contact
   placeholder reads naturally whether the splice is a URL or an email ("report
   it at / to <contact>" or equivalent); the placeholder name is unchanged so
   init's splice still matches.
3. **`conventions.md`** (`:167-177`, licence and security policy) — record the
   visibility rule: LICENSE is copied only for a public repo; the security
   contact is an advisory URL for a public repo and a free contact for a private
   one. The landed-files table (`:16-26`) is unchanged unless a cell's wording
   now reads false.
4. **`pack.yaml:5`** — `1.1.0` → `1.1.1`.
5. **`plugins/stackgen/stacks/bundles/repo-hygiene.md:7`** — the pin
   `repo-hygiene/repo-hygiene@1.1.0` → `@1.1.1`.
6. Run `mise run p:plugins:inventory` so `plugins/stackgen/stacks/inventory.md`
   carries the new version at its two rows (`:91`, `:162` today).

## Verification

- `mise run p:plugins:inventory -- --check` green (the pin and the inventory
  agree).
- `mise run p:plugins:check` green — rule 11 walks the `config/` tier, rule 13
  refuses a plugin path in anything this pack lands.
- `grep -rn "CLAUDE_PLUGIN_ROOT\|assets/\|\.\./" plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/`
  — zero hits.
- `grep -n "1.1.1" plugins/stackgen/stacks/repo-hygiene/repo-hygiene/pack.yaml plugins/stackgen/stacks/bundles/repo-hygiene.md plugins/stackgen/stacks/inventory.md`
  — a hit in each.

## Guardrails

- `config/` is **payload**, excluded from every formatter — never run dprint or
  the linter over it; edit by hand and keep the file's existing style.
- The two `_licenses/*.txt` catalogue files are untouched — the licence texts do
  not change, only when they are copied.
- No doc outside this pack — report every falsified passage as `DOCS FALSIFIED:`
  (the stackgen site page describes this pack).
- Do not touch `plugins/vwf/**` (U1, U2, U4).
- The pack bump, the pin and the regenerated inventory must all be in the tree
  when the orchestrator commits this unit — never return with one of the three
  missing.
- Delete with `rm`, never `git rm`.

## Commit

`ops: repo-hygiene 1.1.1 — forge-pass fallback lines, contact accepts an email`
— written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml`; no scopes.
