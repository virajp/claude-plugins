---
name: doctor
description: Check that the repo actually matches what .config/vwf.yaml declares
  — per-language
  LSP servers and toolchains, each project's frameworks and dependencies against
  its manifest, the harness task names, health endpoints, the docs/memory/
  store, leftovers of retired tools, and format-stamp drift.
  Reports; never writes without consent. Run it after setup, before execute, or
  any time the repo and the config might have drifted apart.
argument-hint: "[project ... | baseline]"
model: sonnet

disable-model-invocation: false
---

# doctor — Check the Repo Against Its Config

`.config/vwf.yaml` declares what each project is built with. This checks the
repo agrees. Everything here is a **read**, save the one dry-run full mode runs
(below the table in §§3–8) — doctor reports and offers, it never edits without
consent.

Scope to the projects named in `$ARGUMENTS`; with no argument, check every
project in the registry. An argument with only a preference counts as no
argument (see Caller Preferences). **That scope narrows §§3–5 only.** The
harness, the memory store and the leftovers check belong to the repo rather
than to any one project, so **§§6–8 run in full on every invocation**, scoped
or not — and their references are read every run, not just when no argument was
given.
Narrowing them is how a scoped run comes back clean while a blocking finding
sits unread, and `/vwf:setup` / `/vwf:execute`
halt on a blocking finding they were never told about.

The one argument that is not a project name is **`baseline`** — a named
invocation that runs the repo-shape check alone, described below. Every other
run, scoped or not, is doctor's **full mode**. A preference is not a project
name either: it scopes nothing.

## The `baseline` invocation

`/vwf:doctor baseline` evaluates the **local** baseline predicates of the
repo-shape check — Pack versions, Project ids, Branches, Content drift and Merge
model, **(a), (b), (c), (e) and (f)** in the stack-checks reference, the file
reads against the lockfile, the config and the tree — **per repo**, the base
and every locally-present member, and returns that result and **nothing else**.
No stack, manifest, health, memory, leftovers or format-stamp check runs, §§1–4
and §§6–8 are skipped entirely, and predicates **(d)** — Bootstrap drift — and
**(g)** — Forge state — never run: this invocation runs no mise task and no
bootstrap code and reads no forge, and is meant to be cheap enough to run at
every session start. So it does **not report config drift**: doctor's full mode
is the place that does. It writes nothing and offers no remedy — the caller
decides what to print.

Its output is **one line per drifted repo**, naming the repo and the titles of
the predicates that failed — `<repo>: Pack versions, Branches` — and no line for
a repo that is clean. A repo with no `.config/bootstrap.toml` is reported on its
own line and evaluates no predicate — **`shaped on the old layout`** where it
carries `.config/stackgen.yaml` or the older mise files, **`not shaped`** where
it carries none — since neither has the baseline these predicates read. An
absent member is `not present, not checked`, exactly as §5
reports it. Whether any of that is shown, and how, is the caller's: this is
what **`/vwf:recall`** calls to print its shape-drift lines. Each row keeps the
remedy the full run prints under §9: `/stackgen:stackgen-sync` for Pack versions
and Content drift; `/vwf:setup` for a missing pack lockfile and Project ids;
`/vwf:setup reshape` for Branches, not shaped and the old
layout; a fixed value in `.config/bootstrap.toml` for Merge model.

`$ARGUMENTS` is either project names or `baseline`, never both — `baseline`
scopes nothing, since the repo-shape check is per repo, not per project. Either
form, or an argument with no names at all, can end with a `prefer:` preference.

## Doc Paths

| Doc               | Path                                                           |
| ----------------- | -------------------------------------------------------------- |
| vwf config        | `.config/vwf.yaml`                                             |
| Registry          | `docs/blueprint/registry.yaml`                                 |
| Stack vocabulary  | `${CLAUDE_PLUGIN_ROOT}/assets/stack-vocabulary.md`             |
| Stack templates   | from the installed stack plugins, never from vwf                |
| Harness contract  | `${CLAUDE_PLUGIN_ROOT}/assets/harness.md`                      |
| Memory protocol   | `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`                       |
| Memory store      | `docs/memory/` (the base repo — see the memory protocol)       |
| Membership        | `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`                   |
| Format stamp      | `${CLAUDE_PLUGIN_ROOT}/assets/blueprint-format`                |
| Adapter lockfile  | `.claude/stackgen/lock.yaml`                                   |
| Bootstrap values  | `.config/bootstrap.toml`                                       |

The last two are read for the repo-shape check in §5 and, like everything else
in this table, are only ever read.

## Caller Preferences

Everything in `$ARGUMENTS` from `prefer:` to its end is a preference, never a
name, and the words before it are the project names or `baseline`.
`prefer: report only` means doctor reports its findings, offers no fix and asks
nothing. With no `prefer:`, doctor offers as §9 says.

## Hard Rules

- **Read-only by default.** Every fix is offered, never applied unprompted, and
  each is its own consent — never a batch "fix all". A caller's
  `prefer: report only` drops the offer (see Caller Preferences).
- **Never install anything, and never build anything.** Report the command; the
  user runs it. This matches the installer CLI's own rule.
- **Unavailable ≠ missing ≠ unknown ≠ not materialized.** A language with no
  LSP shipped in this marketplace is reported as *unavailable* with no
  suggested command; only a language that *has* a plugin and isn't installed
  is a *missing* finding. Both presuppose an installed plugin **declares** the
  language. One that no plugin declares at all is *unknown*, and unknown is
  **blocking once that project's `template` is pinned** — vwf's stack menu is
  closed to what the installed plugins define
  (`${CLAUDE_PLUGIN_ROOT}/assets/stack-vocabulary.md`). While the project axis
  reads `unresolved` it is a **degradation** instead: the plugin that would
  claim the token is exactly what has not been chosen yet. And a pin whose
  adapter materializes but never landed the payload in its target repo is
  *not materialized* — the decision exists and the artifact does not, which
  is blocking on the pin and remedied by `/vwf:setup`, whose materialize pass
  lands it, never by `/vwf:architecture`, which would only re-decide a pin
  that is already answered (§3).
- **Never halt.** Doctor always finishes and reports, even when everything is
  broken — a mandate is expressed as a **blocking finding**, never as doctor
  stopping early. Callers decide what a finding means: `setup`, `plan` and
  `execute` all halt on `blocking`, and `execute` additionally gates on the LSP
  check — `plan` does not, since planning compiles nothing.

---

## Pipeline

### 1. Load

**Resolve the base repo first**, per
`${CLAUDE_PLUGIN_ROOT}/assets/membership.md` — a run started inside a member must check
the product, not the one repo it is standing in. Then read `.config/vwf.yaml`
and `docs/blueprint/registry.yaml` from there. If no config is reachable by any
step of that resolution, stop and report exactly one thing: this repo is not
onboarded — `/vwf:setup` will onboard it.

**A config with no registry is early, not drifted.** A repo whose
`.config/vwf.yaml` is stamped while `docs/blueprint/registry.yaml` is still
absent is partway along the chain: `/vwf:setup` writes the
config, and the registry arrives later from
`/vwf:architecture`. Report it as **information** — *early: next
`/vwf:product`, then `/vwf:architecture`* —
never as a finding, and never as a setup nudge, since setup has nothing left to
do here. §§3–5 have no projects to scope to and are skipped, saying so; §§6–8
run in full, as they always do.

**Membership, both directions** (multi-repo only). Compare `members:` against
what each member repo's `.config/vwf-membership.yaml` claims, and report as
**blocking**: a member whose file names a different `product` or `host`, a
member listed with no file, a repo carrying a file the base does not list, and a
`multi-repo` topology with no `members:` at all. Each of these leaves exactly
one of the two entry paths silently wrong — a command run from the base works
while the same command run inside the member reports an un-onboarded repo, or
the reverse — which is the whole failure the two-file contract exists to
prevent. A **missing `url:`** on a member is blocking too: the absent-member
clone offer has nothing to clone from without it, and that only surfaces on the
day someone needs the repo.

**Presence is not a finding.** Detect which members are cloned here and say so
plainly in the report, but never as drift: a twenty-repo product with three
cloned is the normal state, and every per-repo check below simply scopes to the
present ones.

Note each project's `role` + `platforms` (registry) and `stack` block (config).
A project the registry declares with **no `stack` block** is a finding in itself
(`config_format` 10 drift — the block is mandatory since 11); report it, nudge
`/vwf:setup`, and check what you can from its platforms' templates meanwhile.

### 2. Stamps

Compare `config_format` and `blueprint_format` in the config to what this vwf
ships (`assets/blueprint-format`, and the schema version in the vwf-config
asset). Drift → report the delta and name the remedy in terms of what setup
does: the stamp is behind, and `/vwf:setup` will reconcile the
tree to the current format. It is never doctor's job to migrate.

### 3–8. The checks

Work these in order, reading each reference immediately before its sections.
Between them they cover every finding kind listed in §9; nothing here is
optional, and no reference restates a rule that lives above.

| Sections                                                   | Reference                                                 | Covers                                                                                            |
| ------------------------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **3–5** — languages, manifests, repo tooling               | [Stack checks](references/stack-checks.md)                | LSP + toolchain per language, required binaries on `PATH` or their declared probes, an unknown language, framework/dependency drift per manifest, the eight stack axes, the Addons check (`addons:` against the base repo's lockfile and the `vwf-tools` manifest, drift only), the Declared MCP servers check (each lockfile's `required_mcp_servers` against `claude mcp list`, drift only, never blocking), a declared backing capability with no provider, the `iac` own-repo rule, `mise`, `repo.stack`, each lockfile where a pinned payload's `lockfile:` fact says (project templates included), the recommended forge CLI, and the repo shape against its baseline, evaluated **per repo** — the adapter lockfile's pack versions, the registry ids behind the task groups, whether the repo is shaped (`.config/bootstrap.toml`) or still on the old layout, the two branches, `mise run setup:configs --dry-run` showing a change as drift (the one check here that runs code, stated below this table), every pack-copied file's content against the hash the lockfile recorded — a mismatch re-tested with every marked position spliced out before it counts — the `merge_model` values in `.config/bootstrap.toml`, and the forge state — the default branch, both branches' protection, the base's backlog project — read from the forge when its CLI answers for the origin host and noted as not checked otherwise. **Blocking findings live here** |
| **6–7** — harness & health, memory                         | [Harness & memory](references/harness-and-memory.md)      | Harness task names and health paths; the `docs/memory/` store's handoff ignore line |
| **8** — leftovers                                          | below                                                     | Files, keys and folders of retired tools — drift, never blocking |

**Full mode's drift check runs code.** Bootstrap drift (§5) is an explicit
`mise run setup:configs --dry-run`, on a full run whoever starts it: a person, or
a caller named at the end of this file. It writes nothing in the repository, but
it executes the `main` branch of bootstrap with no pin, from bootstrap's clone
under `~/.cache/bootstrap`, which it refreshes first, so what runs is whatever
`main` holds at that moment. It runs only in a repo mise trusts, and that is a
limit rather than a safeguard: the trust gate of mise is not tied to file
content. `baseline` never runs it.

**Dependency audit (per in-scope project).** Alongside the manifest checks,
run the ecosystem's own audit command against each project's lockfile — the
package manager's, whatever it is; doctor names no tool beyond it. A
**critical** advisory reports as **blocking** — the same class callers halt
on; high/moderate advisories report as information. An advisory waived
per-advisory under `enforcement.rules`
(`pipeline/dependency-audit/<advisory-id>`, per the delivery-pipeline asset)
reports as **degraded** with its waiver's date, never re-escalated. A project
with no lockfile, or whose package manager offers no audit command, reports
`n/a — no audit surface`, never a failure. Doctor reports the advisory and the
remediation command; it never updates a dependency — `pipeline/dependency-audit`
is what gates the release itself.

### 8. Leftovers

vwf no longer uses mempalace or graphify, and this rule is the one place doctor
names them. Report each of these, where it is found in the base or a
locally-present member, as **drift** — never blocking, since nothing reads it —
each with its remedy:

| Leftover | Remedy |
| --- | --- |
| a `memory:` block (`memory.wing`) in `.config/vwf.yaml` | plain `/vwf:setup` — its migrate pipeline's `23 → 24` step |
| a `mempalace.yaml`, at any depth | the same `/vwf:setup` step |
| a `docs/memory/planning/`, `docs/memory/runs/` or `docs/memory/doctor/` folder | the same `/vwf:setup` step |
| a `.graphifyignore` | bootstrap's migration M24, or its `remove tools` instruction |
| a `code:graph` task | the same bootstrap remedy |
| a `graphify-refresh` hook in the pre-commit config | the same bootstrap remedy |
| a `post-commit` or `post-merge` entry in `default_install_hook_types` that no remaining hook in that config uses | the same bootstrap remedy |
| a `pipx:graphifyy` or `pipx:mempalace` pin | the same bootstrap remedy |
| a `graphify-out/` exclude in any config | the same bootstrap remedy |
| a `graphify-out/` directory at a checkout root | delete the directory (it is a generated graph; nothing reads it now) |
| a `MEMPALACE_*` variable in any mise file | the same bootstrap remedy |
| a `.config/stackgen.yaml` beside a `.config/bootstrap.toml` | a leftover values file from before bootstrap: delete it |

A row the user declined at the `23 → 24` step is still reported, every run:
that step offers its rows by state on each migrate pass, which runs only while
a stamp is behind current, so once the stamp reads 24 setup is current and
does not re-enter it, and this row is how the declined item stays visible.
Palace data outside the repo is never a row: doctor reads nothing there.

### 9. Report

One table, findings first, grouped by kind — **blocking** (something *mandatory*
is absent or misplaced, or the stack is one no installed plugin defines: an
`iac` project
inside another repo whose extraction the user has **not** declined on the
record, `mise`, an **unknown** language and a `binaries` name missing from
`PATH` or failing its declared probe — the last three **conditionally**, once a
stack axis is pinned (§5, §3) — a project whose pinned template its adapter
never **materialized** in that project's target repo (§3) — the pin is an answer
and the payload absent, a `custom` template pin, a project whose template does
not cover every platform it declares, a broken membership link (§1), an unwaived
**critical** dependency advisory (the audit check); callers must halt),
**drift** (config and repo disagree — **including the whole repo-shape check
against the baseline `/vwf:init` lays down**, run **per repo — the base and each
locally-present member** (§5): a pack version behind, a registry id whose pinned
pack ships `p/_project/` tasks with no task group, a repo not shaped or shaped
on the old layout, a missing `develop` or `main`, a change
`mise run setup:configs --dry-run` shows, with its `would` lines, a pack-copied
file the repo edited away from the hash the lockfile recorded and still
diverging once every marked position is spliced out,
and — read from the forge, only where its CLI answers — a default branch that is
neither `develop` nor `main`, `develop` or `main` with no protection on the
forge at all, or no backlog project for the base. Each row is printed under the
repo it was found in, and an **absent** member is a blind spot rather than a
row. A repo behind its baseline still works, so none of those is ever blocking),
**warning** (the repo-shape check could not judge a row, or read a value it cannot
use: in full mode, a `setup:configs --dry-run` that failed, or did not run
because the repo is not trusted by mise, so drift is unknown, with the reason; a
`merge_model` in
`.config/bootstrap.toml` other than `direct` or `pr`,
with the remedy to fix the value; never blocking),
**missing** (something declared has no install — including a **`B`**-kind
capability a project declares that none of its `backing_template` pins provides,
which is never blocking; §5), **unavailable** (nothing shipped here to install),
**unknown** (no installed plugin declares it — blocking once the axis is pinned,
listed separately so the remedy reads as *install or write the plugin*, never
*install this one*), **pinned, not materialized** (§3's neighbour to that one
and never folded into it: the token *is* declared, by a template the adapter
would have landed here and did not, so the remedy is the one line `/vwf:setup` —
its materialize pass, never `/vwf:architecture` — and the row is one per project
rather than one per token, reached only after a declined landing or on a repo
setup has not re-run on, and blocking while the pin stands), **degraded**
(something optional is absent and a fallback is carrying the work, or the run
simply costs more — a forge CLI that is absent, unauthenticated or without the
`project` scope, which leaves `/vwf:backlog` unreadable and predicate (g) of
the repo-shape check unread (§5)
— **or** a decision the user has not yet made or has declined on the record: an
axis reading `unresolved`, whose dependent checks report
`not checked — no stack resolved` (§§3–5), a `binaries` name missing from `PATH`
or failing its probe while its project's `template` reads `unresolved` (§3),
and an `iac` extraction declined under `enforcement:`, each reported every run
and never escalating back to blocking). §8's leftovers are **drift**, listed
under their own heading. State the count of checks that passed rather than
listing them.

Close with the remedies, each as a runnable line, and offer to apply only the
ones that are pure config edits (a stale `stack` entry, a harness task rename).
Anything that installs, or that changes
code, is reported and left to the user — as is anything needing a **choice**: a
`custom` pin and an unknown language both look like one-line config edits and
are not, since resolving either means picking off a menu or installing a plugin.
Nudge plain `/vwf:setup` — the config-side door, never `reshape` — and stop
there; a template doctor guessed would silently change what `plan` and `execute`
read.

**One line per remedy.** The rows of the repo-shape check (§5) share a few
remedies, named in that check's table — **across every repo**, since one re-run
covers a member's drift as well as the base's — so print each remedy a single
time with the rows that led to it underneath: `/vwf:setup` for the pack rows,
`/vwf:setup reshape` for the bootstrap and forge rows, and the fix in
`.config/bootstrap.toml` for a `merge_model` value. A
list repeating one command per row reads as several problems when it is one
re-run, and hides how much of the baseline has moved. The two doors differ by
what they reconcile: plain `/vwf:setup` reconciles
what the config declares and the packs it pins, `reshape` reconciles the shape.
Neither is a remedy doctor applies: `reshape` is the door, and the consent to
re-shape a repo is `/vwf:init`'s to take behind it.

**Persist nothing.** Doctor files no record of its findings: each run reports
the repo as it stands, and the next run checks it again.

**Callers.** `/vwf:setup`'s shared spine runs this over the whole repo, right
after it writes the config, and records what it finds. `/vwf:plan` runs it
scoped to its dependency chain's projects, once the chain is approved and before
its survey. `/vwf:execute` runs it scoped to the plan's projects. **All three
halt on any `blocking` finding** — the mandated tooling is what the pipeline is
built on, and the stack menu is what its conventions and harness come from, so
proceeding without either produces a run that fails later and less clearly, or
one that fails to fail at all. The LSP findings are `/vwf:plan`'s question: at
its stack gate it asks, per flagged language, whether to install now or proceed
without, and records the answer as `consent.lsp.<language>` in the plan
folder's `index.json` (`installed` or `proceed without`). `/vwf:execute` halts
on `blocking` alone and reads that key; it never asks. `/vwf:recall` calls the
`baseline` invocation alone, at session start, and prints its result as one
shape-drift line per remedy — it never runs doctor whole, never reads the forge,
and runs no mise task and no bootstrap code, so it does not report config drift.
Full mode does.
