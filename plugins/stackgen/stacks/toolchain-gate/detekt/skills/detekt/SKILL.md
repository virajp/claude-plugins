---
name: detekt
version: 0.1.0
category: development
description: The Kotlin lint gate — detekt's CLI through mise, strict, against
  .config/detekt.yml built on detekt's default rules, with every layout rule
  left to ktlint. Covers how to run it, what the configuration may hold,
  turning rules on and off, and suppressions. Auto-applies when editing
  .config/detekt.yml or a detekt.yml file.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/.config/detekt.yml"
  - "**/detekt.yml"
---

# detekt

detekt is the Kotlin correctness gate. It is installed through mise
(`github:detekt/detekt`, the CLI release zip, pinned at an exact version in
`.config/mise/conf.d/detekt/mise.toml`), configured at `.config/detekt.yml`,
and run strict: any finding fails the gate. Moving the pin is its own change,
with the whole-tree lint run and its fixes in the same commit — a new release
adds rules.

## Running it

Through the task library, so the gate and a developer run the same command:

```bash
mise run code:lint:detekt   # detekt alone
mise run code:lint:all      # every lint subtask, as the hook runs it
```

Directly:

```bash
detekt-cli --input . \
  --config .config/detekt.yml \
  --build-upon-default-config \
  --excludes '**/build/**,**/.gradle/**,**/.kotlin/**,**/generated/**'
```

The binary is `detekt-cli`, and it needs a JDK on `PATH` — the one mise pins
for the repo. `--config` is not optional: detekt never looks under `.config/`,
and without the file it lints with its defaults alone.
`--build-upon-default-config` is not optional either: without it the file
**replaces** the defaults instead of overriding them, and every rule it does
not name stops running.

## What the configuration holds

**Overrides only.** The defaults apply underneath, so the file names a rule
only to change it — turn it off, turn an inactive one on, or set a threshold.
`config.validation: true` makes detekt reject a property it does not know, so
a misspelled rule fails the run instead of being ignored.

```yaml
complexity:
  LongParameterList:
    functionThreshold: 8 # the repo's builders take named arguments
```

Look a rule's set and options up in detekt's full default configuration before
writing it: `detekt-cli --generate-config` exports it to a scratch path (the
flag's exact form for the pinned release is in `detekt-cli --help`), never over
`.config/detekt.yml`.

## Layout belongs to ktlint

`MaxLineLength`, `NewLineAtEndOfFile`, `WildcardImport`, `TrailingWhitespace`
and `NoTabs` are off because ktlint decides what they check. A default rule
that starts failing on freshly formatted code joins that list, with a comment
naming what ktlint does instead. Never add detekt's `formatting` plugin — it
is ktlint run a second time, at another version.

## Turning rules on and off

- **An inactive rule is turned on** under its rule set with `active: true`,
  one per rule — a correctness or clarity rule the team is willing to fail a
  build on.
- **A default rule is turned off** with `active: false` and a comment saying
  why — never by lowering its severity, which strict settings turn straight
  back into a failure.
- **A threshold is loosened for the repo deliberately**, never to pass one
  file.
- **No baseline file.** A baseline hides existing findings from the gate; in a
  new codebase fix them, and in an adopted one record the decision with the
  user before adding `--baseline`.

## Suppressing

```kotlin
// The parser's states are one exhaustive table; splitting it hides the table.
@Suppress("CyclomaticComplexMethod")
fun next(state: State, token: Token): State = when (state) {
    // …
}
```

- **`@Suppress("<RuleId>")`** on the narrowest declaration, with the reason in
  a comment above it. A suppression with no reason is a finding in review.
- A rule suppressed in many places is a configuration decision waiting to be
  made — make it in `.config/detekt.yml` instead.
