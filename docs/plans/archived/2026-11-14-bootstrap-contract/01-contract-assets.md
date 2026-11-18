# U1 — The contract assets and the 4.0.0 check

- **Read first (D19):** the bootstrap contract as the approved bootstrap plans
  define it: `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/plans/2026-11-14-config-folder/02-migration-config-verb.md`
  (the `config` verb) and the `decisions` of
  `.../bootstrap/docs/plans/2026-11-14-contract-commands/index.json` (the
  envelope, `contract`, `describe`, `check`, `catalog`, `init` and `add` with
  `--json`), or their archived paths; and `.../bootstrap/docs/design/cli.md`
  as it is after bootstrap 4.0.0. Read also the design record
  `docs/memory/decisions/2026-11-14-bootstrap-plugins-split.md` (the
  Contract section and the Amendments).
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` (an asset's tone and
  fold width), `.claude/skills/plugin-authoring/SKILL.md` (the plugin-root
  trap).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D3:** before any edit, run `mise x -- bootstrap contract --json` (or
  `bootstrap contract --json` when mise has no pin). If the command fails, or
  `data.versions` of its output has no `1`, edit nothing and return one
  QUESTION: "bootstrap contract 1 is not installed (bootstrap@4.0.0 is not
  released or not installed). Stop the run until it is?" with the options
  "Stop the run (recommended)" and "Continue with a local build named by the
  user".
- **D4:** a repo is shaped when `bootstrap config get repo.format --json`
  prints an envelope with `ok` true. Code 2 means not shaped or the old form;
  the envelope's `errors` text tells which (`Run bootstrap init`).
- **D8:** when the `bootstrap` command is absent, or `contract --json` has no
  version `1` in `data.versions`, a skill that needs a bootstrap fact stops
  with the install hint: "bootstrap 4.0.0 or newer is required: install it as
  bootstrap's README says (https://github.com/virajp/bootstrap)". The hint
  names no `mise use` command (checker rule 17). `/vwf:doctor` reports it
  as a blocking finding. No skill falls back to reading a file.
- **D16:** code 2 also means both forms are present, or a broken folder. On
  any code 2, a skill shows the envelope's `errors` messages as bootstrap gives
  them, and stops; it writes no text of its own per case.
- **D13:** one asset per plugin, because `${CLAUDE_PLUGIN_ROOT}` names only its
  own plugin. The two files have the same body; the stackgen one says that
  stackgen cites it, the vwf one that vwf cites it.
- The plugins never read or write a file in `.config/bootstrap/` directly
  (the design record). They may stage such a file with git.

## Edits

1. **`plugins/vwf/assets/bootstrap-contract.md`** (new) — sections:
   1. *The contract check* (D3's command, D8's stop and its exact hint).
   2. *The shaped test* (D4, D16).
   3. *The envelope*: every `--json` command prints one compact object on
      stdout, `{contract, command, ok, code, data, errors, warnings}`; human
      lines go to stderr; the exit code equals `code`; `errors` and
      `warnings` items are `{code, message, path}`. Codes: 0 ok, 1 failure,
      2 usage or config error, 5 the clone is stale and offline.
   4. *The calls the plugins use*, one line each: `contract`,
      `config get|set|unset`, `describe`, `catalog`, `check`,
      `sync --dry-run`, `init` and `add tool` with `--dry-run` then `--yes`,
      and `--answer <tool>.<key>=<value>`. With `--json`, `add`, `remove`,
      `replace`, `init` and `detect --add` need `--yes` or `--dry-run`;
      `config set`, `config unset` and `sync` need neither (D37). A pending
      question stops it with code 2 and is
      listed in `data.plan.pending`.
2. **`plugins/stackgen/assets/bootstrap-contract.md`** (new) — the same body.

## Verification

- `mise x -- mise run code:format` passes.
- `grep -c 'config get repo.format' plugins/*/assets/bootstrap-contract.md`
  prints 1 or more for each file.

## Guardrails

- Touch nothing outside the two owned files.
- `plugins/**/*.md` is not formatted by dprint: fold at 80 columns by hand.
- Do not name this repo's own `.config/` files.
- Delete with `rm`, never `git rm`.

## Commit

`feat: the bootstrap contract assets of vwf and stackgen`
