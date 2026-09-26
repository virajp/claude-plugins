# Decision — stackgen:tool-config owns mise; packs call it

**Date** 2026-09-26 · **Branch** `2026-09-26-tool-config-mise` · **Plan**
[`docs/plans/2026-09-26-tool-config-mise/`](../../plans/2026-09-26-tool-config-mise/index.md)
· **Backlog** B54 (finished), B66 (first piece of three), B72 (the mise side)

## The ask

The user: *"Why not simply create a `mise` skill which knows how to setup tools
and other config in various environments and then let stackgen use that skill to
add whatever is required"*. Then, on how packs contribute: *"Other stack will
simply use the skill to install for which they will call
`stackgen:tool-config`"*.

## What changed

1. **The skill.** `plugins/stackgen/skills/tool-config/`, user- and
   model-invocable.
   `/stackgen:tool-config <tool> <instruction> [for <requester>]` runs one verb;
   `/stackgen:tool-config all [key=value …]` lands every tool it owns.
   `SKILL.md` is the contract; `references/mise.md` the doctrine and verbs;
   `assets/mise/` the files as they land. Named `tool-config`: a skill name
   takes no colon, so `stackgen:tools:config` was not legal.
2. **Content home.** The mise pack moved into the skill. The pack directory,
   `bundles/mise.md` and the `toolchain-manager` kind are gone. No mise skill is
   copied into a repo any more.
3. **Blocks.** Each requester's lines sit between `# >>> <requester>` and
   `# <<< <requester>`. Lines outside every block are the user's and never
   touched.
4. **Drift** is tested by content, never a hash: take theirs, keep mine for this
   run, or merge. The user: *"skill must check with user on what to do and
   accordingly do it"*. `machine_env` values are never drift.
5. **Removal.** `<tool> remove <requester>` deletes that requester's blocks. The
   materializer runs it when a pack is dropped.
6. **Pack calls.** A pack lists `tool-config:` instructions in `pack.yaml`. The
   five `conf.d/<pack>.toml` fragments (pnpm, swiftlint, fnox, doppler, swiftui)
   became calls.
7. **init** calls `/stackgen:tool-config all` with its answers as arguments,
   then fetches `repo-gates` and `repo-hygiene`. Marked positions became
   arguments.
8. **setup and doctor.** Setup fills a `machine_env` value with `set env`. The
   lock records `source: tool-config/<tool>@<stackgen version>`; doctor reads
   it.
9. **graphify.** `"pipx:graphifyy"` in the mise base's `conf.d/tools.dev.toml`;
   a `code:graph` task, run by hand. `setup:ai` no longer runs
   `graphify hook install`. The pre-commit `post-commit` hook is T2's.
10. **Checker rule 11.** A `machine_env` name must be set by a `mise add env`
    entry; every `tool-config:` entry must parse; a pack `conf.d` fragment is a
    finding. The skill's asset tree is walked as a landed tree.

## The reversals

- **The retired plans** `2026-09-26-universal-packs-into-init`,
  `…-mise-conf-d-packs` and `…-linter-pin-in-the-packs` — superseded, never run.
- **Payload kind (d)** of
  [`2026-09-05-charter-fence-opens-for-gate-configs.md`](./2026-09-05-charter-fence-opens-for-gate-configs.md),
  a provider's landed `conf.d/<pack>.toml` — retired; a pack calls the skill.
- **"The packs own every file"** of `2026-09-05-vwf-init-and-the-repo-shape` —
  for mise, the skill owns the files.

## What follows

T2 (`docs/plans/2026-09-26-tool-config-gates`) moves dprint, pre-commit,
gitleaks and grype. T3 (`docs/plans/2026-09-26-tool-config-hygiene`) moves
repo-hygiene and finishes B66.
