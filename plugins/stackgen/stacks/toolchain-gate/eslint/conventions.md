# ESLint — conventions

The **correctness** gate for TypeScript and JavaScript. Topic 10 of the language
bundle, deliberately not a repo gate: a linter meaningful for exactly one
toolchain belongs to that toolchain's bundle, or a polyglot repo acquires one
per language.

**Flat config only.**

**Zero formatting rules.** The formatter owns layout — a rule a formatter can
satisfy must never be able to fail a lint run. See the `dprint` repo-gate pack
for the other half of that split.

**Overrides are scoped by `files` glob**, never disabled globally. A rule turned
off everywhere because one file could not satisfy it is a rule the repo no
longer has.

**One lint command, wired through the task library**, so local and CI run the
identical gate.

## What this pack writes

Two files. `.config/mise/tasks/code/lint` is the one task name the gate is
reachable as, and it is the only place the linter is configured: this pack
ships **no pre-commit fragment**, because the gate config's `lint` hook already
calls `mise run code:lint --fix` with the staged files. The task
takes an optional file list — empty means the whole tree.

`.config/linter.yaml`, the linter's own config, is **not** this pack's: the
pre-commit gate pack ships it, because every pack whose `code:lint` runs the
linter reads it, not this one alone. It lands **empty of overrides** — the
linter is zero-config without it, so the file exists to give a misfiring
default one obvious place to be answered — with an `ignores:` list of the
generated trees the stack packs produce. The `eslint` skill still guides every
edit to it.

The editor fragment is `.config/vscode.d/eslint.jsonc` — `eslint.*` keys only,
with `eslint.format.enable` off, because the layout half of the split is
dprint's in the editor exactly as it is in the gate. The fragment lands only
where init's editor answer is vscode — `pack.yaml`'s `conditional:` names it.

Full judgment: the `eslint` skill.
