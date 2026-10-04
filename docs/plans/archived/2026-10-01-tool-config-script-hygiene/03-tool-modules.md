# H3 — Tool modules: git, graphify, renovate

- **Wave:** 2
- **Depends on:** H1, H2
- **Owns:** `plugins/stackgen/skills/tool-config/scripts/lib/tools/index.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/tools/git.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/tools/graphify.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/tools/renovate.mjs`,
  `scripts/src/tool-config-hygiene.test.ts`,
  `scripts/src/fixtures/tool-config/hygiene/**`, and for this wave
  `scripts/src/tool-config-mise.test.ts`,
  `scripts/src/tool-config-gates.test.ts`,
  `scripts/src/fixtures/tool-config/mise/**`,
  `scripts/src/fixtures/tool-config/gates/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `TC/references/{git,graphify,renovate}.md` whole; H1's
  `lib/*.mjs`; plan 2's `lib/tools/exclude.mjs` (the module shape).

## Ruling

> H1 — The script copies them — no network.

> H3 — `graphify add-ignore --paths … --for <requester>`; vwf's excludes become
> a `vwf` block; the base block keeps `graphify-out/`.

> H5 — No-doubling follows git's semantics: `x` and `**/x` are the same pattern;
> `/x` is anchored and distinct; a trailing `/` is kept.

> H6 — When a pack asks for a template init's `gitignore:<Name>` fallback block
> holds, the template is handed to the pack's block and the fallback block
> removed.

> H7 — Conflict rows are evaluated before no-doubling; one blank line separates
> template lines from pack patterns; a vendored template's upstream header
> comment is kept; a banner section ends at the next banner or the block's end.

> H9 — A banner section that matches a vendored template exactly is adopted as
> that requester's block; anything else is a `needs-edit` row.

## Edits

1. **`index.mjs`** — register git, graphify and renovate; nothing is
   `handled: "prose"` any more.
2. **`git.mjs`** — `all` lands both files; `add-ignore` patterns in written
   order; `add-ignore --template` copies the vendored file (header kept);
   `add-attribute` (identical line = noted no-op, different value = conflict
   row, requester lines sorted); conflict rows (secret re-include, re-ignore,
   lock-file lines as delete rows) before no-doubling (H5, H7); shares and
   `remove`; the fallback handover (H6); migration per `git.md` §5 with H9.
3. **`graphify.mjs`** — `all` lands `.graphifyignore` and asks git for its two
   lines `for graphify`; `add-ignore --for <requester>`; `remove`.
4. **`renovate.mjs`** — lands `renovate.json` only on `update_bot=renovate`; the
   yield rule over the 13 spellings plus a `package.json` `renovate` key;
   `remove`; migration.
5. **Tests** — `scripts/src/tool-config-hygiene.test.ts` with golden trees,
   offline (assert no network call: no `git ls-remote`, no `fetch`): every verb;
   H5 cases (`node_modules/` from a template not skipped against a root
   `/node_modules/`); H6 handover; H7 ordering; H9 adoption and `needs-edit`;
   renovate yield for each spelling.
6. **Plans 1–2's suites** — `all` now lands git, graphify (and renovate when
   asked) too: refresh their golden trees, or scope their assertions to their
   own tools' paths, without weakening any assertion.

## Verification

- `pnpm vitest run scripts/src/tool-config-hygiene.test.ts scripts/src/tool-config-mise.test.ts scripts/src/tool-config-gates.test.ts`
  green.
- `pnpm exec tsc --noEmit -p scripts` green.
- The full wave gate.

## Guardrails

- Do not touch `lib/*.mjs` (H1) — an engine change you need is an `UNRESOLVED:`
  line.
- Delete with `rm`, never `git rm`.

## Commit

`feat: tool-config script configures git, graphify and renovate from vendored templates`
