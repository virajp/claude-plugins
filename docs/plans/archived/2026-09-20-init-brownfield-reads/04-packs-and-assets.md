# U4 — the four stale passages, and init as a hash writer

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md`,
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`,
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`,
  `plugins/stackgen/assets/output-tree.md`,
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** each owned passage in context — `HY/conventions.md:216-220`
  (and `:23`, `:36-38`, `:60-65`), `task-library.md:631-634`,
  `pre-commit-config.yaml:201-204`, `output-tree.md:352-371`,
  `materializer.md:113-118`, `:167-180`.
- **Lazy-load:**
  `plugins/vwf/skills/init/references/fragments-and-sections.md:107-111` (how
  the hook fragments are actually merged — read only);
  `existing-repo.md:214-219` (the sidecar move — read only).

## Ruling

Decision 9 — Stale passages: "B18's four corrected in place; `OT`'s lockfile
schema and `MAT` name init as a hash writer after fills."

Decision 6 — Hashes, as the stackgen side states it: "the materializer at
landing; pass 6's replace and keep both re-record …; and init, as its last step
before the git pass, re-hashes every file it filled, appended to or merged".

Decision 1, the renovate half: "A twin the pack itself lands at the root
(`renovate.json`) yields: the repo's `.github/renovate.json` or `.renovaterc`
wins and the pack's is not landed, reported as such."

## Edits

1. **`HY/conventions.md:216-220`** — the renovate caveat: the file lands at the
   **root** (`:23` already says so), Renovate reads the root first (`:36-38`); a
   repo's `.github/renovate.json` or `.renovaterc` wins and the pack's copy is
   not landed. The `.gitignore` section rule at `:60-65` describes the
   normalised merge (cite the composing skill by role, never by plugin path).
2. **`task-library.md:631-634`** — an unmapped helper call is **moved to the
   sidecar**, not flagged (the sidecar rule the mise skill already describes
   elsewhere in the file — cite it).
3. **`pre-commit-config.yaml:201-204`** — the comment: fragments are **appended
   inside the `repos:` list**, not "merged below this line". No plugin path
   (rule 13).
4. **`output-tree.md:352-371`** — the `hash:` field's note: written by the
   materializer at landing and **re-recorded by the composing skill after its
   fills, appends and merges, and by its replace-or-keep offer**; a hash that
   differs is content drift only when no such writer ran.
5. **`materializer.md:113-118`** — one sentence after the landing hash: the
   composing skill re-records the hash of every file it changes after landing;
   `:167-180` unchanged.

## Verification

- `mise run p:plugins:check` green (rule 13 over the pre-commit payload; rule 11
  parses it).
- `grep -n "merged below this line" plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`
  — zero hits.
- `grep -n "flagged for the user" plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`
  — zero hits.
- `grep -n "re-record" plugins/stackgen/assets/output-tree.md plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`
  — hits in both.

## Guardrails

- `config/` is payload — the YAML comment edit by hand, no formatter.
- Do not edit `plugins/vwf/**` (U1–U3).
- No `pack.yaml` bump — U6.
- No doc outside the owned files — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` outside `config/` is not dprint-formatted: match the fold
  width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`docs: packs and stackgen assets — renovate lands at root, sidecar not flag, fragments appended, init re-records hashes`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
