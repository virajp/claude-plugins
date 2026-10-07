# Secrets — the capability contract

What **any** secrets manager has to satisfy to serve a vwf product, stated
without naming one. The provider packs under `stacks/capability-provider/` say
how a particular tool satisfies it; a cloud plugin's managed flavour says the
same for its own.

**Capability tokens realized here: none today.** Like `cdn`, this category has
no vwf token (`${CLAUDE_PLUGIN_ROOT}/assets/taxonomy.md`) — components leave
`capability` unset, and nothing here mints one. Blueprint prose calls the tool
**the secrets manager**; the one place a real name belongs is `environment.md`,
where a secret's *issuer* is a fact about the world.

## The rule that outranks every other

**A secret reaches a process as an environment variable, injected at the
process boundary — never read by the application from a file.**

This is what makes the manager replaceable, and it is the decision that cannot
be undone cheaply. An application that calls a manager's SDK to fetch its own
credentials has that manager compiled into every service, plus a bootstrap
problem: the credential that reads the credentials. An application that reads
its environment is portable to the next manager, to CI, and to a local shell,
and its tests need no manager at all.

So the injector **wraps the task, not the application**. Whatever the tool, the
shape is `<injector> -- <the repo's own task>`, and everything downstream of
that boundary — the app, its tests, its tooling — knows only that the variables
are set.

## The environment split

**The secrets manager a repo pins serves `development` alone.** Each of vwf's
delivery-pipeline environments, and CI beside them, takes its secrets from
exactly one place:

- **`development`** — the secrets manager, on a developer's machine, injecting
  at the process boundary.
- **CI** — the forge's own secret store (GitHub or GitLab secrets, say),
  handed to the pipeline as variables. CI never authenticates to the
  development manager.
- **`staging` and `production`** — the cloud provider's secret store, read by
  the deployed service. Neither the toolchain manager nor the development
  manager runs there.

The **same variable name** is the join between the three, catalogued once in
`environment.md`; a value is set in each place it is needed, never copied
from one store to another by a tool.

## What a manager must be able to do

1. **Resolve the development set, and nothing else.** A manager resolves the
   values a developer's processes need and must never hand a development value
   to a process outside development — a development store reached from a
   pipeline or a deployed service is how a test credential ends up in front of
   production data.
2. **Stay out of CI.** CI does not authenticate to the development manager at
   all: the forge's variables reach the task directly, under the same names,
   so a pipeline needs no credential that reads the credentials.
3. **Onboard and offboard a person at a stated cost.** Both directions, and
   offboarding is the one that matters: a manager must be able to make a
   departed member's access stop. Stopping access does not un-compromise what
   that person already read — the secrets they held are rotated.
4. **Enumerate names without printing values.** `environment.md` catalogs the
   names of every variable and secret a project needs and **never a value**;
   that stays true whichever tool is picked, so the tool has to make the
   names readable on their own.
5. **Keep values out of the terminal and the log.** Injection is the only
   read path a developer needs; a command whose normal use prints a value has
   published it into a scrollback and a CI log, which are more widely readable
   than the repo.

A clause a tool cannot satisfy is **stated as such** in its pack's contract-
satisfaction topic (`${CLAUDE_PLUGIN_ROOT}/assets/kinds.md`), never omitted.
Serving only `development` is **every** manager's shape now, not a gap one
tool carries: CI is answered by the forge and the deployed environments by the
cloud provider, and each pack says so rather than claiming either.

## The naming convention

Every manager stores values under names, and the names outlive the manager —
so the convention is the contract's, not a provider's:

- **`<REPO>_<KEY>`** for a value one repository owns, where `<REPO>` is that
  repository's own short name and `<KEY>` is what the value is.
- **`GLB_<KEY>`** for a value genuinely shared across repositories — an
  account-wide token, a shared registry credential.
- Names are upper-case, digits and underscores only. Nothing else is
  portable: this is the intersection every manager, every shell and every CI
  runner accepts, and a name that has to be quoted somewhere is a name that
  will be wrong somewhere.

The prefix is what makes a flat namespace legible. Managers differ in whether
they scope by project, by folder or not at all, and a bare `API_KEY` in a
store two repos share is unattributable the moment there are two of them.
Prefixing costs nothing and survives the migration to whichever manager comes
next, which is the same reason the injection rule above outranks everything.

**One store per repository is the default**, and one set of names in it
covers every sub-project the repository holds — a monorepo's members share
the repo's prefix rather than each minting their own, because the thing being
scoped is the repository, not the directory. A member that genuinely needs
isolation is a decision to record in `environment.md`, not a second prefix
invented at the point of use.

The **values** stay where the manager keeps them, and the **names** are
catalogued in `docs/blueprint/environment.md` — clause 4 above is what makes
that catalogue possible without printing anything.

## No repo carries an encrypted secret

**No secret enters a tracked file, encrypted or not.** Committed ciphertext is
permanent in history, and the secret scanner, the memory palace and review
would all have to be told to look away from it — an allowance that is a hole
the day a value lands before it is encrypted. A value lives in the keychain, a
cloud store, the forge or the cloud provider, never in the repository, so no
pack emits a scanner allowlist or a mining exclusion for a secrets file, and a
committed secrets file is a finding whichever pack is pinned.

## What this contract does not decide

- **Which tool.** That is the user's pick from the menu — a local-first tool
  where you hold the development values, or a managed flavour from the
  project's cloud plugin. The axis that separates
  them is **where the secret lives and what onboarding a teammate costs**, and
  each pack's pick-and-trade topic is where that argument belongs.
- **Which secrets the product has.** That is `environment.md`, authored per
  project by the workflow — names and issuers, never values.
- **Whether a product must have one at all.** Mandating a secrets mechanism is
  a vwf-side statement; this contract only says what one has to do once
  selected.
