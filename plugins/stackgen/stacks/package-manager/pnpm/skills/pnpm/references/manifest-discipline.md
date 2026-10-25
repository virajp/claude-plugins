# package.json Standards

pnpm is the **only** package manager (`packageManager: pnpm@11.x`). Never
`npm install` or `bun install`. These standards hold for a **single-package**
repo and a **monorepo** alike; the workspace-only additions (`workspace:*`
links, the root orchestrator, `requiredScripts`) are marked as such. In a
monorepo the workspace globs live in the root `pnpm-workspace.yaml` (see the
**pnpm** skill).

## Adding dependencies

- **Ask first.** Never add a new package to `dependencies`/`devDependencies` (or
  run `pnpm add`) without the user's explicit consent — name the package, what
  it's for, and why the stdlib or an already-installed dependency can't cover
  it, then wait for a yes. This holds even for packages a skill or standard
  recommends (e.g. the `@/`-alias devDependencies below).

## Versions

- Give every dependency a **version range**, never `"latest"`. The lockfile
  (`pnpm-lock.yaml`) pins the exact versions; the range is the limit an update
  can move them inside. `"latest"` lets an update take a new major version
  that another dependency does not accept.
- A stable package gets its **major** range: `">=4.0.0 <5.0.0"`. A package that
  can break in a minor release gets its **minor** range: `">=4.0.0 <4.1.0"`.
- Choose from the package's own stability docs — read them with Context7, not
  from memory. Use the minor range for:
  - every `0.x` package;
  - a package or an API its docs mark unstable or experimental (for example,
    the Effect 4 packages other than `effect`, the OpenTelemetry `0.2xx`
    packages, `@opentelemetry/semantic-conventions/incubating`);
  - a family that must share one version, or that has no stability guarantee
    across releases (for example, `@temporalio/*`);
  - a package without semver, or one that a tool patches at one exact version
    (for example, `typescript` when `@effect/tsgo` patches it).
- Run `pnpm update` **without** `--latest` — `--latest` writes a version
  outside the range. To move a range, edit it in `package.json` on purpose,
  after you read the release notes.
- After any `package.json` change, run `pnpm install` from the repo root.
- Never edit `pnpm-lock.yaml` by hand, with an editor tool, `sed` or a script —
  only `pnpm install`, `pnpm add`, `pnpm remove` and `pnpm update` write it.
- Commit `pnpm-lock.yaml` changes separately: `ops: update pnpm lockfile`.
- **Monorepo:** local workspace packages link via the workspace protocol:
  `"workspace:*"`.

## Module shape

- `"type": "module"` — ESM everywhere.
- `"private": true` on anything unpublished — a single-package app, and (in a
  monorepo) the root plus any unpublished workspace.
- Publishable packages declare `"files"` (ship `./dist/` + `package.json`) and a
  multi-entry **exports map** that points each subpath at its built `.js` and
  `.d.ts`:

```json
{
  "name": "@scope/common",
  "type": "module",
  "exports": {
    "./effect": {
      "import": "./dist/effect/index.js",
      "types": "./dist/effect/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils/index.js",
      "types": "./dist/utils/index.d.ts"
    }
  },
  "files": ["./dist/", "package.json"]
}
```

Add one `exports` entry per public barrel — consumers import
`@scope/common/utils`, never deep paths into `dist`.

## Standard scripts

Every buildable package — the lone package in a single-package repo, or each
workspace in a monorepo — exposes the same script vocabulary (so in a monorepo
`pnpm-workspace.yaml`'s `requiredScripts` line up):

```json
{
  "scripts": {
    "build": "pnpm run clean && pnpm run check && pnpm run build:ts && pnpm run build:alias",
    "build:ts": "tsc -p tsconfig.build.json",
    "build:alias": "tsc-alias -p tsconfig.build.json",
    "check": "tsc -p tsconfig.build.json --noEmit",
    "clean": "rm -rf ./dist ./node_modules/.cache/* || true",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest"
  }
}
```

- `build` always runs `clean → check → build:ts → build:alias` in order — type
  check before emit, rewrite `@/` aliases after (see the **build** reference).
- **Monorepo:** the root `package.json` orchestrates workspaces — via
  `turbo run build` when the repo uses turbo, else via
  `pnpm --filter "<name>..." run build` (or `bun run --filter "<name>..." build`),
  which builds the workspace dependencies of `<name>` first, in dependency
  order. Keep cross-workspace fan-out there, per-package scripts stay
  single-package.
- Dev runs use `tsx`; never commit a script that runs `vitest run` directly when
  it needs emulators or secrets — wrap it in the relevant runner.

The `@/` alias needs two **devDependencies** in every package that uses it (the
alias itself is declared in `tsconfig.json` — see the **tsconfig** skill):

```jsonc
{
  "devDependencies": {
    "tsc-alias": ">=1.0.0 <2.0.0", // build:alias — rewrites @/ → relative paths in dist
    "vite-tsconfig-paths": ">=6.0.0 <7.0.0", // resolves @/ in Vitest (see the vitest reference)
  },
}
```

`tsx` resolves `@/` from the tsconfig directly, so dev runs need nothing extra.
