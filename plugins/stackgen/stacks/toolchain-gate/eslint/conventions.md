# ESLint — conventions

The **correctness** gate for TypeScript and JavaScript. Topic 10 of the language
bundle, deliberately not a repo gate: a linter meaningful for exactly one
toolchain belongs to that toolchain's bundle, or a polyglot repo acquires one
per language.

**Flat config only.**

**Zero formatting rules.** The formatter owns layout — a rule a formatter can
satisfy must never be able to fail a lint run. The repo formatter's config,
which bootstrap ships, is the other half of that split.

**Overrides are scoped by `files` glob**, never disabled globally. A rule turned
off everywhere because one file could not satisfy it is a rule the repo no
longer has.

**One lint command, wired through the task library**, so local and CI run the
identical gate.

## What this pack writes

No file: its skill and these conventions. ESLint runs only inside the house
linter, which bootstrap pins and runs, with its task and its pre-commit hook —
so this pack ships **no task and no pre-commit fragment**.
`mise run code:lint` runs it, and the `lint` hook runs it on each commit. The
house linter reads the whole tree whatever list it is given — its rules are
cross-file.

`.config/linter.yaml`, the linter's own config, is **not** this pack's either:
bootstrap ships it with the other gate configs, because the house linter
reads it in every repo, not on this stack alone. The linter is zero-config
without it, so the file exists to give a misfiring default one obvious place
to be answered. The `eslint` skill still guides every edit to it.

**A disable comment goes on its own line above the offending one**, line style,
so the decision is visible, with its reason written by hand.

Full judgment: the `eslint` skill.
