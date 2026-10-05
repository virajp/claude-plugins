# ESLint — conventions

The **correctness** gate for TypeScript and JavaScript. Topic 10 of the language
bundle, deliberately not a repo gate: a linter meaningful for exactly one
toolchain belongs to that toolchain's bundle, or a polyglot repo acquires one
per language.

**Flat config only.**

**Zero formatting rules.** The formatter owns layout — a rule a formatter can
satisfy must never be able to fail a lint run. The dprint config
`stackgen:tool-config` lands is the other half of that split.

**Overrides are scoped by `files` glob**, never disabled globally. A rule turned
off everywhere because one file could not satisfy it is a rule the repo no
longer has.

**One lint command, wired through the task library**, so local and CI run the
identical gate.

## What this pack writes

No file: its skill and these conventions. ESLint runs only inside the house
linter, `@askviraj/linter`, which `stackgen:tool-config` pins in every repo
and runs through the universal `code:lint:house` subtask — so this pack ships
no `code/lint/eslint` subtask and **no pre-commit fragment**: the gate
config's `lint` hook calls `mise run code:lint:all --fix`, which runs
`code:lint:house` with every other lint subtask. The house linter reads the
whole tree whatever list it is given — its rules are cross-file.

`.config/linter.yaml`, the linter's own config, is **not** this pack's either:
`stackgen:tool-config` lands it with the other gate configs, because the house
linter reads it in every repo, not on this stack alone. It lands **empty of
overrides** — the linter is zero-config without it, so the file exists to give
a misfiring default one obvious place to be answered — with an `ignores:` list
of the generated trees the stack packs produce. The `eslint` skill still guides
every edit to it.

**A disable comment goes on its own line above the offending one**, line style,
so the decision is visible, with its reason written by hand.

Full judgment: the `eslint` skill.
