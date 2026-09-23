# U3 — docs: the manual and the repo's own references describe stdio

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/vwf-plugin/**`, `.claude/agents/target-verifier.md`,
  `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-23-mempalace-stdio-settings-env.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the wave-1 units' `CHANGED:` and `DOCS FALSIFIED:` lines in
  index.md's Run log; every passage listed under Edits; then
  `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (the decisions-doc
  shape); `docs/memory/decisions/2026-08-13-mempalace-wiring-and-plan.md` (the
  lesson being carried forward); the wave-1 files, only to quote landed wording.

## Ruling

Every decision in index.md's table, 1–8, is the source of truth; quote the
landed wording from U1's and U2's files. In particular:

Decision 1: "Keep stdio. Record the `hallways.json` race and the per-session
embedder as known costs; revisit if mempalace adds a lock, or if lost hallway
links ever show up." Rejected: "revert to the HTTP daemon at `127.0.0.1:8765`;
stdio plus a lock or workaround (parked)."

Decision 4: "The `env` block of `~/.claude/settings.json`: `MEMPALACE_BACKEND`,
`MEMPALACE_QDRANT_URL`, `MEMPALACE_PALACE_PATH` as `~/.local/share/mempalace`,
`MEMPALACE_MAX_BACKUPS`; `$HOME` and `${HOME}` never expand there.
`MEMPALACE_MCP_HTTP_ALLOW_INSECURE_NO_TOKEN` is dropped."

Decision 5: "Documented as optional: `MEMPALACE_EMBEDDING_MODEL`,
`MEMPALACE_EMBEDDING_DEVICE`. A palace is bound to the model it was built with;
switching fails with `EmbedderIdentityMismatchError`; mempalace 3.10.0's
`repair` cannot re-embed a Qdrant palace — dump and refile instead."

Decision 6: "Docs describe stdio only. The supervisor-env trap and the literal
`~` / `${HOME}` lessons are kept once, in the new decisions doc."

## Edits

1. Run `vwf:docs-sync` over the branch delta and apply its findings.
2. **`docs/memory/decisions/2026-09-23-mempalace-stdio-settings-env.md`** — new,
   in the shape its sibling files take; mirror it to the palace `decisions` room
   when the server is up, and skip silently when it is not. It records:
   - **the reversal** — the HTTP-daemon choice and its "stdio is still wrong"
     reason (`.claude/skills/vwf-plugin/references/dependencies.md:200-216` as
     it read before this plan), commit `9dbef1d1`'s move to stdio, and the
     confirmation: stdio for zero setup, the `hallways.json` race and the
     per-session embedder as accepted costs, and the revisit condition;
   - **the palace-path defect** — `--palace` with a variable value takes it
     verbatim, a `~` opens `<cwd>/~/…`, a `${HOME}` from Claude's settings
     created a literal `${HOME}/` directory on 2026-09-23; the fix is reading
     the variable from the environment, where mempalace expands `~`;
   - **the environment's home** — the settings `env` block, what Claude passes
     literally, and the embedder binding with the no-Qdrant-re-embed fact;
   - **the lessons carried from the daemon era** — the supervisor's captured
     environment outranking a fixed shell config (restart the supervisor, not
     the daemon), and the literal-`~` directory under pitchfork's working
     directory — so nothing learned is lost when the manual stops teaching the
     daemon. It supersedes the daemon passages of
     `docs/memory/decisions/2026-08-13-mempalace-wiring-and-plan.md` by naming
     them; that file is the historical record and is not edited.
3. **`.claude/skills/vwf-plugin/references/dependencies.md`** — `:147-150`,
   `:175-181`, `:183-199`, `:201-216`: the stdio entry, what launches it, where
   its environment lives, and the reversed ruling with its accepted costs,
   pointing at the new decisions doc. `:218-233` stays.
   **`references/assets.md:28`** — "daemon" → "server".
4. **`.claude/agents/target-verifier.md:113-115`** — an unconnected mempalace
   MCP server (stdio), not an "HTTP server".
5. **`site/src/content/docs/plugins/mempalace.md`** — `:64-77` (nothing to
   install out of band beyond the tool, Qdrant and the settings `env`);
   `:123-152`, the "Running the server (HTTP daemon)" section, becomes the stdio
   server — renamed, so fix the inbound anchor (edit 7); `:154-181`, the shape
   table's server row and the pitchfork block (the Qdrant rows stay);
   `:200-204`, the settings `env` block per decision 4 plus the embedder
   variables per decision 5; `:208-217`, the backend precedence without the
   manifest forcing a flag; `:253-285`, the supervisor-env trap — replaced by
   one short paragraph on what Claude's settings `env` does and does not expand,
   with a pointer to the decisions doc for the history; `:288-296`, drop
   `/healthz`.
6. **`site/src/content/docs/plugins/vwf.md`** — `:87-98` (the memory paragraph:
   stdio, spawned per session, configured in the settings `env`; "nothing else
   needs installing" names the `env` block), `:203-206`, `:3117`, `:3590-3597`
   (the "memory, over HTTP" heading and the `type: http` declaration become the
   stdio entry), `:3635-3636`.
7. **`site/src/content/docs/how-to/operate/sessions-and-handoff.md:76-85, 110`**
   — "memory daemon" → the memory server; `:85`'s link re-pointed at the renamed
   `mempalace.md` heading's anchor.
8. **`how-to/greenfield/single-repo.md:45-46`**,
   **`how-to/greenfield/cli-product.md:42`**,
   **`how-to/operate/production-feedback-loop.md:103, 316`** — "the memory
   daemon is yours to run" → set the settings `env`; "daemon" → "server".
9. **`readme.md`, `CLAUDE.md`, `.claude/docs/**`** — only where a grep hit reads
   false; the survey found none.
10. Every `DOCS FALSIFIED:` line the wave-1 units returned, applied.

## Verification

- `mise run p:site:check` green — it fails a broken anchor, which is how edit 7
  is proven.
- `mise run code:precommit` green (run twice; the first may reflow).
- `grep -rn -i '8765\|transport http\|pitchfork\|healthz\|ALLOW_INSECURE' .claude/skills/vwf-plugin .claude/agents site/src/content/docs readme.md CLAUDE.md`
  — every hit is explicitly history, or none.
- `grep -rn -i 'mise.*\[env\]' site/src/content/docs/plugins/mempalace.md` — no
  hit telling the reader to put `MEMPALACE_*` there.

## Guardrails

- No edit under `plugins/**` or `scripts/**`; quote landed wording.
- Never edit a version file or a generated file — U4's.
- `docs/memory/decisions/2026-08-13-mempalace-wiring-and-plan.md` is the
  historical record — not edited.
- `CLAUDE.md`, `readme.md` and `site/src/content/docs/**/*.md` are
  dprint-formatted: widening a table cell re-pads the table.
- Do not end a table cell in a bare asterisk; keep every code span on one line.
- The site's link rule (`site/CLAUDE.md`): relative `.md` links only inside the
  collection.
- Delete with `rm`, never `git rm`.

## Commit

`docs: mempalace over stdio — the manual, the references and the reversal` —
written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
