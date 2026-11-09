# U1 — Generator doctrine without a Context7 requirement

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/assets/output-tree.md:47` (the citation
  format), `docs/memory/problems/2026-11-06-context7-pack-facts-stale-or-split.md`.

## Ruling

> D1: The generator works without Context7. It never halts on it and never asks
> the user to install it.

> D2: Context7 first when the user has installed it. Without it: WebFetch of the
> official documentation, WebSearch to find the right page, and the package
> registries for names and versions. Every fact keeps its citation (URL and
> fetch date), as today.

> D3: Each hint keeps the Context7 name and adds 'when Context7 is installed;
> else the official documentation'. Provenance citations of the form
> 'Context7 /<library>, read <date>' stay unchanged.

> D9: U1 changes the stackgen plugin.json description ('per-topic Context7
> research' becomes per-topic research with Context7 first when installed) and
> runs mise x -- mise run p:plugins:marketplace as its last step, keeping the
> output in its commit.

## Edits

1. **`plugins/stackgen/skills/stackgen-stack-template/references/generator.md`**
   — remove the precondition and its halt (as plan 1 left them) at the top;
   state the research order of D2 instead: probe once whether a Context7 server
   is reachable; when it is, one Context7 pass per topic first, and the other
   sources only for a thin topic (D13); when it is not, WebSearch to find the official page, WebFetch to read
   it, and the registry for each package name and version. Keep "record the
   sources per topic". `:226-229`: a reputation `UNRESOLVED:` row halts on its
   own terms (drop "the same way a Context7 outage does"). `:252-253`: "API
   reference stays out of the pack; it is looked up at use time — in Context7
   when installed, else the official documentation".
2. **`plugins/stackgen/assets/artifact-doctrine.md`** — `:236-239`: the
   research order of D2; no halt.
3. **`plugins/stackgen/skills/stackgen-stack-menu/SKILL.md`** — `:69-72`: the
   generator note says the generator researches the uncovered stack, Context7
   first when installed.
4. **`plugins/stackgen/skills/stackgen-reputation/SKILL.md`** — `:163-168`: the
   offline rule stands alone; drop the comparison with a Context7 precondition.
5. **`plugins/stackgen/assets/pack-format.md`** `:363`,
   **`plugins/stackgen/assets/kinds.md`** `:69,132,598`,
   **`plugins/stackgen/agents/stackgen-skill-reviewer.md`** `:55`,
   **`plugins/stackgen/stacks/readme.md`** `:44,98` — the D3 wording.
6. **`plugins/stackgen/.claude-plugin/plugin.json`** — `description` per D9.
   Never touch `version`.
7. **Last step:** `mise x -- mise run p:plugins:marketplace`. Keep its output.

## Verification

- `mise x -- mise run p:plugins:marketplace -- --check` exits 0.
- `command grep -n -i -E 'halt|precondition|reachable' plugins/stackgen/skills/stackgen-stack-template/references/generator.md`
  shows no Context7 halt.

## Guardrails

- Do not touch `plugins/stackgen/stacks/**` save `stacks/readme.md` (U2 owns
  the packs, bundles and inventory).
- `plugins/**/*.md` is not formatted by dprint: match the fold width by hand.
- Change no skill frontmatter.

## Commit

`feat: the stackgen generator works without context7`

> D8: Before it returns, each edit unit runs
> `mise x -- mise run code:format -- --fix <each file it changed>`, on its own
> changed files only.

> D10 (gap 9): find each passage by its quoted text, not by its line number —
> plan 1 rewrites these files first, so the cited lines have moved.

> D11: The generator halts before writing anything, with one plain sentence: no
> research source is reachable (WebFetch, WebSearch and the registries refused
> or offline, and no Context7). A generated pack needs cited facts. The halt
> names no install step.

> D12: From the topic that failed on, the generator uses WebSearch, WebFetch and
> the registries for the rest of the run and does not try Context7 again. The
> research record names the topic where it switched.

> D13: Thin applies to the primary source of the run: Context7 when installed,
> else the official documentation. Other sources are used only for a thin
> topic, and the research record discloses each thin topic, as today. The
> registries are always read for package names and versions. U1 updates the
> thin-research checks of stackgen-skill-reviewer.md (about lines 45, 78 and
> 83) and generator.md to match.

> D14 (gaps 1-3): D13 wins over Edit 1 — with Context7 installed, the web
> sources serve thin topics only; the registries are always read. The reputation
> UNRESOLVED halt stays on its own terms: Edit 2 (artifact-doctrine.md) and
> generator.md (the reputation precondition, about line 37) drop only the
> Context7 comparison and its remedy.

> D15: When every source fails in the middle of the run, the generator halts
> with the D11 sentence. It writes no pack and keeps nothing partial; the
> research record lists the topics that were done, and the next run starts
> again.

> D16: After a mid-run Context7 failure, the official documentation is the
> primary source for the thin rule for the rest of the run. A topic half
> researched in Context7 when it failed is researched again from its start with
> the new sources.

> D17 (gap 2): the exact phrase "when Context7 is installed" binds every new
> sentence: the generator.md replacement, the stack-menu note and the
> plugin.json description.

> D18: Context7 with no library or no documents for a technology is a thin
> topic under D13, not a failure. Only a tool error or a timeout is a failure
> that makes the run switch sources under D12.

> D19: With Context7 reachable and the web sources refused, the generator writes
> a thin topic from Context7 and discloses it as thin, with the note web sources
> unreachable. A registry that cannot be read gives the existing reputation
> UNRESOLVED halt.

> D20: WebFetch is the one necessary tool, because it reads the page. Without
> WebSearch the generator finds the official page through the registry homepage
> link. Without WebFetch and without Context7 it halts with the D11 sentence.

> D21: For D12 the switch topic is a note in the component existing
> .claude/stackgen/citations/<slug>.yaml. For a D15 halt the finished topics are
> listed in the halt report to the user only; no file is written. The
> Verification grep accepts the D11 sentence ("no research source is
> reachable") and refuses only a halt for lack of Context7 alone.
