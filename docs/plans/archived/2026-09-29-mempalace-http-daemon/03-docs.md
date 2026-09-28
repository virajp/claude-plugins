# U3 — Docs

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `site/src/content/docs/**`, `.claude/**`,
  `docs/memory/decisions/2026-09-29-mempalace-http-daemon.md`, `CLAUDE.md`,
  `readme.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`; the committed wave-1
  files; index.md's Goal and Facts; every `DOCS FALSIFIED:` line U1 and U2
  returned; `docs/memory/decisions/2026-09-23-mempalace-stdio-settings-env.md`
  (the record being superseded — read-only) and one other record under
  `docs/memory/decisions/` for the format.
- **Lazy-load:** `site/CLAUDE.md` before touching a heading or an anchor.

## Ruling

> - Decision 1: vwf's mempalace server is an HTTP daemon at `127.0.0.1:8765` for
>   every vwf user, as the manifest declares.
> - Decision 2: Generically: the command
>   `mempalace-mcp --transport http --host 127.0.0.1 --port 8765`; its env —
>   `MEMPALACE_BACKEND` and `MEMPALACE_QDRANT_URL` always set together, and
>   `MEMPALACE_PALACE_PATH` — set on the supervisor that runs it, not in
>   `~/.claude/settings.json`; it must be running before a Claude session
>   starts; pitchfork and launchd named as examples of a supervisor.
> - Decision 4: The `mempalace.md` heading "Running the server (stdio)" becomes
>   "Running the server (HTTP daemon)", and both inbound links follow.
> - Decision 5: The 2026-09-23 record stays as history; a new
>   `docs/memory/decisions/2026-09-29-mempalace-http-daemon.md` supersedes it,
>   quoting the user's ruling.
> - Decision 7: Any comment or sentence a unit adds is one sentence, wrapped at
>   the fold.

The user's ruling, to quote in the decision record: "HTTP is intended" — for
every vwf user, reversing the 2026-09-23 stdio decision.

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply findings inside Owns.
2. **`site/src/content/docs/plugins/mempalace.md`** — every stdio passage in the
   Facts (:66, :123-151, :174-176, :209-210, :254-264, :307-318) to decisions 1
   and 2; the heading per decision 4; doctor's new reachability check named
   where the page covers doctor.
3. **`site/src/content/docs/plugins/vwf.md`** — :90-98, :206-208, :3741-3748
   ("### mempalace — memory, over stdio" becomes the HTTP daemon); doctor's new
   degradation where the page lists doctor's checks.
4. **`how-to/greenfield/single-repo.md:45-47`** — the env goes on the
   supervisor; both inbound anchors (`single-repo.md:47`,
   `how-to/operate/sessions-and-handoff.md:85`) follow decision 4.
5. **`.claude/skills/vwf-plugin/references/dependencies.md`** :177-230 — the
   server is the HTTP daemon; the "This reverses an earlier ruling" passage
   names this reversal and the new record.
6. **`.claude/agents/target-verifier.md`** :113-115 — the finding it looks for
   is the HTTP entry at `127.0.0.1:8765`.
7. **The new decision record** per decision 5: date, plan, supersedes line, what
   was decided before, what changed, why the reversal (the user's words), the
   alternatives rejected (stdio; a vwf-shipped task), still out of scope.
8. **Every `DOCS FALSIFIED:` line** from U1 and U2.

## Verification

- `MISE_ENV=dev mise run code:precommit` green (a second run when the first
  re-pads)
- `MISE_ENV=dev mise run p:site:check` green — the link checker proves the
  renamed anchor
- `grep -rn -i "stdio" site/src/content/docs .claude` names only the upstream
  plugin's server or history

## Guardrails

- Dprint-formatted files: let `code:precommit` pad tables; no code span wraps a
  line; no `|` inside a table cell; never end a table cell in a bare `*`.
- Never touch a skill under `plugins/`, a pack or a version.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`docs: mempalace is an HTTP daemon everywhere the docs describe it` — written by
the orchestrator after the wave gate.
