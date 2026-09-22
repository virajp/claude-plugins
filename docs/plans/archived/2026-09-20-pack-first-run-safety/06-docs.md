# U6 — docs: the task behaviours, and the decisions doc

- **Wave:** 3
- **Depends on:** R5
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/stackgen-plugin/**`, `.claude/skills/vwf-plugin/**`,
  `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-20-pack-first-run-safety.md`,
  `plugins/stackgen/stacks/toolchain-gate/dprint/skills/**` (one passage,
  `:100-105`)
- **Model:** opus
- **Kind:** edit
- **Read first:** the wave-1 units' `CHANGED:` and `DOCS FALSIFIED:` lines as
  the orchestrator hands them over, then every passage under Edits, then
  `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (the decisions-doc
  shape); the wave-1 files, only to quote landed wording.

## Ruling

Every decision in index.md's table, 1–9, is the source of truth; quote the
landed wording. The reversal from index.md's Goal becomes one decisions doc:

"The mise pack's doctrine that 'identity and signing keys must live in GLOBAL
git-config, never per-repo local' … inverts: the identity is **per-repo,
required, and equal to** `<FORGE>_USER_NAME`, `<FORGE>_EMAIL`,
`<FORGE>_SIGNING_KEY`, where `<FORGE>` is `GITHUB` or `GITLAB` by the origin
host and `GIT` for any other host or no remote."

Decision 1 — the posture — is the standing rule the decisions doc records for
every future pack task.

## Edits

1. Run `vwf:docs-sync` over the branch delta and apply its findings.
2. **`docs/memory/decisions/2026-09-20-pack-first-run-safety.md`** — new, per
   the memory shape: the posture (decision 1) as the rule every pack task
   follows from now on, with the three flags; the git-config reversal, naming
   what it supersedes (the task's own comment and the hook description) and the
   variable contract; the gitleaks and grype rulings in one line each; what this
   plan deliberately left (L8, the graphify hook, the values — with the plan
   each goes to). Mirror to the palace `decisions` room when the server is up.
3. **`site/src/content/docs/plugins/stackgen.md`** — `:727, :730` (the task
   list; git-config wired into hooks) and `:765` (setup:all calls setup:mise):
   the three flags, the git-config contract in two lines with the variable
   names, and a sentence that `setup:all` never upgrades or overwrites. Any
   passage on gitleaks' allowlist or grype's threshold gains the baseline step.
4. **`.claude/skills/stackgen-plugin/SKILL.md`** and its references — where the
   task library or the hook set is described (no hits today for `--overwrite` /
   `mise upgrade`; check `git-config`, `setup:precommit`, `setup:all`).
5. **`CLAUDE.md`** — the Tasks section describes this repo's own gates; it
   changes only if it restates `code:git-config`'s rule (grep `git-config`);
   note in one clause that this repo's own task copies follow at its next
   reshape, if the section already speaks of the reshape.
6. **`readme.md`**, **`.claude/docs/**`** — only where a hit of
   `grep -rn "git-config\|setup:precommit\|setup:mise\|autoupdate" readme.md .claude/docs`
   reads false.
7. Every `DOCS FALSIFIED:` line the wave-1 units returned, applied — the dprint
   skill's `:100-105` (`dprint config update` from setup:mise) is expected among
   them; it lives under `plugins/stackgen/stacks/toolchain-gate/dprint/`, which
   this unit owns for that one passage: `dprint config update` now runs from
   `setup:mise --upgrade` only.

## Verification

- `mise run p:site:check` green.
- `mise run code:precommit` green.
- `grep -rn "never per-repo\|never local\|global git-config" readme.md CLAUDE.md .claude site/src/content/docs`
  — zero hits of the old rule.
- `grep -rn "GITHUB_USER_NAME" site/src/content/docs/plugins/stackgen.md` — at
  least one hit.

## Guardrails

- No edit under `plugins/**` except the dprint skill passage at `:100-105`.
- Never edit a version file, a `pack.yaml` or a generated file — U7.
- Do not end a table cell in a bare asterisk.
- The site's link rule (`site/CLAUDE.md`).
- Delete with `rm`, never `git rm`.

## Commit

`docs: pack first-run safety — the three flags, the forge identity rule` —
written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
