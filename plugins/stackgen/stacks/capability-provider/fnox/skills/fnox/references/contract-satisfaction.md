# fnox — contract satisfaction

Clause by clause against stackgen's neutral secrets contract. It cites, and
does not restate.

## The rule that outranks every other

The contract's opening rule — a secret reaches a process as an environment
variable, injected at the process boundary, and **the injector wraps the
repo's own task, not the application**.

```sh
fnox exec -- mise run dev
fnox exec -- mise run e2e:local
```

Satisfied by construction: fnox has no application SDK to reach for. There is
no in-process client, so the bootstrap problem the contract names — the
credential that reads the credentials — does not arise, and the product's
read path is `process.env` whichever provider backs a given secret.

`fnox activate <shell>` loads secrets on directory change and is a genuine
convenience at a developer's prompt. **It is not the boundary.** Tasks still
go through `fnox exec --`, so the injection is explicit and reproducible; a
task that only works because the developer happened to have an activated
shell fails in CI and passes locally, which is the least useful failure
available.

## Clause 1 — resolve the development set, and nothing else

**Satisfied by scope: fnox resolves one environment, development.** That is the
contract's shape for every manager, not a gap fnox carries; the rest come
from elsewhere — CI from the forge's variables (GitHub or GitLab), staging and
production from the cloud provider's own store, where neither mise nor fnox
runs. No deployed environment can fall back to a development value, because
no deployed environment asks fnox for anything.

The shipped config is a single root `[secrets]` block. The profile shape — a
development profile and a `ci` profile, selected by `FNOX_PROFILE` — is the
repo's setup tool's (bootstrap's) to render, not this pack's.

## Clause 2 — stay out of CI

**Satisfied by absence: CI does not use fnox.** A pipeline reads the forge's own
secret variables, scoped per environment and rotated in the forge's settings,
and runs the same repo task a developer runs with those variables already in
its environment. fnox holds no CI credential and ships nothing for a runner.

## Clause 3 — onboard and offboard at a stated cost

**Onboarding**: install the pinned CLI (`mise install`), run
`mise run setup:secrets` to confirm the CLI and `fnox.toml` are in place, then
populate each declared name in your own keychain —
`fnox set NAME --provider keychain` — or authenticate to the cloud store a
reference names. Nothing is committed and nobody else acts; the cost is one
person's first hour.

**Offboarding**: revoke the person's own development credentials at their
source — the issuing system's key or account, the cloud store's IAM grant.
Their keychain is on their machine and is theirs to lose; what it held were
development credentials, which is why the scope matters. Nothing in the repo
ever held a value, so there is no history to re-key and nothing in it a
departed member can still open.

## Clause 4 — enumerate names without printing values

**Satisfied by default**, which is the shape this clause wants: `fnox list`
prints each secret's name and its provider key, and values appear only under
the explicit `-V` flag. Enumeration is the unflagged behaviour and disclosure
is the flagged one, so building `environment.md`'s names-only catalog is the
path of least resistance rather than a discipline someone has to remember.

`-s` adds the source file each secret is defined in, which is what makes a
multi-file or multi-project setup enumerable per project.

## Clause 5 — values stay out of terminals and logs

**Satisfied, with one hazard worth naming.** `fnox exec --` is the read path
a developer needs and it prints nothing. `fnox list` redacts by default.

The hazard is `fnox get NAME`, which prints a value to stdout **by design** —
that is what it is for. It belongs inside a command substitution and never as
a step in a pipeline, because a scrollback outlives the session.
