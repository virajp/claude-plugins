# U5 — docs: every passage the forge pass falsifies, and the decisions doc

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/repo-shape.md`,
  `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/SKILL.md`,
  `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-20-init-forge-pass.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the four wave-1 units' `CHANGED:` and `DOCS FALSIFIED:` lines
  as the orchestrator hands them over, then every passage listed under Edits,
  then `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (the decisions-doc
  shape); the wave-1 files themselves, only to quote the landed wording.

## Ruling

Every decision in index.md's table, 1–11, is the source of truth for what the
docs now say; quote the landed skill wording rather than this plan's. The two
reversals from index.md's Goal become one decisions doc:

"init's git pass may now **write forge settings** — the default branch and
branch protection — through the forge CLI, on consent. That supersedes the
ruling that init reaches no remote setting and that the default branch is set by
hand per the hygiene pack's `CONTRIBUTING.md`
(`docs/memory/decisions/2026-09-06-init-owns-the-first-commit.md` §forge, and
the D17-superseded passage of
`2026-09-12-task-library-configures-each-gate-once.md`); the by-hand line
survives as the fallback for a forge with no CLI. Second, a widening rather than
a reversal: the backlog skill's missing-project procedure … becomes reachable
from init as well as from `/vwf:backlog add`; the skill stays the project's sole
owner, and init never runs `gh project create`."

Decision 11 — the pass is the **forge pass** in every doc.

## Edits

1. Run `vwf:docs-sync` over the branch delta and apply its findings.
2. **`docs/memory/decisions/2026-09-20-init-forge-pass.md`** — new, per the
   memory shape: the two reversals above, each naming the doc it supersedes and
   the passage that survives; the rulings 1–8 in brief as the standing shape of
   the forge pass; a "what init still never does" list (creates no remote, no CI
   workflow, no setting beyond the three, no project through the API). The two
   superseded docs get one `Superseded by` line each at the top of the affected
   section — never rewritten.
3. **`CLAUDE.md`** — `:266-280` (the init paragraph: "asks seven questions"
   stays true but the enumeration of the first, second and fifth gains the sixth
   — visibility, with licence and security under it — and the git-pass sentence
   gains the forge pass and drops "it never touches the forge's own settings,
   which a maintainer sets once by hand"); `:295` six → seven predicates; `:462`
   if it restates either.
4. **`readme.md:117`** — the reshape summary, if it names the six or the by-hand
   rule.
5. **`.claude/docs/repo-shape.md:283`**;
   **`.claude/skills/vwf-plugin/SKILL.md`** `:86`, `:103`, `:120`, `:130-134`
   (six → seven at `:133`), `:231`; **`references/skills-and-agents.md:27-28`**
   (init and setup rows), `:40` (doctor row);
   **`references/dependencies.md:43`** (six → seven).
6. **`.claude/skills/stackgen-plugin/SKILL.md:141`** (licence texts — now copied
   for public repos only), `:167-169` unchanged unless the pack's
   `conventions.md` wording moved.
7. **`site/src/content/docs/plugins/vwf.md`** — `### /vwf:init` (`:884-1300`):
   the command-table cell at `:811-812` ("a licence"), `:887-891`, `:922`
   (SECURITY/LICENSE outcome), `:990`, `:996` ("Seven questions" — the list
   gains visibility with 6a/6b), `:1049-1050` (licence per repo → under
   visibility), `:1151`, the git pass `:1190-1238` (a new forge-pass paragraph
   after the push, the consent, the by-hand fallback, the backlog step),
   `:1220`, "When it runs again" `:1253-1257` (forge drift), the doctor/reshape
   passage `:1272-1314` (seven predicates, (g) named), `:1333`;
   `### /vwf:backlog` (`:2439`) — the missing-project sentence names init as the
   second caller; `### /vwf:doctor` wherever the six are enumerated.
8. **`site/src/content/docs/plugins/stackgen.md`** — `:593-604` (hygiene ships
   LICENSE — for public repos; CONTRIBUTING's by-hand line is the fallback),
   `:741`, `:893`, `:905`.
9. **`site/src/content/docs/how-to/greenfield/single-repo.md:59-84`** — the
   walkthrough of the seven questions (visibility appears, licence and security
   under it) and the git pass (forge pass, one consent);
   **`how-to/greenfield/multi-repo.md:54`, `:165`**;
   **`how-to/brownfield/onboard-existing-codebase.md:84`** (six → seven), `:98`.
10. Every `DOCS FALSIFIED:` line the wave-1 units returned, applied.

## Verification

- `mise run p:site:check` green (build, pagefind, the link checker over
  `dist/**` and the markdown mirror).
- `mise run code:precommit` green — `readme.md`, `CLAUDE.md` and `site/**` are
  dprint's; widening a table cell re-pads every row, let the formatter do it.
- `grep -rn "six baseline\|six predicates" readme.md CLAUDE.md .claude site/src/content/docs`
  — zero hits.
- `grep -rn "maintainer sets once by hand\|never touches the forge" readme.md CLAUDE.md .claude site/src/content/docs`
  — zero hits, or each remaining hit reads as the non-GitHub/GitLab fallback.
- `grep -rn "forge pass" CLAUDE.md site/src/content/docs/plugins/vwf.md` — at
  least one hit in each.

## Guardrails

- No edit under `plugins/**` — the four wave-1 units own the plugin tree; quote
  their landed wording.
- Never edit a version file or a generated file — U6.
- The two superseded decision docs get a `Superseded by` line only; their bodies
  stand as the record.
- Do not end a table cell in a bare asterisk (dprint and the linter never
  converge on it).
- The site's link rule (`site/CLAUDE.md`): every cross-page link is a
  site-relative path the checker can resolve; no bare anchor to a heading that
  moved.
- Delete with `rm`, never `git rm`.

## Commit

`docs: init forge pass — visibility, protection, backlog project` — written by
the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml`; no scopes.
