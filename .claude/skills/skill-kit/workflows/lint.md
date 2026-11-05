# lint

Runs the exact rules. Run it from the repo root.

```sh
node <skill-kit>/scripts/lint.mjs <skill-dir>...
node <skill-kit>/scripts/lint.mjs --all
node <skill-kit>/scripts/lint.mjs --all --json
node <skill-kit>/scripts/lint.mjs --words <skill-dir>
```

- `--all` also runs the collection rules.
- `--json` gives the baseline report.
- `--words` prints body words, always-loaded words and total words.
- Exit code 1 means an error finding. Exit code 2 means bad input. A warning
  alone exits 0.

[rules.md](../references/rules.md) explains each rule ID. Lint does not replace
`p:plugins:check`: run both on a change under a plugin.
