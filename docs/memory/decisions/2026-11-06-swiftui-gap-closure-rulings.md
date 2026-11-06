DECISION 2026-09-24 ★3 | swiftui gap closure rulings | machine env is asked in
setup, the pin guard is a presence check, Mac Catalyst is declined, per-platform
simulator pins stay parked — each fix keeps the guard simple and the ux-gate
honest | alt init-time ask, per-task TOML parse, Catalyst support rejected

**Source plan** `2026-09-24-swiftui-gap-closure`,
`2026-09-25-swift-gap-closure`, `2026-09-23-swiftui-platform-doctrine`.

The Swift chain itself is in `2026-09-23-swift-native-stack`. These rulings
closed its gaps. The `machine_env` fact was later retired with the packs'
`conf.d` payload (bootstrap owns tool config now); the reasons still apply.

- **Machine env at setup, not init.** The user first ruled "at init time, per
  machine". The survey showed init lands only the unconditional bundles, and
  the swiftui pack lands in setup's materialize pass. The user re-ruled:
  setup asks, from a field the pack declares. Rejected: an init round; both.
- **The pin guard is a presence check.** The swiftui tasks first re-parsed the
  TOML that `mise config get` printed. The review loop found a new edge case
  in every round (mixed quote kinds, templated values, two mise processes) and
  hit the round cap with the finding count rising. The reviewer named the real
  fault: wrong altitude. Ruling: the task checks only that the name sits in
  `.config/mise.toml` `[env]`; setup moves such a pin into the fragment. A CI
  or local override then passes. Lesson: when a guard grows an edge case each
  round, move the check, do not patch it.
- **Data, never syntax.** A machine-env value is data. Setup refuses `{{`, `{%`,
  `{#`, `$` and a quote mixed with a backslash, because mise renders Tera
  templates at env load, before any task. Probes and detect commands run only
  when the committed template still matches its lockfile hash.
- **`rendered: ok` means goldens were compared.** An audit-only run reports
  `rendered: n/a` with its reason. The accessibility audit runs for the pinned
  device's own platform only; every other changed platform, CarPlay always
  among them, reports `n/a` with a finding, never clean.
- **Mac Catalyst is declined.** `desktop` means a native macOS target. The
  ux-gate returns vwf's three keys only; viewport and audit details go in
  `reason` or a finding's `where`. Rejected: Catalyst through the pin;
  widening vwf's contract.
- **Sync carries the repo's `machine_env` values** into the new payload before
  it writes, so a pack move never resets the pins.
- **Not a defect:** a dependency-free repo has no `Package.resolved`; the user
  ruled a repo always has dependencies.

**Open (parked):** per-platform simulator pins, so tablet, watch, tv and
spatial get their own goldens and audit (one pin serves all today); the
`binaries` fact on the older packs that need a non-mise binary (waits on
bootstrap).
