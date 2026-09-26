# U8 — The gate assets take their base shape and the graphify hook

- **Wave:** 2
- **Depends on:** U1
- **Owns:**
  `plugins/stackgen/skills/tool-config/assets/{dprint,pre-commit,gitleaks,grype}/**`,
  `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/setup/precommit`,
  the prose of `plugins/stackgen/stacks/bundles/mise.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every file under the four `assets/<tool>/` folders;
  `assets/mise/.config/mise/tasks/{setup/precommit,code/graph}`; index.md's
  Facts.

## Ruling

> - Decision 2: The base carries markdown, pretty_yaml, json and exec (taplo).
>   The rest come from calls.
> - Decision 3: The base set is `.claude`, `.git`, `graphify-out`, `build`,
>   `dist`, `*.lock`. `target` is dropped. `generated` also writes the gitleaks
>   allowlist — so rule 15 holds by construction.
> - Decision 4: `linter.yaml` stays with pre-commit. Its base ignores are
>   `build`, `graphify-out`, `.config/mise/locks`.
> - Decision 5: `default_install_hook_types` gains `post-commit`; a local
>   `graphify-refresh` hook at stage `post-commit` runs
>   `mise x -- mise run code:graph`, `always_run`, `pass_filenames: false`. The
>   `pre-commit.d` markers retire.
> - Decision 6: gitleaks' allowlist is written only through
>   `all add exclude generated`.
> - Decision 12: Any comment a unit adds is one line (B65).

## Edits

1. **dprint** — `.config/dprint.json` keeps only the markdown, pretty_yaml, json
   and exec plugins (drop dockerfile, markup_fmt, malva, typescript and their
   config blocks); `.config/dprint.json` and `.config/taplo.toml` excludes
   become the base set, each wrapped in a `# >>> dprint` / `// >>> dprint` block
   as T1's contract spells it.
2. **pre-commit** — `.config/pre-commit-config.yaml`: `post-commit` in
   `default_install_hook_types`; the `graphify-refresh` hook in the local repo
   block; global `exclude` = the base set; the `pre-commit.d` merge markers
   (:235-240) removed; `.config/linter.yaml` ignores = the base three;
   `.config/git-conventional-commits.yaml` keeps `commitScopes: []` as the
   position `set scopes` fills.
3. **gitleaks** — `[allowlist] paths` = the base set's generated entries
   (`graphify-out`, `build`, `dist`), a subset of the formatter set.
4. **grype** — `ignore: []` stays the position `grype add ignore` fills.
5. **`setup/precommit`** — installs every type in `default_install_hook_types`
   (plain `pre-commit install` reads it; confirm and fix if it passes an
   explicit `--hook-type` list).
6. **`bundles/mise.md:55`** — stop naming `repo-gates`.

## Verification

- `pre-commit validate-config` over the asset config passes
- `dprint config` / `taplo check` parse the asset files (report the commands
  under `DECIDED:`)
- `MISE_ENV=dev mise run p:plugins:check` green (rule 15 over the new paths)
- `MISE_ENV=dev mise run p:plugins:shellcheck` green

## Guardrails

- Never format a payload file with this repo's config.
- Touch nothing outside the owned paths (`SKILL.md` and `references/**` are
  U2's).
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: gate assets take their base shape and the graphify post-commit hook` —
written by the orchestrator after the wave gate.
