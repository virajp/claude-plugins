# U7 — The site manual: one executor, the retired anchor

- **Wave:** 3
- **Depends on:** U2, U4, U5
- **Owns:** `site/src/content/docs/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`;
  `site/CLAUDE.md` (the link rule, the gate); the cited lines of
  `site/src/content/docs/plugins/vwf.md` — :153, :227, :356, :509, :811,
  :817-818, :826, :829, :858, :1909 (`### /vwf:execute`), :1932, :2106, :2114,
  :2303, :2315, :2356, :2370, :2414-2415, :2421 (the `### /vwf:change-execute`
  heading and its section to :2540 or the next `###`), :2428-2429, :2446, :2459,
  :2658, :2866-2867; `how-to/operate/ad-hoc-change.md` :16, :108, :166, :172,
  :194, :291; `how-to/index.md:69`. Then the wave-2 result:
  `plugins/vwf/skills/execute/SKILL.md` and its references.
- **Lazy-load:** `how-to/greenfield/single-repo.md:437` ("The execute merge
  gate" — its own anchor, linked from four how-tos; untouched unless its body
  names `change-execute`).

## Ruling

Decision 12: "The `### /vwf:change-execute` heading is removed from
`plugins/vwf.md`; its content folds into `### /vwf:execute`. The nine inbound
`#vwfchange-execute` links re-point to `#vwfexecute`. `ad-hoc-change.md` keeps
its title and description; its body names `/vwf:execute`. No redirect exists to
keep."

Decisions 2, 3, 4, 5, 6 as they describe what `/vwf:execute` now does — quoted
from `index.md` when the section is written.

## Edits

1. Run `/vwf:docs-sync` over the run's branch delta scoped to `site/` and apply
   its findings plus every `DOCS FALSIFIED:` line for `site/`.
2. **`plugins/vwf.md`**:
   - `### /vwf:execute` (:1909-): rewrite for one executor —
     `<folder> |
     next` for both kinds; the claim; the Kind switch (`edit`
     units of a wave together, `code` units one at a time through TDD / engines
     / review + security); the wave review after every wave, contract scope;
     acceptance, UX and the blueprint reconcile only with `covers:`; the Run
     log; the report; landing per consent, archiving when no gap is open;
     after-landing asks. Fold in whatever of the `### /vwf:change-execute`
     section (:2421-) is not already said: the fixed final units, UNRESOLVED
     blocking and resume, the wave gate, "a session that has done nothing else".
   - Delete the `### /vwf:change-execute` heading and its section.
   - Commands table: delete the `change-execute` row (:818); the `execute` row
     (:811) says both kinds.
   - The five inbound links in this file (:356, :1932, :2303, :2370, :2658) →
     `#vwfexecute`; every other hit (:153, :227, :509, :826, :829, :858, :2106,
     :2114, :2315, :2356, :2414-2415, :2428-2429, :2446, :2459, :2866-2867): one
     executor, no "both executors" / "two executors" / "either executor".
3. **`how-to/operate/ad-hoc-change.md`** — title and description unchanged; :16
   and :291 links → `#vwfexecute`; :108, :166, :172, :194:
   `/vwf:execute
   <folder>` / `/vwf:execute next`.
4. **`how-to/index.md:69`** — wording.
5. Site markdown is dprint-formatted: `mise run code:format` over
   `site/src/content/docs/` only. The link rule in `site/CLAUDE.md` binds.

## Verification

- `grep -rn 'change-execute\|vwfchange-execute' site/src/content/docs/` prints
  nothing.
- `grep -rn 'both executors\|two executors\|either executor\|own kind' site/src/content/docs/`
  prints nothing.
- `grep -n '^### /vwf:execute' site/src/content/docs/plugins/vwf.md` hits once;
  `grep -c '^### /vwf:change-execute' site/src/content/docs/plugins/vwf.md`
  prints `0`.
- `mise run p:site:check` green — the link checker over `dist/**` and the
  markdown mirror.
- `mise run code:precommit` green.

## Guardrails

- Do not touch `readme.md`, `CLAUDE.md`, `.claude/**` (U6), `plugins/**`,
  `site/CLAUDE.md`, `site/src/**` outside `content/docs/`, `site/dist/`.
- Keep the `### /vwf:execute` heading text exactly — four files link its anchor
  after this unit.
- Never `--fix` outside Owns.
- No escaped backtick inside a code span; no table cell ending in a bare
  asterisk; write with the Write tool.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`docs: one executor — the manual` — written by the orchestrator after the wave
gate. Type `docs`; no scope.
