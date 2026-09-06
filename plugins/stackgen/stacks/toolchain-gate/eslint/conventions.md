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

Four files. `.config/mise/tasks/code/lint` is the one task name the gate is
reachable as, and `.config/pre-commit.d/eslint.yaml` is the fragment that wires
it into the hook config.

`.config/linter.yaml` is the linter's own config, shipped **empty of
overrides**: the linter is zero-config without it, so the file exists to give a
misfiring default one obvious place to be answered, rather than a scaffolding
step every repo has to remember to run.

The editor fragment is `.config/vscode.d/eslint.jsonc` — `eslint.*` keys only,
with `eslint.format.enable` off, because the layout half of the split is
dprint's in the editor exactly as it is in the gate.

Full judgment: the `eslint` skill.
