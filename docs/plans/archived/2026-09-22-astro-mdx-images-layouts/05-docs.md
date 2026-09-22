# U5 — Docs

- **Wave:** 3
- **Depends on:** U4
- **Owns:** `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`,
  `.claude/skills/stackgen-plugin/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every file you end up editing, top to bottom, before editing
  it. Start by running the survey below rather than by opening files.
- **Lazy-load:** the pack files the earlier units wrote, if a finding needs you
  to check what they actually say.

## Ruling

This is the plan's fixed **docs unit**. Docs ship with the change — the repo's
CLAUDE.md makes that a hard rule: "Any change to plugin behavior must reconcile
`readme.md`, this file, and the manual under `site/src/content/docs/` in the
same commit — stale docs are more harmful than no docs."

Run `vwf:docs-sync` over the run's branch delta
(`.dev-marketplace/plugins/vwf/skills/docs-sync/SKILL.md`) and apply its
findings, plus every `DOCS FALSIFIED:` line units U1–U4 returned, plus the
candidate list below that the plan's survey established.

**No decisions doc.** The interview found no reversal — index.md's Goal says so
explicitly: "No reversal. Nothing here contradicts a standing decision, a
decisions doc, a CLAUDE.md rule or a recalled drawer." So you write nothing
under `docs/memory/decisions/`. The correction to B47's premise is recorded in
the plan's Facts section and needs no doc of its own.

## Edits

1. **Run `vwf:docs-sync` over the branch delta** and collect its findings.

2. **Check these candidates the survey named.** Each is a *candidate*, not a
   confirmed edit — open it, decide whether this change actually falsified it,
   and leave it alone if it did not. Do not edit a passage just because it is
   listed here.

   - `site/src/content/docs/plugins/stackgen.md` — the section "Four bundles on
     one pack — the Astro example". The bundle count and composition have
     **not** changed, so the table is still correct; what may want a line is
     that the one pack behind those four bundles now covers MDX, images and
     layouts.
   - `site/src/content/docs/how-to/operate/choosing-your-stack.md`, around lines
     55-85 — the five-entry `site` round. Its html-versus-astro comparison
     currently reads along the lines of "no content collections, no islands" as
     the reason to pick `html`; with MDX and the image pipeline now explicit in
     the Astro pack, that contrast may deserve updating. Check what it actually
     says before editing.
   - `.claude/skills/stackgen-plugin/SKILL.md` — whether anything there
     enumerates the astro pack's shape or reference set.
   - `readme.md` — the Astro example section, and the favicon-rasterizer mention
     around line 293-299. The rasterizer is unchanged by this plan; U2 was told
     not to conflate it with the `astro:assets` pipeline. Verify the readme
     still reads correctly beside the new images reference.
   - `CLAUDE.md` — likely needs nothing. Its astro-adjacent passages are about
     `site/`, the four projects and the dprint scope, none of which changed. Do
     not invent an edit here.

3. **Apply every `DOCS FALSIFIED:` line U1–U4 returned**, which the orchestrator
   passes you in the dispatch prompt. A passage named there has no other owner.

4. **If a finding lands outside your Owns**, do not reach for it. Report it as a
   `GAP:` line naming the file and the passage.

## Verification

- `mise run code:precommit` exits 0.
- `mise run p:site:check` exits 0 — this is the gate that catches a broken link
  or a bad frontmatter key in the manual, and it runs `astro check`, the build
  and the link checker over `site/dist/**`.
- `mise run code:lint` exits 0.
- Every `DOCS FALSIFIED:` line from U1–U4 is either applied or reported as a
  `GAP:` with its reason.
- `git diff --name-only` for your unit lists only paths inside your Owns.
- Nothing under `docs/memory/decisions/` was created.

## Guardrails

- Do not touch any file under `plugins/` — the pack is U1–U4's and its version
  files are U6's.
- Do not bump any version. `site/package.json` in particular stays at `1.1.40`:
  the plan records the site release as `none`, and `p:site:version` refuses a
  dirty tree anyway.
- Do not create a decisions doc — there is no reversal.
- Delete with `rm`, never `git rm`. Stage nothing; commit nothing.
- **`readme.md`, `CLAUDE.md` and `site/CLAUDE.md` are dprint-formatted**, so
  widening one table cell re-pads every row of that table. `plugins/**/*.md` is
  not — but you do not own any of those.
- `site/src/content/docs/` has strict frontmatter (`title`, `description`,
  `order`) and permits relative `.md` links only inside the collection. A link
  out of the collection breaks `p:site:check`.
- Keep every code span on one line. Never end a table cell in a bare asterisk.

## Commit

`docs: astro pack — reconcile the manual with MDX, images and layouts` — written
by the orchestrator after the wave gate, not by the unit. `docs` is one of the
six types `.config/git-conventional-commits.yaml` allows.
