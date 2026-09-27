# U3 — setup and doctor read a shaped repo from tool-config records

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/setup/**`, `plugins/vwf/skills/doctor/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** setup `SKILL.md` :55-120, :170-185;
  `setup/references/onboard-pipeline.md` :50-65; doctor
  `references/stack-checks.md` :280-300, :353-420, :495-505;
  `references/code-intelligence.md` :25-45.

## Ruling

> - Decision 9: The `unconditional:` key retires everywhere — … init's
>   fixed-slug fetch … Shaped means the `tool-config/*` records are present.
> - Decision 13: Reshape replaces a `repo-hygiene/repo-hygiene` lock record with
>   `tool-config/{git,graphify,renovate}` records … Doctor stops requiring the
>   slug.
> - Decision 16: … doctor `code-intelligence.md:35`'s remedy for a raw graphify
>   hook becomes `mise run setup:precommit`.
> - Decision 25: Any comment or sentence a unit adds is one line (B65).

## Edits

1. **setup `SKILL.md`** :63 — the hygiene files are init's and tool-config's;
   :108-116 — the shape check is the `tool-config/*` records, no slug; :178 —
   `.gitignore` and `.gitattributes` are the git tool's.
2. **`setup/references/onboard-pipeline.md`** :55-62 — the same shape check.
3. **doctor `references/stack-checks.md`** :286-296 — no unconditional bundle;
   the baseline predicates read `tool-config/{git,graphify,renovate}` records; a
   leftover `repo-hygiene/repo-hygiene` record is drift remedied by
   `/vwf:setup reshape`; :499-501 — the secrets provider's ignore lines are its
   pack's `git` block, not a hygiene provider table.
4. **doctor `references/code-intelligence.md`** :35 — the remedy for a raw
   graphify hook, and for leftover `merge.graphify.*` config, is
   `mise run setup:precommit`.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green
- `grep -rn 'repo-hygiene\|unconditional' plugins/vwf/skills/setup plugins/vwf/skills/doctor`
  returns only the drift text of edit 3

## Guardrails

- Do not touch `plugins/vwf/skills/init` — U2.
- `plugins/**/*.md` is not formatted: match the fold width by hand.
- No `git checkout`/`restore`.

## Commit

`feat: setup and doctor read a shaped repo from tool-config records` — written
by the orchestrator after the wave gate.
