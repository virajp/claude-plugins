# U10 — Docs

- **Wave:** 6
- **Depends on:** U5, U6, U7, U9
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/stackgen-plugin/**`, `.claude/skills/vwf-plugin/**`,
  `.claude/skills/plugin-authoring/**`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-10-01-*.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md` (run it — see Edits);
  `plugins/vwf/assets/memory.md` (the decision doc shape).

## Ruling

The four reversals and the rulings, quoted from index.md's Goal and Assumed
decisions — every one becomes durable here:

> R1 — rendering and a skill-time script: tool-config ships a node script that
> renders templates at skill time.

> R2 — the script is the source of truth. User: *"The script does the initial
> job of creating the config, LLM knows how to edit the config if needed. A
> greenfield work will not need LLM, brownfield will likely need."*

> R3 — the mise lockfile is gone. User: *"Mise lock is completed gone. It's
> creating more problems and slows down the whole install process. However, this
> introduces version pinning."*

> R4 — the repo-local mise skill is back.

> D1 node, zero deps; D2 exact pins resolved by `mise latest`; D8 flag CLI; D9
> structured pack entries; D12 `mise upgrade`; D13 bare `mise use` forbidden —
> config first, then `mise install`.

User, on scripts: *"bash or node only, don't use python"*.

## Edits

1. **Run `vwf:docs-sync`** over the run's branch delta and apply its findings,
   plus every `DOCS FALSIFIED:` line U1–U8 returned.
2. **The survey's list** — reconcile each with the landed behaviour:
   - `readme.md:296-310` (how tool-config writes files);
   - `CLAUDE.md:164,191,220,239,284`, and its *Tasks* and *CI & Releases*
     passages naming the lock;
   - `.claude/docs/repo-shape.md:163-164,189-190,236-237,263,278`;
     `.claude/docs/ci-and-releases.md:6,25,34-35,66,74`;
     `.claude/docs/plugins.md`;
   - `.claude/skills/stackgen-plugin/SKILL.md:32-52,103-109,175-181,209-220,255,290-294,326,341`;
   - `.claude/skills/vwf-plugin/SKILL.md:101-133,196-206,249` and
     `references/dependencies.md:32-55`;
   - `.claude/skills/plugin-authoring/SKILL.md:55-58,75,83-84,118-144` and
     `references/checks.md` — document U4's and U8's rule changes (structured
     entries, the mise asset allowlist, skill scripts, the `mise use` ban);
   - `site/src/content/docs/plugins/stackgen.md:851-940` and its other
     tool-config passages;
     `site/src/content/docs/plugins/vwf.md:1291-1304,1440-1475` (bootstrap and
     the lock), `:1453,1472`; `site/src/content/docs/plugins/mempalace.md` and
     `vwf.md` `mise use` lines; `how-to/greenfield/single-repo.md:112`;
     `how-to/brownfield/onboard-existing-codebase.md:99,109`.
3. **Decision docs**, one per reversal plus two, under `docs/memory/decisions/`,
   per `memory.md`'s shape, each citing the decision it supersedes:
   `2026-10-01-tool-config-renders-with-a-node-script.md` (R1, D1, D8),
   `2026-10-01-script-is-the-source-of-truth.md` (R2, D7),
   `2026-10-01-mise-lockfile-dropped-exact-pins.md` (R3, D2, D12),
   `2026-10-01-repo-local-mise-skill-returns.md` (R4, D11),
   `2026-10-01-bare-mise-use-forbidden.md` (D13),
   `2026-10-01-pack-entries-are-structured.md` (D9, D10).

## Verification

- `mise run p:site:check` green.
- `mise run code:precommit` green (CLAUDE.md, readme.md and `.claude/` docs are
  dprint-formatted — widening a table cell re-pads every row).
- `grep -rn -E 'mise\.lock|lock-only|mise/locks' readme.md CLAUDE.md .claude site/src/content/docs`
  prints nothing.
- The full wave gate.

## Guardrails

- Touch nothing under `plugins/`; a falsified passage there is a `GAP:` line.
- Never end a table cell in a bare `*`; keep code spans on one line.
- Delete with `rm`, never `git rm`.

## Commit

`docs: tool-config's mise row runs on a node script — lockfile dropped, exact pins, repo-local mise skill`
