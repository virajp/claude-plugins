# tsconfig — conventions

**`strict` is on, everywhere, and is not negotiated per project.** The
type-level rules in the TypeScript baseline assume it; without it they are
suggestions.

**One shared base config, extended per project.** A per-project config that
restates the base has already drifted from it.

**The `@/` path alias** replaces deep relative chains, and the build resolves it
the same way the editor does.

**A separate emit variant for builds**, so type checking and emitting are
distinct operations — `tsc --noEmit` is the checker, and nothing about a check
should depend on output settings.

## What this pack writes

One file, and it is not a compiler config: `.config/vscode.d/tsconfig.jsonc`,
the editor fragment. The `tsconfig.json` files themselves are per-project and
are written where the project is, not laid down from here. The fragment carries
the `js/ts.*` keys that make the editor's own import machinery agree with the
shared base — the path alias, the quote style, auto-import off — plus the
nesting that folds `tsconfig.*.json` under `tsconfig.json`. No extension: the
editor has TypeScript built in.

Full judgment: the `tsconfig` skill.
