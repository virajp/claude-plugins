# U3 — Packs call tool-config for plugins, excludes, ignores and hooks

- **Wave:** 1
- **Depends on:** —
- **Owns:** the `pack.yaml` (not its `version:` line) and `config/` of
  `plugins/stackgen/stacks/language/typescript`,
  `plugins/stackgen/stacks/stylesheet/{plain-css,stylex,tailwindcss}`,
  `plugins/stackgen/stacks/framework/{astro,html}`,
  `plugins/stackgen/stacks/deploy-target/container-image`,
  `plugins/stackgen/stacks/cloud-service/{containers,cloud-run}`,
  `plugins/stackgen/stacks/package-manager/{pnpm,uv,swiftpm}`,
  `plugins/stackgen/stacks/app-framework/{swiftui,flutter}`
- **Model:** opus
- **Kind:** edit
- **Read first:** each owned `pack.yaml` (T1 already added a `tool-config:` list
  to some — append to it, same instruction style); index.md's Facts.

## Ruling

> - Decision 2: The base carries markdown, pretty_yaml, json and exec (taplo).
>   The rest come from calls: typescript ← `language/typescript`; malva ←
>   `stylesheet/{plain-css,stylex,tailwindcss}`, `framework/astro`,
>   `framework/html`; markup_fmt ← `framework/astro`, `framework/html`;
>   dockerfile ← `deploy-target/container-image`, `cloud-service/containers`,
>   `cloud-service/cloud-run`.
> - Decision 3: pnpm adds `node_modules`, `.turbo`, `*-lock.json`,
>   `*-lock.yaml`; uv adds `.venv`; swiftpm adds `.build`, `.swiftpm`; swiftui
>   adds `Derived`, `DerivedData`, `*.xcassets` — each through
>   `all add exclude [generated] <paths>`.
> - Decision 4: flutter adds `.dart_tool`, swiftpm `.build`, `.swiftpm`, swiftui
>   `Derived`, `DerivedData`, uv `.venv`, through
>   `pre-commit add linter-ignore <paths> for <pack>`.
> - Decision 5: uv's fragment becomes `pre-commit add hook … for uv` and is
>   deleted.
> - Decision 12: Any comment or sentence a unit adds is one line (B65).

## Edits

1. **`tool-config:` lines** in each owned `pack.yaml`, one instruction per line,
   exactly as decisions 2–4 assign them — e.g. `dprint add plugin typescript`,
   `all add exclude generated node_modules .turbo`,
   `all add exclude *-lock.json *-lock.yaml`,
   `pre-commit add linter-ignore .dart_tool`. Mark an entry `generated` when it
   is a build or dependency tree (`node_modules`, `.turbo`, `.venv`, `.build`,
   `.swiftpm`, `Derived`, `DerivedData`, `.dart_tool`); lockfiles and
   `*.xcassets` are not `generated` (gitleaks still scans them).
2. **uv** — translate `config/.config/pre-commit.d/uv.yaml` into one
   `pre-commit add hook …` line carrying the same repo, id, entry and arguments,
   then `rm` the fragment and any directory it empties.
3. Touch no other file in these packs; a prose passage now false is a
   `DOCS FALSIFIED:` line.

## Verification

- `grep -rl "pre-commit.d" plugins/stackgen/stacks` prints nothing
- every owned `pack.yaml` parses as YAML
- `MISE_ENV=dev mise run p:plugins:check` green once U5 lands

## Guardrails

- The orchestrator commits this unit **third** in wave 1, after U12 and U1.
- Never edit a `version:` line (U11's) or a bundle.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: packs call tool-config for dprint plugins, excludes, ignores and hooks` —
written by the orchestrator after the wave gate.
