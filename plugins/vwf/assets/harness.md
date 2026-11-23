# Harness Contract

What a repo must be able to **run** for vwf's verification gates to do their job
— the capabilities behind the `acceptance` and `ux` stages and `/vwf:verify`.
One vocabulary for everyone: `plan` injects repair steps against it, `doctor`
reports against it, the verifiers name what is missing against it. A
capability is never assumed and never recorded: since `config_format` 28 it is
**present when its task exists**, read fresh whenever a command needs it, and
`.config/vwf.yaml` carries no `harness:` block.

## Capabilities

| Capability    | Required when                                   | Task                                  | Convention                                                    |
| ------------- | ----------------------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| `dev`         | any project declares a **screen platform**      | `dev`                                 | boots the project locally                                     |
| `e2e_local`   | any flow carries acceptance criteria            | the `test:e2e` **port**               | runs E2E against the local stack                              |
| `local_stack` | `e2e_local` needs backing services              | `stack:up`                            | the backing services, behind a **deterministic ready signal** |
| `e2e_staging` | flows have criteria **and** a deploy target     | `test:e2e:staging`                    | runs E2E against a deployed env                               |
| `health`      | any project declares the `service` platform     | none — per project, see below         | a `GET /health` (or documented readiness) endpoint            |
| `screenshots` | a **browser** screen platform (`site`/`webapp`) | `screenshots`                         | a repeatable way to render a screen and scan it               |
| `goldens`     | a **device** screen platform (`desktop`/`mobile`/`tablet`/`auto`/`watch`/`tv`/`spatial`) | the `test:golden` **port** | a repeatable visual check + the platform's a11y assertions |
| `test:load`   | a flow's declared peak rate meets the delivery-pipeline load-validation threshold (default `~10/s`), ahead of its first production release | `test:load` | a load run against staging |

Reference implementations live in the **stack plugins**, not here. Each
capability has exactly **one** task name, the one above: a non-canonical name
is not supported, so a repo that runs E2E under another name renames that
task. `/vwf:setup`'s `27 → 28` migration reports each non-canonical name the
old `harness:` block recorded, for the user to rename.

**`health` is not a task.** It is a route a `service` project exposes, and its
one record is per project: `projects.<name>.harness.health` in
`.config/vwf.yaml` overrides the `GET /health` convention or declares `n/a`, no
surface.

**`local_stack` carries one requirement beyond its task name**, and it is a
requirement, not a mechanism: the stack must come up behind a **deterministic
readiness signal** the acceptance verifier can gate on. A fixed sleep is a
finding, because it makes the verifier's result a race rather than an
observation. *How* the services are started and *how* readiness is signalled are
the stack plugin's business. A product whose `e2e_local` needs no backing
services never needs a local stack at all.

## Detection

Every read runs **in the repo that holds the project whose platform needs the
capability** — `projects.<name>.repo`, else the base repo — so a capability
one member has says nothing about another.

- **A port** — `e2e_local` (`test:e2e`) and `goldens` (`test:golden`) — is read
  from `bootstrap describe --json`: present when its `data.ports` entry reads
  `present` true (`${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`).
- **Any other capability** is present when its task name is in
  `mise tasks ls --json --no-global --hidden`.
- **`health`** is a route, not a task: a health route in the service's routing
  or deploy manifest, at the path `projects.<name>.harness.health` names when
  set.

For `screenshots` and `goldens`, **what the task runs is the stack plugin's
answer, not vwf's** — ask its `-stack-template` skill rather than guessing at a
tool. A failed `bootstrap` or `mise` call is a refusal, with that tool's error
text, never a capability read as absent.

## Provision & repair

- **New/empty repos** — `/vwf:setup` scaffolds the harness as part of the chosen
  topology's layout (the selected stack templates describe it), in the same
  consent-gated migration plan.
- **Existing repos** — `/vwf:plan` runs a **harness preflight**: read the
  capabilities this slice's gates will need, as Detection above says, and
  **inject a bootstrap unit** into the plan folder for each missing one,
  ordered before the units whose verification depends on it — built by the
  coder under the normal TDD → coverage → commit pipeline like any `code` unit,
  and reviewed at the `review` row that covers it. Harness units are
  **gate-required guardrails**: the minimalism checks never flag them.
- **No stamp to reconcile** — a cycle that adds a capability adds its task, and
  the next read finds it.

## Reporting

When a verifier cannot run, its `n/a` names the missing capability in this
vocabulary (`n/a — e2e_staging missing: no test:e2e:staging task`), so the
orchestrator's gate, the gap record, and the next plan's preflight all point at
the same thing.
