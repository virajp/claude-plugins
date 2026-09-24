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
shared base — the path alias, the quote style, auto-import off — the Node/TS
excludes (`node_modules/` and the two `tsconfig*.tsbuildinfo` files, in all
three exclude maps), the `template-string-converter.*` keys with the one
extension that serves them, and the nesting that folds `tsconfig.*.json` under
`tsconfig.json` and a `.js` file's source map and declarations under it. No
extension for TypeScript itself: the editor has it built in.

The fragment lands only where init's editor answer is vscode — `pack.yaml`'s
`conditional:` names it.

Full judgment: the `tsconfig` skill.
