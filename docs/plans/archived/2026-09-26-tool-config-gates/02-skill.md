# U2 — The tool-config contract grows four tools and their references

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/skills/tool-config/SKILL.md`,
  `plugins/stackgen/skills/tool-config/references/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/skills/tool-config/SKILL.md` and
  `references/mise.md` (T1's contract — extend it, never restate it); everything
  U1 moved into `references/{dprint,pre-commit,gitleaks,grype}/`; index.md's
  Facts and Gates the orchestrator keeps.

## Ruling

> - Decision 1: The four packs move into the skill: each `config/**` →
>   `assets/<tool>/**` (the landed shape), `conventions.md`, `skills/<tool>/**`
>   and `pack.yaml`'s facts → `references/<tool>.md`. The packs and
>   `bundles/repo-gates.md` are deleted; no tool skill is copied into target
>   repos. The `vscode.d` fragments land only when `editor=vscode`. The root
>   `dprint.json` shim stays a dprint asset.
> - Decision 2: The base carries markdown, pretty_yaml, json and exec (taplo).
>   The rest come from calls: typescript ← `language/typescript`; malva ←
>   `stylesheet/{plain-css,stylex,tailwindcss}`, `framework/astro`,
>   `framework/html`; markup_fmt ← `framework/astro`, `framework/html`;
>   dockerfile ← `deploy-target/container-image`, `cloud-service/containers`,
>   `cloud-service/cloud-run`. A plugin several packs request is written once;
>   the lock lists every requester and `remove` drops it only when none is left.
> - Decision 3: The base set is `.claude`, `.git`, `graphify-out`, `build`,
>   `dist`, `*.lock`. pnpm adds `node_modules`, `.turbo`, `*-lock.json`,
>   `*-lock.yaml`; uv adds `.venv`; swiftpm adds `.build`, `.swiftpm`; swiftui
>   adds `Derived`, `DerivedData`, `*.xcassets`; `target` is dropped. The verb
>   `/stackgen:tool-config all add exclude [generated] <paths>` writes dprint's
>   excludes, taplo's excludes and the pre-commit global exclude; `generated`
>   also writes the gitleaks allowlist — so rule 15 holds by construction.
> - Decision 4: `linter.yaml` stays with pre-commit. Its base ignores are
>   `build`, `graphify-out`, `.config/mise/locks`; flutter adds `.dart_tool`,
>   swiftpm `.build`, `.swiftpm`, swiftui `Derived`, `DerivedData`, uv `.venv`,
>   through `pre-commit add linter-ignore <paths> for <pack>`.
> - Decision 5: `default_install_hook_types` gains `post-commit`; a local
>   `graphify-refresh` hook at stage `post-commit` runs
>   `mise x -- mise run code:graph`, `always_run`, `pass_filenames: false`. The
>   `pre-commit.d` markers retire; uv's fragment becomes
>   `pre-commit add hook … for uv` and is deleted. Commit scopes arrive as an
>   argument (`pre-commit set scopes <a,b,…>`), never hand-filled.
> - Decision 6: gitleaks' allowlist is written only through
>   `all add exclude generated`; grype gets `grype add ignore <id> [reason]` and
>   `grype remove ignore <id>`.
> - Decision 12: Any comment or sentence a unit adds is one line (B65).

## Edits

1. **`SKILL.md`** — the tools it owns become mise, dprint, pre-commit, gitleaks,
   grype (repo-hygiene arrives in T3); `all` lands all five; the cross-tool verb
   `all add exclude [generated] <paths>` and the rule that an exclude is only
   ever added through it; a shared entry (a dprint plugin two packs request) is
   written once and its lock record lists every requester; plain-JSON provenance
   stays in the lock (T1's rule). Extend T1's grammar; do not restate it.
2. **`references/dprint.md`**, **`references/pre-commit.md`**,
   **`references/gitleaks.md`**, **`references/grype.md`** — each folds its raw
   material: what the tool alone lands (the files under `assets/<tool>/`,
   `vscode.d` only when `editor=vscode`), the base content decisions 2–6 fix,
   the verbs (`dprint add plugin <name>`,
   `pre-commit add hook <repo> <id> [stage] …`,
   `pre-commit add linter-ignore <paths>`, `pre-commit set scopes <list>`,
   `grype add ignore <id> [reason]`, `grype remove ignore <id>`,
   `remove <requester>` for each), the arguments `all` passes (commit scopes,
   editor), and the graphify-refresh hook. Then `rm -r` each raw
   `references/<tool>/` folder.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green (frontmatter strict YAML)
- `grep -rn "pre-commit.d\|repo-gates\|stacks/toolchain-gate" plugins/stackgen/skills/tool-config`
  prints nothing

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line; no line caps on a skill — split into references instead.
- Touch nothing outside the owned paths (`assets/**` is U8's).
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: stackgen:tool-config — dprint, pre-commit, gitleaks and grype` — written
by the orchestrator after the wave gate.
