# U5 — Gates and bump

- **Wave:** 4
- **Depends on:** U4
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, `site/package.json`, the deletion
  `docs/backlog.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/.claude-plugin/plugin.json`; `site/package.json`;
  `.claude/skills/release/SKILL.md:78-105` (the bump rule); the plan's Consent
  block.
- **Lazy-load:** `.claude/skills/plugin-authoring/references/checks.md:40-47`
  (rule 1 — plain semver, no 13 or 17 component).

## Ruling

Decisions 10 and 16, and the two Release rows, quoted:

> **10.** `rm docs/backlog.md` in U5, after the docs unit; B12 is re-added after
> landing by the `ask` step. B01–B11 stay in git history and in the archived
> plans' `backlog:` lists.

> **16.** Unchanged — `backlog` stays; no forge keyword is added.

> **Release vwf publicly** — minor — `19.33.0` → `19.34.0`, a hand edit of
> `plugins/vwf/.claude-plugin/plugin.json`; no release step, the tag waits.

> **Release site publicly** — patch — `1.1.26` → `1.1.27`,
> `mise run p:site:version`; no release step, the tag waits.

## Edits

1. **Prove nothing still names the file** before deleting it:
   `grep -rn 'docs/backlog' plugins/ readme.md .claude/skills site/src/content/docs`
   must return nothing. A hit is an `UNRESOLVED:` naming the file and the unit
   that owns it (U1: `skills/backlog/`; U2: the callers and the template; U3:
   `skills/doctor/`; U4: the docs) — do not fix it yourself, do not delete. Hits
   under `docs/memory/` and `docs/plans/` are historical and expected.
2. **`site/package.json`** — run `mise run p:site:version` **first**, bare, on
   the clean worktree the previous unit's commit left (pnpm refuses a dirty
   tree): `1.1.26` → `1.1.27`. Hand-edit nothing in this file.
3. **`rm docs/backlog.md`** — plain `rm`, never `git rm`.
4. **`plugins/vwf/.claude-plugin/plugin.json`** — `version` `19.33.0` →
   `19.34.0` (no `13` or `17` component; plain `X.Y.Z`, no `+N`); `keywords`
   untouched.
5. **`mise run p:plugins:marketplace`** — regenerates
   `.claude-plugin/marketplace.json` (the vwf ref becomes `vwf-v19.34.0`) and
   the gitignored dev manifest; stage nothing — the orchestrator commits.
6. **The full wave gate**, every line:

       mise run p:plugins:marketplace -- --check
       mise run p:plugins:inventory -- --check
       mise run p:plugins:check
       mise run code:precommit
       mise run p:site:check

## Verification

- All five gate lines green.
- `git status --porcelain` shows exactly: `plugin.json` modified,
  `.claude-plugin/marketplace.json` modified, `site/package.json` modified,
  `docs/backlog.md` deleted — nothing else.
- `python3 -c "import json;print(json.load(open('plugins/vwf/.claude-plugin/plugin.json'))['version'])"`
  prints `19.34.0`;
  `python3 -c "import json;print(json.load(open('site/package.json'))['version'])"`
  prints `1.1.27`.

## Guardrails

- Touch nothing outside the four owned paths. Never edit a skill, an asset or a
  doc to make the gate pass — report `UNRESOLVED:` instead.
- Never run `p:plugins:release`, `p:site:release`, `p:plugins:local` or
  `/release` — the first two need the user's word (the Consent block records no
  release step), the third is the orchestrator's after-landing step.
- Never `git checkout`, `git restore` or `git reset` — the worktree holds four
  units' committed work.
- Delete with `rm`, never `git rm`.
- `p:site:version` takes no positional and refuses a dirty tree — run it before
  every other edit in this unit.

## Commit

`ops: vwf 19.34.0, site 1.1.27 — backlog on GitHub Projects` — written by the
orchestrator after the wave gate. `ops` is in
`.config/git-conventional-commits.yaml`.
