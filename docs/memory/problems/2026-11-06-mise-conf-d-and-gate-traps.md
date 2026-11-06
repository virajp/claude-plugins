PROBLEM 2026-09-26 ★3 | mise conf.d and gate-tool traps | miserc is read from
the working directory, dotted file names bind to an environment, dprint reads a
bare path as a flag — each broke a gate or a layout | fix stated per item

**Source plan** `2026-09-26-mise-conf-d-layout`, `2026-09-25-gate-hardening`,
`2026-09-26-linter-pin-in-the-packs`.

Facts about mise and the gate tools, met while the packs owned them.

- **`env_conf_d` is read from the working directory's tree.** `mise -C <repo>`
  or `mise --cd <repo>` from elsewhere finds no miserc, so every dotted
  `conf.d` file loads in every environment (dev tools under `ci`). The miserc
  sets `env_conf_d = true` and never an `env` value; the user sets that at
  system level only.
- **A dotted file name binds to an environment.** `conf.d/tasks.build.toml`
  loads only under `MISE_ENV=build`. A dotted table header such as
  `[tasks.build]` needs its own rule; do not name its file by the header.
- **Unset `MISE_ENV` is not dev.** `setup:all` exits 1 with
  `MISE_ENV=dev mise run setup:all` in the message. Every caller (init, the
  git-workflow fallback, the readme skill) passes it.
- **Aliases move with their scope.** Sending every `[shell_alias]` table to the
  dev file narrows a base alias table to dev.
- **dprint reads a path as a flag.** Every path handed to dprint is
  `./`-prefixed, or follows a literal form.
- **Pre-commit lint hook runs serially.** `require_serial: true` is set; the
  house linter is one process over the whole tree.
- **The linter is a Node script.** mise installs the `npm:` tool, but the
  binary needs `node` on PATH. Swift and Flutter pin no node, so the stack that
  pins the linter pins `node` beside it, in every environment because CI lints.
