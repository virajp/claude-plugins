# U6 — the checker accepts the git, graphify and renovate verbs

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`
- **Model:** opus
- **Kind:** edit
- **Read first:** `check.ts` — the tool-config line grammar (around :723-808,
  the known tools and verbs, the `for` suffix handling), rule 11
  `checkPackConfigTier` :420; `check.test.ts` the tool-config grammar cases.

## Ruling

> - Decision 19: Grammar first (U6): `git`, `graphify`, `renovate` are known
>   tools; `git add ignore <pattern…>`, `git add ignore template=<Name>` and
>   `git add attribute <pattern> <attr…>` parse. Then (U7, with the pack gone):
>   a pack `config/` landing … is a finding …
> - Decision 25: Any comment or sentence a unit adds is one line (B65).

## Edits

1. **`check.ts`** — the three tools join the known set; `git add ignore` takes
   one or more patterns or exactly one `template=<Name>` (Name matching
   `^[A-Za-z0-9+._-]+$`); `git add attribute` takes a pattern and at least one
   attribute. Both follow the same `for <pack>` suffix rule the other pack-line
   verbs follow. No allowlist change — that is U7's.
2. **`check.test.ts`** — passing cases for each form; failing cases:
   `git add ignore` with nothing, `template=` with an empty or bad name,
   `git add attribute` with a pattern and no attribute, an unknown `git` verb.

## Verification

- `pnpm vitest run scripts` green
- `pnpm exec tsc --noEmit -p scripts` green
- `MISE_ENV=dev mise run p:plugins:check` green

## Guardrails

- No new finding may fire on today's tree — the repo-hygiene pack still exists.
- Touch nothing outside the two owned files. No `git checkout`/`restore`.

## Commit

`feat: checker accepts the git, graphify and renovate verbs` — written by the
orchestrator after the wave gate.
