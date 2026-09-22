# U6 — Gates and bump

- **Wave:** 4
- **Depends on:** U5
- **Owns:** `plugins/stackgen/stacks/framework/astro/pack.yaml`,
  `plugins/stackgen/stacks/bundles/astro-ssg.md`,
  `plugins/stackgen/stacks/bundles/astro-ssr.md`,
  `plugins/stackgen/stacks/bundles/astro-hybrid.md`,
  `plugins/stackgen/stacks/bundles/astro-csr.md`,
  `plugins/stackgen/stacks/inventory.md`,
  `plugins/stackgen/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `.config/mise/tasks/p/plugins/inventory` and
  `.config/mise/tasks/p/plugins/marketplace` if a generator misbehaves.

## Ruling

This is the plan's fixed **gates-and-bump unit**. It bumps each released
project's version per the consent block, runs the generators the plan names, and
passes the full wave gate. Its report is the run's final gate.

From index.md's Consent block: both release rows read `none`. **No tag is cut
and nothing is published.** The stackgen version still moves in the tree,
because that is what an install pins to and what `p:plugins:local` stages. The
site is not bumped at all.

From index.md's Facts: "The pack is `0.3.0` and the astro skill's own
frontmatter is `0.1.0`. Neither `1.27.0` nor `0.4.0` nor `0.2.0` lands on a 13
or 17 component, so the version guard does not bite."

From the Shared-file rule: every version file and both generated files are yours
alone. From the Waves section: "The version bump, the four pins and both
generated files must land in one commit; splitting them fails
`inventory --check`."

D5 is **not** yours: `SKILL.md`'s frontmatter `version:` was bumped to `0.2.0`
by U4, in the file U4 owns. Do not touch `SKILL.md`.

## Edits

Do these in order. The order matters — the generators read what you wrote.

1. **`plugins/stackgen/stacks/framework/astro/pack.yaml`** — bump `version:`
   from `0.3.0` to `0.4.0` (minor: the pack gained three references). Change
   nothing else in this file. In particular leave the `conditional:` block
   exactly as it is — no payload file was added under `config/`, so its one
   entry still resolves.

2. **The four bundle files** — in each of `astro-ssg.md`, `astro-ssr.md`,
   `astro-hybrid.md` and `astro-csr.md`, change the `framework/astro@0.3.0`
   component pin to `framework/astro@0.4.0`. That is the **only** change to
   these four files. Do not touch `default:`, `platforms:`, `kind:`, `axis:`,
   any other component pin, or any prose. `astro-ssg.md` keeps `default: true`
   and all four keep `platforms: [site]`.

   A pin that disagrees with `pack.yaml` fails inventory generation outright
   with a version-mismatch error, so all five edits must be consistent.

3. **`plugins/stackgen/.claude-plugin/plugin.json`** — bump `"version"` from
   `1.26.0` to `1.27.0` (minor). This file has no bump task; edit it directly.
   Do not touch `plugins/vwf/.claude-plugin/plugin.json`.

4. **Regenerate, do not hand-write:**

       mise run p:plugins:inventory
       mise run p:plugins:marketplace

   These rewrite `plugins/stackgen/stacks/inventory.md` and
   `.claude-plugin/marketplace.json` (and the gitignored dev manifest). Never
   edit either generated file by hand.

5. **Run the full wave gate** — all nine lines from index.md — and report the
   result. This is the run's final gate.

## Verification

Every line of index.md's Wave gate must exit 0 after your edits:

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run p:plugins:shellcheck
    mise run p:plugins:npm-normalize-test
    pnpm vitest run
    pnpm exec tsc --noEmit -p scripts
    mise run code:precommit
    mise run p:site:check

Plus, specifically:

- `pack.yaml` reads `version: 0.4.0` and all four bundles pin
  `framework/astro@0.4.0` — grep all five and compare the strings.
- `plugins/stackgen/.claude-plugin/plugin.json` reads `1.27.0`.
- `plugins/vwf/.claude-plugin/plugin.json` is unchanged at `19.43.1`.
- `site/package.json` is unchanged at `1.1.40`.
- No version component anywhere you wrote equals 13 or 17.
- `astro-ssg.md` still carries `default: true` and all four bundles still
  declare `platforms: [site]`.
- `git diff --name-only` for your unit lists exactly the eight owned files.
- `plugins/stackgen/stacks/framework/astro/conventions.md` is absent from the
  whole branch diff — the orchestrator's D2 check.

## Guardrails

- Do not touch `SKILL.md` — U4 owns it, version line included (D5).
- Do not touch any of the three new references or the four mode references.
- Do not touch `conventions.md`.
- Do not touch `plugins/vwf/**` or `site/**`.
- Never hand-edit `inventory.md` or `.claude-plugin/marketplace.json` —
  regenerate them.
- Do not cut a tag and do not run `p:plugins:release`. Both release rows read
  `none`.
- Do not run `p:plugins:local` — that is an after-landing step, the
  orchestrator's, run outside the worktree.
- Delete with `rm`, never `git rm`. Stage nothing; commit nothing.
- Gate lines take the `--` separator before a flag — write
  `mise run p:plugins:inventory -- --check`. The bare `--check` form is rejected
  by mise.
- `plugins/**/*.md` is not dprint-formatted; the bundle files are markdown, so
  match fold width by hand. Changing one character of a pin should not re-pad
  anything.

## Commit

`ops: stackgen 1.27.0 — astro pack 0.4.0 and its pins`

Written by the orchestrator after the wave gate, not by the unit. `ops` is one
of the six types `.config/git-conventional-commits.yaml` allows. Keep the
subject on one line when writing it.
