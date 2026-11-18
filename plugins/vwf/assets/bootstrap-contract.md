# The bootstrap Contract

**How a plugin reaches bootstrap.** vwf cites this file wherever a skill needs
a bootstrap fact. stackgen carries the same body in its own
`assets/bootstrap-contract.md`, because `${CLAUDE_PLUGIN_ROOT}` names only the
plugin it is read in.

A plugin reaches bootstrap only through its CLI and the JSON contract it
prints. It never reads or writes a file in `.config/bootstrap/` directly, and
never falls back to reading one; it may stage such a file with git.

## The contract check

Before a skill uses a bootstrap fact, it runs:

```sh
mise x -- bootstrap contract --json
```

or `bootstrap contract --json` when mise has no pin for it. The check passes
when the command runs and `data.versions` of its output holds `1`.

When the `bootstrap` command is absent, or `data.versions` has no `1`, the
skill stops with this hint, word for word:

> bootstrap 4.0.0 or newer is required: install it as bootstrap's README says
> (https://github.com/virajp/bootstrap)

`/vwf:doctor` reports the same stop as a blocking finding.

## The shaped test

A repo is shaped when

```sh
bootstrap config get repo.format --json
```

prints an envelope with `ok` true. Code 2 means the repo is not shaped, is in
the old form, has both forms, or has a broken folder; the envelope's `errors`
text tells which (`Run bootstrap init`). On any code 2 the skill shows the
`errors` messages as bootstrap gives them, and stops. It writes no text of its
own per case.

## The envelope

Every `--json` command prints one compact object on stdout, on one line:

```text
{"contract":1,"command":"config get","ok":true,"code":0,"data":{...},"errors":[],"warnings":[]}
```

- `contract` is the contract version; `command` is the full command words
  (`config get`); `ok` is true only when `code` is 0; `data` is the result,
  `null` when the command fails before it has one.
- Human lines go to stderr. The process exit code equals `code`.
- Each item of `errors` and `warnings` is `{code, message, path}`; `path` is
  left out when no file is known. A list is always `[]`, never `null`.

| Code | Meaning                           |
| ---- | --------------------------------- |
| 0    | ok                                |
| 1    | failure                           |
| 2    | usage or config error             |
| 3    | a name bootstrap does not know    |
| 5    | the clone is stale and offline    |

## The calls the plugins use

- `bootstrap contract --json` — the contract versions and the CLI version.
- `bootstrap config get|set|unset <key> --json` — read or write one repo
  value; `releases.<project>` keeps the higher level on `set`.
- `bootstrap describe --json` — the repo facts, tools, members and ports.
- `bootstrap catalog --json` — the tools, categories and packs it ships.
- `bootstrap check --json` — the stages of the repo check and their findings.
- `bootstrap sync --dry-run --json` — what a sync would change.
- `bootstrap init --json` and `bootstrap add tool <name> --json` — first with
  `--dry-run`, then with `--yes`.
- `--answer <tool>.<key>=<value>` — gives one answer to a question; repeats.

With `--json`, `add`, `remove`, `replace`, `init` and `detect --add` need
`--yes` or `--dry-run`, else they stop with code 2. `config set`,
`config unset` and `sync` need neither. A pending question stops a `--yes` run
with code 2 and is listed in `data.plan.pending`.
