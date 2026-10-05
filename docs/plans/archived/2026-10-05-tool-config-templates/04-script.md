# U4 — The script renders from assets and templates

- **Wave:** 3
- **Depends on:** U2, U3
- **Owns:** `plugins/stackgen/skills/tool-config/scripts/tool-config.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/**` except `schema.mjs` (U5),
  `template.mjs`, `yaml.mjs`, `values.mjs` (plan 1's — import, never edit); new
  `scripts/src/tool-config-*.test.ts` and `scripts/src/fixtures/tool-config/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `tool-config.mjs` whole; `lib/{cli,rows,run}.mjs`;
  `lib/tools/mise.mjs:577-640` (pin resolver); plan 1's three modules; the trees
  U2 landed under `assets/` and `templates/`; index.md's Template names.
- **Lazy-load:** `lib/tools/pre-commit.mjs` (gitleaks/pre-commit validate
  steps), `lib/blocks.mjs` (`splitLines`/`joinLines` worth keeping).

## Ruling

> E1 — `[preview] all` with `--repo-name`, `--merge-model-develop`,
> `--merge-model-main`, `--members`, `--scopes`, `--node`, `--external`,
> `--forge`, `--secrets`, `--answers` writes any given values into
> `.config/stackgen.yaml`, then renders every asset and template, the `_base/`
> and `ai/` folders and the `…:all` tasks, then the existing tail (setup:all on
> `all`, formatter, validate-config). `[preview] pack --slug <s> --dir <dir>`
> with repeatable `--set key=value` and `--answers` writes `packs.<s>` values,
> renders the pack's `templates/` into the repo, re-renders the `…:all` tasks.
> `[preview] pack-remove --slug <s>` with `--answers` deletes `conf.d/<s>/` and
> every subtask file named `<s>`, removes `packs.<s>`, re-renders the `…:all`
> tasks. `[preview] upgrade` with `--answers` moves exact pins forward, one row
> per pin. Retired: every per-tool verb, `apply-entries`, `check`,
> `remove --for`, `all add-exclude`, `--for`. The script is the only writer of
> `stackgen.yaml`.

> E2 — A pack has `templates/` beside `config/`. The materializer copies
> `config/` and keeps its lock exactly as today; the script renders `templates/`
> to the same relative paths. The script never copies static payload.

> E3 — Dev-only files keep `latest`; in every mise file a CI environment loads
> the script resolves each `latest` to an exact version with
> `mise latest <tool>` at render, except `node` and `pnpm`.

> E8 — markers only in the six positions; lines outside are the repo's own.

> E11 — a whole-owned file that differs from a fresh render is one row carrying
> the diff, answered `ok` or `keep-existing`. A template that renders empty is
> not written; an existing copy is a delete row.

> E13 — renovate and `update_bot` gone. E21 — U4 writes new suites.

Standing rulings that still bind (decision docs): tools run only as
`mise x -- <tool>` after `mise which`; trust is the user's, the script never
grants it; the formatter runs after every write and validate-config restores
byte for byte on failure; zero dependencies, ESM, JSON out, exit 0/2/1; a second
`all` with the same values writes nothing.

## Edits

1. **`lib/cli.mjs`** — the four call shapes of E1 plus `preview`, `--repo-root`,
   `--plugin-root`; every retired shape refused naming the new surface.
2. **`lib/stackgen-file.mjs`** (new) — write `.config/stackgen.yaml` from
   values: a fixed key order, the D8 grammar only, a leading comment naming the
   file's owner; a value change is a row.
3. **`lib/render.mjs`** (new) — walk `assets/` (copy) and `templates/` (render
   with `loadValues` plus the derived names of index.md's Template names:
   `PROJECT_NAME` fallback, `MEMBERS_SPACED`, `MEMBER_ENTRIES`, every
   `*_SUBTASKS` from the task files present after this call's writes, `TASKS`);
   the six marked files rewrite only between their markers; the pin pass of E3
   over CI-loaded mise files (keep the resolver's `mise latest` and
   exact-version rules).
4. **`tool-config.mjs`** — rewire `all`, `pack`, `pack-remove`, `upgrade` onto
   `render.mjs`, `rows.mjs` and the existing `land()` tail; drop the lock
   reading/writing, `record`/`share` ops, `check`, `apply-entries`,
   `contextFor`'s pack/machineEnv.
5. **`rm`** `lib/{blocks,drift,record}.mjs` (after moving any helper you keep
   into `render.mjs`) and `lib/tools/**`. Leave `lib/schema.mjs` — U5 deletes
   it; nothing in the script may import it.
6. **Suites** — `scripts/src/tool-config-render.test.ts` (greenfield `all`
   golden over a temp repo with a stub `mise` on `PATH`, idempotent second run,
   markers keep outside lines, `NODE` true/false placement, E11 rows, E3 pin
   pass with a stubbed `mise latest`, `stackgen.yaml` written and re-read),
   `scripts/src/tool-config-pack.test.ts` (`pack` with the swiftui pack's
   templates and `--set`, `…:all` re-render, `pack-remove`), and the kept cases
   from the old core suite (argument refusals, rows/answers, symlink and
   outside-root refusals, missing mise, trust refusal). Goldens under
   `scripts/src/fixtures/tool-config/`.

## Verification

- `pnpm vitest run scripts/src/tool-config-render.test.ts scripts/src/tool-config-pack.test.ts`
  green.
- `pnpm exec tsc --noEmit -p scripts` green.
- `rg -n "schema\.mjs|record\.mjs|drift\.mjs|blocks\.mjs|tools/" plugins/stackgen/skills/tool-config/scripts`
  prints nothing.
- `mise run p:plugins:check` green (rule 16).

## Guardrails

- Touch nothing outside Owns — never edit plan 1's modules, `schema.mjs`,
  `check.ts`, `assets/`, `templates/`, `stacks/`. A template bug is a `GAP:`
  naming the file.
- Never write a pin that is not exact into a CI-loaded file (node and pnpm
  excepted); never run a bare `mise use`.
- Never `cat > file <<EOF` — use the Write tool.
- Delete with `rm`, never `git rm`.

## Commit

`feat: tool-config's script renders assets and templates from stackgen.yaml`
