# U5 — Gates and bump

- **Wave:** 4
- **Depends on:** U4
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, the deletions `plugins/vwf/skills/archive/`
  and `plugins/vwf/assets/plan-index.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/.claude-plugin/plugin.json`;
  `.claude/skills/release/SKILL.md:78-105` (the bump rule); the plan's Consent
  block.
- **Lazy-load:** `.claude/skills/plugin-authoring/references/checks.md:40-47`
  (rule 1 — plain semver, no 13 or 17 component).

## Ruling

Decisions 5, 11 and 15, and the Consent row, quoted:

> **5.** `assets/plan-index.md` moves to
> `skills/plan-management/references/plan-index.md` …

> **11.** … `rm -r skills/archive` and `rm assets/plan-index.md` are U5's, after
> every citation has moved.

> **15.** `archive` → `plan-management`, in the bump unit.

> **Release vwf publicly** — minor — `19.32.0` → `19.33.0`, a hand edit of
> `plugins/vwf/.claude-plugin/plugin.json`; no release step, the tag waits.

## Edits

1. **Prove every citation has moved** before deleting anything:
   `grep -rn 'assets/plan-index' plugins/` and `grep -rn 'vwf:archive' plugins/`
   must both return only hits inside `plugins/vwf/skills/archive/` and
   `plugins/vwf/assets/plan-index.md` themselves. A hit elsewhere is an
   `UNRESOLVED:` naming the file and the unit that owns it (U2:
   `skills/execute/`; U3: `skills/plan/`, `skills/change-plan/`,
   `skills/backlog/`, `assets/`; U1: `skills/plan-management/`) — do not fix it
   yourself, do not delete.
2. **`rm -r plugins/vwf/skills/archive`** and
   **`rm plugins/vwf/assets/plan-index.md`** — plain `rm`, never `git rm`.
3. **`plugins/vwf/.claude-plugin/plugin.json`** — `version` `19.32.0` →
   `19.33.0` (no `13` or `17` component; plain `X.Y.Z`, no `+N`); in `keywords`,
   `"archive"` → `"plan-management"`, keeping the array's order otherwise.
4. **`mise run p:plugins:marketplace`** — regenerates
   `.claude-plugin/marketplace.json` (the vwf ref becomes `vwf-v19.33.0`) and
   the gitignored dev manifest; stage nothing — the orchestrator commits.
5. **The full wave gate**, every line:

       mise run p:plugins:marketplace -- --check
       mise run p:plugins:inventory -- --check
       mise run p:plugins:check
       mise run code:precommit
       mise run p:site:check

## Verification

- All five gate lines green; `p:plugins:check` in particular, since the
  deletions are what it would catch (a stale citation to either deleted path).
- `git status --porcelain` shows exactly: `plugin.json` modified,
  `.claude-plugin/marketplace.json` modified, `skills/archive/SKILL.md` deleted,
  `assets/plan-index.md` deleted — nothing else.
- `python3 -c "import json;print(json.load(open('plugins/vwf/.claude-plugin/plugin.json'))['version'])"`
  prints `19.33.0`.

## Guardrails

- Touch nothing outside the four owned paths. Never edit a skill, an asset or a
  doc to make the gate pass — report `UNRESOLVED:` instead.
- Never run `p:plugins:release`, `p:plugins:local`, or `/release` — the first
  needs the user's word (the Consent block records no release step), the second
  is the orchestrator's after-landing step.
- Never `git checkout`, `git restore` or `git reset` — the worktree holds four
  units' committed work.
- Delete with `rm`, never `git rm`.

## Commit

`ops: vwf 19.33.0 — archive and the plan-index asset retired into plan-management`
— written by the orchestrator after the wave gate. `ops` is in
`.config/git-conventional-commits.yaml`.
