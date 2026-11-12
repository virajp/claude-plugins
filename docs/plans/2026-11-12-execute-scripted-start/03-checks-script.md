# U3 — The blocking checks script

- **Read first:** `plugins/vwf/skills/doctor/SKILL.md` §1 and §9, and
  `plugins/vwf/skills/doctor/references/stack-checks.md` top to bottom (read
  only; U2 owns both), `plugins/vwf/assets/membership.md` (the five-step base
  resolution), `plugins/vwf/assets/vwf-config.md` lines 51-197 (the config
  schema and the three axis states), `plugins/stackgen/assets/output-tree.md`
  lines 309-364 (the lockfile).
- **Lazy-load:** `plugins/vwf/skills/plan-management/scripts/lib/yaml.mjs`
  (U1's reader), `plugins/vwf/assets/stack-adapter.md` lines 199-205 (the menu
  rule), `plugins/stackgen/stacks/language/swift/pack.yaml` and
  `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml` (binaries forms).

## Ruling

> D16: "node ${CLAUDE_PLUGIN_ROOT}/skills/doctor/scripts/checks.mjs
> [--projects a,b] [--repo <dir>] prints one JSON object {base, projects,
> findings, lsp} with the same row shapes as D15. Exit 0 when no row is
> blocking, 1 when one is, 2 on a usage or internal error. It exports
> runChecks({cwd, projects}) for start.mjs. It covers exactly: not onboarded,
> membership both directions and member url, missing mise, a custom pin,
> template platform coverage, iac inside another repo with the D7 decline,
> pinned not materialized, unknown language, binaries and probes (the hash
> gate, mise x -- sh -c with the command as one argument, 30-second cap), and
> the LSP state. Severities follow stack-checks.md: blocking, degraded,
> missing, unavailable, info. No audit, no drift, no network, no bootstrap
> dry-run."

> D22 (overrides the LSP parts of D16, D15 and D9 (e)): "Until then
> checks.mjs and start.mjs check no LSP. The lsp key is dropped from the D15
> and D16 contracts and D9 (e) is void."

So the output is `{base, projects, findings}`, and there is no `lsp` rule, no
`lsp` key and no call to the `claude` CLI.

> D15 row shapes: "findings (each {rule, severity, project, subject, message,
> remedy}), lsp (each {language, project, state: present, missing or
> unavailable})".

> D24: "Use ONLY fake data. Every fixture of U1, U3 and U4 holds invented
> names, paths, hosts and URLs, shaped on the schemas; no file is copied from
> a real repo."

> D29: "Any reachable .config/vwf.yaml counts as onboarded, stamped or not.
> not-onboarded (no config reachable) and early (a config, no registry) are
> info rows; execute does not stop on either. With no registry, the project
> checks are skipped and the repo-level checks run. This repo (config with
> only after_landing) gives exit 0." Add the rule id `early` beside
> `not-onboarded`.

> D34 (U3 part): "G9: a repo-level row has project null."

> D37 (U3 part): "G6: an absent projects means the whole repo (doctor); []
> means repo-level checks only; start.mjs always passes the D8 list."

> D7: "enforcement.rules.topology/iac-own-repo/<project>: { waived: true,
> reason: <one line> }."

> D8: "match each owns path to the registry project whose path is the longest
> prefix of it. No match, or no registry, gives the base repo's own scope (no
> project names, repo-level checks only)." (start.mjs does the matching; this
> script takes `--projects`.)

> D3: "The checks live in doctor/scripts/checks.mjs with doctor/scripts/lib/.
> execute/scripts/start.mjs imports both"

> D4: "An own subset reader, plugins/vwf/skills/plan-management/scripts/lib/yaml.mjs"
> (import it; do not write a second reader).

> D6: "Doctor runs the script. For the findings checks.mjs covers, doctor calls
> it and reports its rows; the prose points to the script as the source and
> keeps the reasons. Each row carries its severity, because the same check is
> a degradation while an axis reads unresolved."

> D9: "(a) mise: an axis is pinned when it holds a slug or a non-empty list on
> template, backing_template, deploy_template, repo.stack.template, design,
> cicd or stylesheet; unresolved, [] and addons do not count. A capability is
> claimed when harness.<cap> is true or {present: true}. (b) Materialized: for
> each adapter in stacks:, read <target repo>/.claude/<adapter>/lock.yaml; the
> pin is materialized when an entries row has slug equal to the pin's slug or
> path .claude/<adapter>/templates/<slug>.md. Strip an axis prefix (project/,
> repo/) from a pin to get the slug. Strip a sha256: prefix before a hash
> compare. (c) The file-not-listed membership half checks only the repo the
> run started in. (d) A bundle or template with no platforms: covers the whole
> axis. (e) LSP: the mapping is the lockfile's local_plugin.lsp_servers
> ({name, packs: [language/<token>]}). A server is present when its key is in
> the lspServers of the local plugin's .claude-plugin/plugin.json and claude
> plugin list --json shows that plugin enabled, at project scope for the base
> path first, else at user scope. Disabled counts as missing. A language with
> no mapping is unavailable."

## Edits

1. **`doctor/scripts/checks.mjs`** (new, `#!/usr/bin/env node`, executable:
   `chmod +x`) — the CLI per D16, a thin wrapper over `lib/`. Run from any
   directory; resolve the base per `membership.md`. `--repo` sets the start
   directory (default the cwd).
2. **`doctor/scripts/lib/`** (new) — one module per finding group
   (`base.mjs`, `membership.mjs`, `stack.mjs`, or a split you choose), and
   `index.mjs` exporting `runChecks({cwd, projects})`. Each row uses a stable
   `rule` id: `not-onboarded`, `membership`, `member-url`, `mise`,
   `custom-pin`, `platform-coverage`, `iac-own-repo`, `not-materialized`,
   `unknown-language`, `binary`. Each `remedy` is
   the runnable line stack-checks.md gives (e.g. `/vwf:setup`,
   `/vwf:setup reshape`, `/plugin`). Severities, including the conditional
   ones (unknown language and binaries are `degraded` while the project's
   `template` reads `unresolved`; mise per D9 (a); a declined iac is
   `degraded`), follow stack-checks.md. `not-materialized` skips that
   project's token walk. Report a binary once, not per project. An optional
   language token is known but its rows read unverified: an `info` row.
   Every child process uses an argument array; the probe is
   `spawnSync("mise", ["x", "--", "sh", "-c", cmd], {cwd, timeout: 30000})`
   with stdout and stderr ignored.
3. **`scripts/src/doctor-checks.test.ts`** (new) and
   **`scripts/src/fixtures/doctor-checks/**`** — fixture repos (a base with
   `.config/vwf.yaml`, a registry, a `.claude/stackgen/lock.yaml` and a
   template; a multi-repo base with members) built into temp dirs. One case per
   rule and per severity condition, a clean repo (exit 0), the D7 decline, the
   hash gate (probe not run on a mismatch), and the `--projects` scope. Stub
   `mise` with a script on a temp `PATH`.

## Verification

- `mise x -- pnpm vitest run scripts/src/doctor-checks.test.ts`
- `mise x -- pnpm exec tsc --noEmit -p scripts`
- `mise x -- mise run p:plugins:check` (rule 16: shebang, executable bit,
  `node:` and relative imports only)
- `node plugins/vwf/skills/doctor/scripts/checks.mjs` in this repo prints JSON
  and exits 0.

## Guardrails

- Touch nothing outside `owns`; import the YAML reader by relative path, do not
  copy it.
- No network call, no `mise run`, no bootstrap code.
- Write files with the Write tool, never `cat > file`. The Bash tool runs fish.

## Commit

`feat: doctor checks script for the blocking findings`
