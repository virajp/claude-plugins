# U3 — the bundle `default:` flag, the menu emits it, the kind admits a file canvas

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md`,
  `plugins/stackgen/assets/pack-format.md`, `plugins/stackgen/assets/kinds.md`,
  `plugins/stackgen/stacks/readme.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/stacks/bundles/claude-design.md`,
  `bundles/lovable.md`, `bundles/stitch.md` (the three design bundles — read for
  shape, do not edit); `plugins/stackgen/assets/taxonomy.md:81-85`, `:181-190`
  (the design-tool rows — read; edit only if they enumerate what a design-tool
  ships).

## Ruling

Quoted from `index.md`:

> **1 — Slug and default.** The pack's slug is `claude-code`. A bundle's
> frontmatter may carry `default: true`; the stackgen menu payload passes it
> through on that entry; vwf's architecture menu **preselects whichever entry
> carries it**, as a generic rule that names no tool. No config-format bump.

> **8 — Kind spec.** `kinds.md`'s design-tool entry admits a **file canvas**
> (the tool's source is a committed directory the adapters read) beside the
> hosted-canvas tools, and an optional user-invocable authoring skill beyond the
> three fixed ones. Doctrine only; the checker asserts the three, not the
> fourth.

This unit writes no bundle and sets no flag — U5 does, in wave 2. It defines the
key and makes the menu carry it.

## Edits

1. **`plugins/stackgen/assets/pack-format.md`** — in the bundle-file section
   (`:186-200` today), add `default: true` as an optional frontmatter key: what
   it means (the menu entry vwf preselects on this axis), the rule (at most one
   bundle per axis; the checker refuses two), and that it is never set on an
   `unconditional` bundle.
2. **`plugins/stackgen/skills/stackgen-stack-menu/SKILL.md`** — in the payload
   (`:51-73`), each `templates:` entry passes through `default: true` when its
   bundle file carries it, and omits the key otherwise. One sentence in the
   procedure: the flag is copied from the bundle, never computed. Keep the
   "reads nothing" rule (`:114-116`) intact — the bundle file is the skill's own
   tree.
3. **`plugins/stackgen/assets/kinds.md`** — in the design-tool entry
   (`:911-960`): a paragraph admitting the file-canvas variant — the tool's
   source of truth is a committed directory under the target repo's `docs/`, the
   adapters read files instead of calling a server, and the pack may ship one
   extra, user-invocable authoring skill that writes that canvas; the three
   fixed adapter names and their model-invocability are unchanged and are what
   the checker asserts. Name the canvas path pattern `docs/design/<project>/` as
   the convention; name no tool.
4. **`plugins/stackgen/stacks/readme.md`** — where the design-tool packs are
   listed (`:114` today), the sentence that a fourth tool is the terminal itself
   with a file canvas, and that the bundle flagged `default: true` is what the
   menu preselects. Do not write a count.

## Verification

- `mise run p:plugins:check` green — rule 12 over these files.
- `command grep -n 'default' plugins/stackgen/assets/pack-format.md plugins/stackgen/skills/stackgen-stack-menu/SKILL.md`
  shows the key documented in the bundle section and carried in the payload.
- `command grep -n -i 'file canvas\|docs/design' plugins/stackgen/assets/kinds.md`
  hits inside the design-tool entry.
- `command grep -l '^default:' plugins/stackgen/stacks/bundles/*.md` is empty —
  this unit sets no flag.

## Guardrails

- Do not touch `plugins/stackgen/stacks/bundles/**` or
  `plugins/stackgen/stacks/design-tool/**` — U5's, wave 2.
- Do not touch `plugins/vwf/**` — U2 writes the vwf half concurrently.
- Do not touch `scripts/**` — U4 writes the checker concurrently.
- Delete with `rm`, never `git rm`.
- `plugins/**/*.md` is not dprint-formatted — match each file's fold width by
  hand. Strict-YAML frontmatter on `SKILL.md`.
- Never end a table cell in a bare asterisk.

## Commit

`feat: stackgen — a bundle can mark itself the axis default; the kind admits a file canvas`
— written by the orchestrator after the wave gate, not by the unit. Type `feat`
is in `.config/git-conventional-commits.yaml`; the file lists no scopes.
