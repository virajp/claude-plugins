# U1 — Rule 4 widened, rule 13 added, rule 6 narrowed

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `scripts/src/plugins.ts` (read-only — `readPlugin`,
  `frontmatterBlock`, `readText`; never edit it),
  `.claude/skills/plugin-authoring/references/checks.md` (the prose the rules
  are documented in; never edit it — U7 owns it).

## Ruling

Quoted from index.md:

> **1. Rule 13 scope.** Refuse **all four** citation forms in landed tiers: (a)
> the literal `${CLAUDE_PLUGIN_ROOT}` anywhere, pathless included; (b) bare
> `assets/<path>.(md|yml|yaml)`; (c) a `../` chain whose resolved target leaves
> the file's own `skills/<name>/` directory (or, for a non-skill landed file,
> any `../` chain at all); (d) `<type>/<slug>/<segment…>` where `<type>` is a
> `stacks/*` directory other than `bundles`.
>
> **2. Landed tiers.** `stacks/*/*/{skills,agents,rules,hooks,config}/**`,
> `stacks/*/*/conventions.md`, `stacks/bundles/*.md`. `config/` is walked with
> `filesUnder`, since `plugin.files` drops dot segments.
>
> **3. Bare component refs.** `<type>/<slug>` with no trailing `/` (and
> `<type>/<slug>@<version>`) is an identifier and is never refused; only a
> trailing `/` plus a segment makes a path.
>
> **4.** Form (a) applies to every landed file; forms (b)–(d) to `.md` files
> only, fenced blocks stripped first.
>
> **5. Rule 6 narrows.** `checkRootRefs` skips landed-tier files (the same
> predicate rule 13 uses), so a bad reference there yields exactly one finding.
>
> **6. Rule 4 widens.** `checkFrontmatterYaml` also parses
> `stacks/*/*/skills/*/SKILL.md` and `stacks/*/*/agents/*.md`; `rules/*.md`
> excluded because frontmatter is optional there.
>
> **14. Rule 13's finding shape.** Reports `stackgen:<path>:<line>` like rule
> 12, with the form matched and the replacement doctrine in the message.

Why the rule exists, for the doc comment: a pack is copied verbatim into a
target repo's `.claude/` tree, which must work for every collaborator with no
plugin installed (`plugins/stackgen/assets/output-tree.md:3-6`). Inside the
plugin every one of these citations resolves, so rule 6 is silent; after landing
none of them does, and nothing reports it. `conventions.md` and a bundle's body
land as the body of `.claude/stackgen/templates/<slug>.md`; skills land in
`.claude/skills/`; so even a skill's `../../../conventions.md` breaks.

## Edits

1. **`scripts/src/check.ts`** — a landed-tier predicate, shared by rules 6 and
   13. Add near the `PACK_*` constants (255–358):
   - `LANDED_TIERS = ["skills", "agents", "rules", "hooks", "config"]`.
   - `isLandedPath(path: string): boolean` — true for
     `stacks/<type>/<slug>/(skills|agents|rules|hooks|config)/…`,
     `stacks/<type>/<slug>/conventions.md`, and `stacks/bundles/<x>.md`, where
     `<type>` is anything but `bundles`.
   - `landedFiles(plugin): Iterable<{path, absolute}>` — every file under each
     `stacks/*/*` pack's five tiers via `filesUnder` (dot-safe), plus the pack's
     `conventions.md` if present, plus `stacks/bundles/*.md`. Do **not** rely on
     `plugin.files` for `config/`.
   - `stackTypes(plugin): string[]` — the `stacks/*` directory names minus
     `bundles`, read from the tree at check time so a new type extends form (d)
     without an edit.
2. **`scripts/src/check.ts`** — rule 13, `checkLandedCitations(plugin)`, called
   from `check()` after `checkRetiredVocabulary` in the per-plugin loop (line
   91). For every landed file:
   - read with `readText`; for `.md` files apply `stripFences` (1057) **but keep
     line numbers stable** — replace each fenced block with the same number of
     empty lines rather than deleting it, or record fence line ranges and skip
     them; the finding must carry the real line.
   - form (a): `/\$\{CLAUDE_PLUGIN_ROOT\}/` on every file, every line.
   - form (b), `.md` only:
     `/(?<![\w./])assets\/[A-Za-z0-9_./-]+\.(?:md|ya?ml)\b/`.
   - form (c), `.md` only: each match of
     `/(?<![\w])(?:\.\.\/)+[A-Za-z0-9_./-]+/` resolved with
     `path.resolve(dirname(file), match)`; a finding when the file is under
     `skills/<name>/` and the target is outside that `skills/<name>/` directory,
     or when the file is not under `skills/` at all (a `conventions.md` or
     bundle has no legitimate `../`).
   - form (d), `.md` only: `/(?<![\w./-])(?:<types>)\/[a-z0-9-]+\/[A-Za-z0-9_]/`
     with `<types>` built from `stackTypes()` and regex-escaped; a bare
     `<type>/<slug>` or `<type>/<slug>@…` does not match by construction.
   - each hit: `{ scope: \` ${plugin.dir}:${path}:${line}\`, message
     }`where the
     message names the form and says what replaces it — a cited asset is named
     by role or its rule stated inline; a sibling pack's conventions are "the`<type>/<slug>`
     component's conventions, in this composition's template"; never a
     plugin-relative path, because this file lands in a repo that has no plugin.
   - a doc comment in the same voice as rule 12's, stating the doctrine above
     and why each form is separately matched (the five false positives the
     survey found: intra-skill `../` links in
     `app-framework/flutter/skills/flutter-ios/references/standards.md` and
     fenced `extends` examples in
     `toolchain-gate/tsconfig/skills/tsconfig/SKILL.md`).
3. **`scripts/src/check.ts`** — rule 6 (`checkRootRefs`, 706–731): `continue`
   when `isLandedPath(file.path)`; extend its doc comment with one sentence: a
   landed file may not carry the token at all, and rule 13 owns that.
4. **`scripts/src/check.ts`** — rule 4 (`checkFrontmatterYaml`, 645–670): the
   iterated list becomes `plugin.skills`, `plugin.agents`, plus every
   `plugin.files` path matching
   `/^stacks\/[^/]+\/[^/]+\/skills\/[^/]+\/SKILL\.md$/` and
   `/^stacks\/[^/]+\/[^/]+\/agents\/[^/]+\.md$/`. Extend the doc comment: pack
   skills are the artifacts that actually land in users' repos, and they were
   never parsed before. Leave the CLI summary line
   (`checked N plugins, N
   skills, N agents`) as it is; adding a pack-skill
   count is a `DECIDED:` if you choose to.
5. **`scripts/src/check.test.ts`** — new tests, in the existing fixture idiom
   (`tree`, `skill`, `messages`; a pack is made by naming its paths under
   `stacks/…` in `files`):
   - "frontmatter": a pack skill at `stacks/language/x/skills/x/SKILL.md` with a
     strict-invalid description (an unquoted `a: b` value) produces one finding
     naming that path; a valid one produces none; a pack agent at
     `stacks/language/x/agents/x.md` likewise.
   - a new `describe("landed citations")`: one test per form, each with a
     positive and a negative — (a) `${CLAUDE_PLUGIN_ROOT}` in a pack skill, in a
     `conventions.md`, in a bundle body, and in
     `stacks/…/config/.config/mise/tasks/x` (dot-dir, executable) each fire; the
     same token in `skills/one/SKILL.md` at the plugin root does not; (b)
     `` `assets/contracts/secrets.md` `` fires,
     `` `${CLAUDE_PLUGIN_ROOT}/assets/x.md` `` is counted once (as (a), not
     twice), and `` `my-assets/x.md` `` does not fire; (c)
     `../../../conventions.md` from `skills/x/references/y.md` fires,
     `../references/z.md` from the same file does not, `../x.md` in a
     `conventions.md` fires; (d)
     `` `cloud-provider/cloudflare/conventions.md` `` fires, the bare
     `` `cloud-provider/cloudflare` `` and
     `` `cloud-provider/cloudflare@1.0.0` `` do not, and a type not present
     under `stacks/` does not; fences: any of the forms inside a ``` block does
     not fire, and a hit after a fence reports its true line number.
   - "root-relative references": a landed file carrying
     `${CLAUDE_PLUGIN_ROOT}/assets/nope.md` yields **exactly one** finding, and
     its scope carries a line number (rule 13's), proving rule 6 skipped it.
   - the corpus assertion at line 24 stays as is. It **will be red** until U3–U6
     land in the same wave; do not weaken it and do not touch anything under
     `plugins/`.

## Verification

- `pnpm exec tsc --noEmit -p scripts` clean.
- `pnpm vitest run scripts/src/check.test.ts` — every new test green; the corpus
  assertion is expected red only because of the citations U3–U6 are rewriting
  concurrently. Run `node scripts/src/check.ts` and confirm every finding it
  prints is a rule-13 finding under `plugins/stackgen/stacks/` with a line
  number, and that the count is in the region of 163 (the survey's population) —
  a count far above that means a false positive class; report it as a `GAP:`
  with the pattern.
- `node scripts/src/check.ts 2>&1 | grep -c "not executable\|frontmatter"` is 0:
  the widened rule 4 lands green on all 69 pack skills.
- dprint: `scripts/**/*.ts` **is** formatted — run
  `mise x -- dprint check scripts/src/check.ts scripts/src/check.test.ts`.

## Guardrails

- Do not edit `scripts/src/plugins.ts`, anything under `plugins/`, or any doc. A
  doc the change falsifies goes in `DOCS FALSIFIED:`.
- Keep the fence-stripping line-stable; a finding on the wrong line is worse
  than none because it sends the author to a sentence that is fine.
- The lookbehinds are load-bearing: `(?<![\w./])` on (b) keeps
  `${CLAUDE_PLUGIN_ROOT}/assets/…` from double-counting and keeps
  `pnpm-assets/x.md` out; `(?<![\w./-])` on (d) keeps
  `cloudflare-cloud-service/…` out.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`feat(scripts): plugins:check parses pack skill frontmatter and refuses plugin-relative citations in landed pack files`
— written by the orchestrator after the wave gate, not by the unit.
