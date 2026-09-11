---
name: TypeScript · Pulumi
axis: project
kind: language-bundle
components:
- language/typescript@0.1.0
- package-manager/pnpm@0.1.0
- toolchain-gate/tsconfig@0.1.0
- toolchain-gate/eslint@0.1.0
- framework/pulumi@generated
platforms:
- iac
---

# iac — TypeScript · Pulumi

An `iac` project provisions the product's infrastructure as code with
[Pulumi](https://pulumi.com), in the same language as the rest of a TypeScript
workspace — so the type system, formatter, linter and test runner are the ones
the team already uses.

**`iac` is exempt from blueprint coverage.** It carries no flows, screens or
API contracts, and the coverage stamp ignores it. It is registered so `plan`,
`doctor` and `execute` can see it and change it as part of a slice.

**An `iac` project lives in its own repo** — independent, or a submodule of the
product parent. vwf enforces this (`/vwf:doctor` raises a violation as
blocking); the reasoning is in the vwf plugin's `assets/topologies/`. So this
template scaffolds a **repo**, not a directory in someone else's.

**No Effect, deliberately.** Pulumi already is the composition and dependency
model: a resource constructor registers desired state with the engine rather
than creating anything, an `Output` is an eventually-available value that
carries its dependency edge with it, and the engine orders the graph from those
edges — the job an Effect `Layer` graph does in a service, done by the tool.
Wrapping a constructor in an `Effect` hides the edge, since the engine cannot
see through a fiber, and `apply` runs only during `up`, so a program that
resolves values through a runtime shows nothing on `preview`. The other Effect
wins do not apply either: a program that runs once and exits owns no
long-lived runtime and mounts no layer per request, and its failures are the
engine's, reported by the CLI, not a typed channel the program maps. Where a
`ComponentResource` needs a computed value, `apply` and `pulumi.all` are the
composition; where it needs config, the typed parse under Stack is the
fail-fast. A workspace on `typescript-effect` keeps Effect in its services and
leaves the `iac` repo on the platform's own model.

## Stack

- **Programs per stack**: one Pulumi stack per environment (`development` /
  `staging` / `production`, the canonical names from the delivery-pipeline
  contract). Stack config carries no secrets in plaintext — use Pulumi's
  encrypted config or the secrets manager the backing axis names.
- **Layout**: `src/stacks/<environment>.ts` as the entry per environment;
  `src/components/` for reusable `ComponentResource` classes; `src/config/` for
  typed config parsing that fails fast on a missing value.
- **Typed config**: parse stack config through a schema at the top of the
  program, so a misconfigured stack fails before any resource is touched rather
  than halfway through an apply.
- **No ambient credentials in code**: the provider's credentials come from the
  environment, never from a committed file or a literal in the program.

## Testing

- Vitest unit tests over the component classes using Pulumi's mocked runtime
  (`pulumi.runtime.setMocks`), asserting the resource graph a component produces
  — inputs in, expected resources out. These run with no cloud access.
- `pulumi preview` against a non-production stack is the integration check; it
  belongs in CI, not in the unit suite.

## Change discipline

Infrastructure changes are irreversible far more often than application changes,
so an `iac` step in a plan states its **blast radius** and whether the apply
is reversible. `/vwf:execute` treats an irreversible infrastructure apply as a
halt for human confirmation, like any other irreversible decision.
