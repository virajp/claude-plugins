# H1 — Engine: schema for git, graphify, renovate; the template list

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/scripts/tool-config.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/*.mjs` (never `lib/tools/`),
  `scripts/src/tool-config-core.test.ts`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file as plans 1–2 left it; `TC/references/git.md`
  §1–§4 (verbs, rules, templates).

## Ruling

> H1 — The `.gitignore` templates … are vendored under
> `TC/templates/gitignore/<Name>.gitignore` … The script copies them — no
> network. … Per-repo SHA and `written:` records go away; `upgrade` moves no
> template.

> H3 — One writer: `graphify add-ignore --paths … --for <requester>`.

> H8 — Every pack entry is structured; … template names are validated against
> the vendored set.

## Edits

1. **Grammar and schema** (`lib/cli.mjs`, `lib/schema.mjs`):
   `git add-ignore --paths …` (negations allowed),
   `git add-ignore --template <Name>`,
   `git add-attribute --pattern <p> --attrs <a>,…`,
   `graphify add-ignore --paths …`, each with `--for`. Pack-entry schema:
   `{tool: git, verb: add-ignore, paths: [...]}`,
   `{tool: git, verb: add-ignore, template: <Name>}`,
   `{tool: git, verb: add-attribute, pattern: <p>, attrs: [...]}`,
   `{tool: graphify, verb: add-ignore, paths: [...]}`.
2. **Template list** — export `GITIGNORE_TEMPLATES`, read at load time from the
   file names under `<plugin-root>/skills/tool-config/templates/gitignore/`; the
   schema refuses a `template` not in it, naming the list. The requester
   `gitignore:<Name>` is accepted only from a person's or init's call, never in
   a pack entry.
3. **Lock record** (`lib/record.mjs`) — no `templates:` key with SHAs or
   `written:` hashes is written any more; on read, an old record carrying one is
   accepted and dropped on the next write.
4. **Drift** (`lib/drift.mjs`) — a template block is compared like any other
   block (rendered from the vendored file), no `written:` special case.
5. **Tests** — the new flag shapes and schema entries; an unknown template
   refused naming the vendored list; `gitignore:<Name>` refused in a pack entry;
   an old `templates:` lock key read and dropped.

## Verification

- `pnpm vitest run scripts/src/tool-config-core.test.ts` green.
- `pnpm exec tsc --noEmit -p scripts` green.
- `grep -rn -E 'ls-remote|raw.githubusercontent' plugins/stackgen/skills/tool-config/scripts`
  prints nothing.
- The full wave gate.

## Guardrails

- Do not touch `lib/tools/**` (H3), any asset or template file (H2).
- Delete with `rm`, never `git rm`.

## Commit

`feat: tool-config engine knows git, graphify and the vendored template list`
