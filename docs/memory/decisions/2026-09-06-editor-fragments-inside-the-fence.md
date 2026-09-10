# Decision — editor fragments come inside the charter fence; whole editor files stay out

**Date** 2026-09-06 · **Branch** `2026-09-05-astro-static` · **Plan**
[`docs/plans/2026-09-05-astro-static/`](../../plans/2026-09-05-astro-static/index.md)
· **Narrows** the `config/`-tier fence as written in
`assets/output-tree.md:202-214`, and reopens it a second time after
[`2026-09-05-charter-fence-opens-for-gate-configs.md`](./2026-09-05-charter-fence-opens-for-gate-configs.md)

## What was decided before

The fence named four things a pack may not write, "enumerated rather than left
to judgment": a language manifest and its lockfile, CI workflow files, **editor
settings** ("they belong to the people typing"), and `CLAUDE.md`. That list was
written on 2026-09-05, the same day the fence opened once already — for gate and
provider configs — and the reasoning for keeping it a list was explicit:
charters ratchet, and *"gate configs went in, so why not the manifest"* is the
argument the list exists to answer.

## What changed

**The editor clause is narrowed to "nothing a pack cannot compose".** Whole
editor files stay outside the fence, exactly as before. What comes inside is a
**per-pack fragment** — `config/.config/vscode.d/<pack>.jsonc` — carrying
exactly three keys and nothing else:

| Key          | Is                                        | Merged by                                     |
| ------------ | ----------------------------------------- | --------------------------------------------- |
| `settings`   | editor settings, an object                | deep merge, later fragment wins on a conflict |
| `nesting`    | a parent file name → its child file names | union of children, per parent                 |
| `extensions` | recommended extension ids, a list         | union                                         |

`/vwf:init` composes them into the two editor files, in the materializer's
documented composition order, between one marked block placed **first** — so a
key a human writes after the block wins by ordinary later-key precedence, and a
second merge leaves it byte-for-byte. A fourth key is dropped without a word,
which is why `plugins:check` rule 11 now parses every fragment and refuses one.

**One filename exception.** The fragment is `<pack>.jsonc`, except the dprint
gate's, which is `dprint-editor.jsonc`. dprint 0.57.1 discovers *any*
`dprint.jsonc` below the root as a sub-directory config, and a fragment with no
`plugins` array made a bare `dprint check` from a materialized repo's root exit
13 — "No formatting plugins found". Measured, ruled by the user, and stated in
the convention.

**`dprint.json` joins the root allowlist as an `extends` shim** — a root file
whose entire content is `{ "extends": ".config/dprint.json" }`. dprint's config
discovery is root-only (`dprint.json`, `.dprint.json`, `dprint.jsonc`,
`.dprint.jsonc`), `--config` is the CLI's only override, and `extends` accepts a
relative local path. It is the same exception `eslint.config.mjs` and
`wrangler.jsonc` already are: a tool that can only be found at the root leaves a
pack a choice between a root file and a flag every caller has to remember.

The existing-repo pipeline handles a repo that already has a real root
`dprint.json`: the repo's file **moves** into `.config/`, the pack's stand-in
takes its place, and the plan says the settings survive the move. The two are
told apart by content — the pack's stand-in is the file the pack ships, byte for
byte — never by name.

Three more root entries came in beside it, all for the same
discovered-only-at-the-root reason: `.graphifyignore`, `.npmrc` and
`CONTRIBUTING.md`. And `.github/` joins `.config/` as an allowlisted root
**directory**, with `.github/workflows/` refused inside it: a pack states which
task CI runs and never writes the workflow. That half of the fence did not move.

## What a shim is not

**Not a symlink.** A symlink into `.config/` would work on the maintainer's
machine and break on a checkout that does not preserve them, and it makes the
root file's content invisible to every tool that reads rather than resolves it.
The shim is two lines of the tool's own configuration language.

One consequence, measured during the run and not contemplated when the shim was
designed: `includes` is **not** inherited through `extends` (`excludes` is), so
the shipped `.config/dprint.json` carries no `includes` key at all. The shipped
plugin list is the include set. A materialized repo therefore formats a slightly
wider set than the old explicit list did — `.astro`, `.vue`, `.svelte` and
`Dockerfile` — which is stated in the pack's conventions rather than left to be
discovered.

## The alternatives rejected

- **One whole hygiene payload** carrying the editor files. It is exactly the
  lost update the tier exists to avoid: two packs with an opinion about the same
  file, and the last one to land wins silently.
- **A user-level profile for the common set.** It moves a per-repo decision into
  a machine-wide one, and `init` never writes outside the target repo.
- **A symlink** instead of the `dprint.json` shim. Above.
- **Leaving editor settings out entirely.** That is the state this reverses, and
  the two facts below are why it did not hold.

## The two facts that forced it

1. **Recommendations only prompt, and they are per-workspace.** Nothing merges a
   common set into `.vscode/extensions.json`; per-workspace enablement exists
   only in the UI. So a pack that ships a linter and says nothing about the
   editor ships a linter whose editor integration nobody turns on.
2. **The maintainer's real repos already carry this by hand.** A scan of nine
   repos under `virajp/` plus the `95octane` reference found `.vscode/` settings
   files running to 80–180 keys, byte-identical across two of them, and an
   identical 19-extension recommendation list. A baseline every repo copies by
   hand is a baseline a pack should ship.

The user's framing on grouping, quoted because the nesting rule follows it
directly: *"all ignore files are ideally grouped under gitignore"*. The parent
`.gitignore` collects every ignore file any pack ships, each pack nests its own,
and no pack has to know what the others contribute — which is what the
per-parent union of children buys.

## The per-repo profile, and what it costs

`setup:vscode` runs last in `setup:all`, reads the composed recommendation list,
and makes a profile named `$REPO_NAME` match it: install what is listed and
missing, **uninstall what is installed there and no longer listed**. A per-repo
profile rather than a global install, because accepting a recommendation
installs globally and a repo worked on for a week otherwise leaves its whole
toolchain enabled in every window forever; the profile is also what makes
pruning safe.

The cost, stated plainly and measured on VS Code 1.136.1: `--profile` combines
with the install, uninstall and list flags **only once the profile exists**, and
none of the three creates it. Creating one is a windowed action. So the first
run on a repo prints one command plus the share-settings-with-Default step and
exits 0; every run after that reconciles silently. The task is silent on a
machine with no editor at all.

`REPO_NAME` itself is a marked position in the toolchain manager's environment
block, filled by `init` with the repo's slug and written **literally** — never
derived at read time, because a linked worktree's config root is named for the
branch and a derived value would change identity every time somebody cut one.
The launch aliases that read it live in the user's own global configuration and
are not this pipeline's to write: `init` owes the value, not the reader.
