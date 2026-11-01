# U2 — Memory assets and templates

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** none.

## Ruling

> D1: Remove completely: after the change no plugin names mempalace or
> graphify. The one exception is cleanup code: doctor's drift rule for
> leftovers and the config_format 24 migration in setup may name the old files
> and keys. Nothing else in any plugin names either tool.

> D2: Keep them, files only: handoff writes only
> docs/memory/handoff/<name>.md (named handoffs too, not just next); recall
> reads only that file.

> D4: docs/memory/ is the one store, with four folders: decisions/, gaps/ and
> problems/ (each <date>-<slug>.md) and handoff/ (<name>.md). The palace rooms
> planning, runs and doctor are dropped: the plan folder and
> docs/plans/index.json hold the planning record, index.json and the action
> log hold the run state, and doctor reports again on each run. The skills
> that filed to the palace write the same records as these files and read them
> at recall. The location rules are the ones memory.md gives the file mirror
> today (the base repo, in a multi-repo product).

> D12: It gets a suffix, -2 then -3 and so on; no record is overwritten.

> D16: It lists the file names, reads the files whose slug or title matches
> the topic at hand, newest first, at most ten, and reads no file in full that
> does not match.

> D13: U10, in wave 4: files of U4, U5 and U6 cite it, and p:plugins:check
> refuses a citation of a missing file, so it is deleted only after those
> units have committed.

> D18: Into the plan index.json gaps list only. docs/memory/gaps/ holds the
> gaps found outside a run: blueprint, verify, feedback.

## Edits

1. **`plugins/vwf/assets/memory.md`** — rewrite for one file store. Keep its
   role as the one memory contract other files cite. It defines: the four
   folders of D4 and their file names, with the D12 rule for a name that
   already exists; what each record holds (keep the
   existing field lists of the mirror where they exist); where `docs/memory/`
   lives (the base repo in a multi-repo product, per today's mirror rules);
   recall (the D16 rule, before asking);
   persist (write one file per record); secrets never written (keep the
   existing rule). Remove the wing, room, `mempalace.yaml`, server, two-store
   and run-journal sections. Keep the section anchors that other files cite
   where the topic survives; a topic that is gone loses its section.
2. **`plugins/vwf/assets/graphify.md`** — do **not** delete it; U10 does (D13).
   Remove the citation of it from your owned files only.
3. **`plugins/vwf/assets/membership.md`** (`:184-199`),
   **`assets/topologies/multi-repo.md`** (`:145-146`) — replace the palace and
   graph passages with the `docs/memory/` location rule; drop the graph lines.
4. **`plugins/vwf/assets/execute-stages.md`** (`:80-158`, `:270`, `:314`) —
   remove the palace journal and filing; where a stage filed a gap or a
   finding, it now records it in the plan's `index.json` (the executor's
   existing `gaps` list) and, for a durable decision, a
   `docs/memory/decisions/` file per memory.md.
5. **`plugins/vwf/assets/elicitation.md`** (`:28`) — point the recall at
   `docs/memory/` per memory.md.
6. **`plugins/vwf/assets/templates/entity.md`** (`:123`), **`flow.md`**
   (`:173`), **`plan-folder.md`** (`:494`, `:523`, `:694`), **`handoff.md`**
   (`:3`, `:28`), **`project-claude.md`** (`:68-69`) — remove each palace and
   graph mention. In `plan-folder.md` the `gaps` list becomes the durable copy
   with no palace room behind it, and the executor no longer mirrors facts to a
   journal. In `handoff.md` drop the "Project (wing)" line and point decisions
   at `docs/memory/decisions/`.

## Verification

- `mise x -- mise run code:format`
- `grep -rliw -E 'mempalace|wing|drawer|room' <your owned files>` finds no
  palace sense of those words, and `grep -rli graphify <your owned files>`
  finds nothing. `plugins/vwf/assets/graphify.md` itself still exists until U10.

## Guardrails

- Do not touch `plugins/vwf/assets/vwf-config.md` — U6 owns it.
- Do not touch any skill or agent file; they are U3 to U7's.
- Delete with `rm`, never `git rm`.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.

## Commit

`feat!: vwf memory is the docs/memory file store alone`
