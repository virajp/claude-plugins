DECISION 2026-09-26 ★2 | pack mise lines stay in the plugin, the stack picks its
linter | a pack never lands a `conf.d/<pack>.toml`, drift asks the user with no
hash, and the language stack decides its linter and runtime — the base pins only
what every repo needs | alt per-block hash, base-wide linter pin rejected

**Source plan** `2026-09-26-mise-conf-d-packs`,
`2026-09-26-linter-pin-in-the-packs`.

Both are superseded: bootstrap now owns tool config, pins and the mise layout
(`2026-11-03-tool-config-to-bootstrap`). The user rulings still guide how a
shared repo shape is built.

- **Fragments stay with the plugin.** The user: "it must not land inside the
  repo, it must stay with the plugin and only be used from there to read and
  make edits in the repo at the respective locations". Init merged each pack's
  `mise.d/` lines into the section files between per-pack markers. This
  retired the charter-fence payload kind (d), a provider's `conf.d/<pack>.toml`.
- **Drift: no hash.** The user: after files are created or migrated, the user
  edits them; on the next run, skill finds the drift and asks what to do.
  The ask offers take the pack's, keep mine, or merge. Rejected: a per-block
  or whole-file hash in init's lock.
- **The stack decides the linter.** The user: "`linter` is not universal, it's
  dependent on what stack is selected". The gate-hardening pin in the base
  installed and locked a Node tool in blank, docs-only and uv repos, and in
  CI's layer, which is also production's. Each language stack pins the linter
  and the runtime it needs; the markdown pack lints only where no other
  language lints. Rejected: the pin in the base; JS and TS stacks only; an
  opt-in linter pack.
- **A shared pin is written once**, in a shared block that lists the packs
  needing it, and pruned when none remain. Differing versions are asked.
