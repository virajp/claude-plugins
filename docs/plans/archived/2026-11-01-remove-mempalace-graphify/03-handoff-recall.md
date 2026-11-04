# U3 — handoff and recall from files only

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/memory.md` (U2 rewrites it in the same wave; work from the rulings below, not from its text).

## Ruling

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

> D15: A handoff file follows the D4 location rule (the base repo in a
> multi-repo product). A handoff of a name that exists replaces it, as next.md
> is replaced today. D2 means recall takes the handoff from that file alone;
> its reads of decisions/ and gaps/ follow D4.

> D12: It gets a suffix, -2 then -3 and so on; no record is overwritten.
> (D12 answers: a new record whose <date>-<slug>.md already exists.)

> D16: It lists the file names, reads the files whose slug or title matches
> the topic at hand, newest first, at most ten, and reads no file in full that
> does not match. (D16 answers: how much of a docs/memory/ folder a recall reads.)

## Edits

1. **`plugins/vwf/skills/handoff/SKILL.md`** (and any file under it) — remove
   the wing resolution (`:92-105`) and the drawer write (`:146-161`). The
   handoff is written to `docs/memory/handoff/<name>.md` in the main checkout
   of the repo D15 names, `<name>` defaulting to `next`, replacing a file of
   that name; the old disk fallback (`:165-168`) becomes
   the one path. Keep the `next` behaviour (`:7-8`, `:43-44`, `:172-194`).
   Update the frontmatter `description` so it no longer says "file it to
   mempalace".
2. **`plugins/vwf/skills/recall/SKILL.md`** (and any file under it) — remove
   the wing resolution (`:47-57`) and the drawer reads (`:65-75`). recall reads
   `docs/memory/handoff/<name>.md` (`next` by default); with no file, it lists
   the files in `docs/memory/handoff/` and says none matched. Replace the room
   reads (`:98`, `:113`) with reads of `docs/memory/decisions/` and
   `docs/memory/gaps/`. Keep the shape-drift line and the launch-line rules.

## Verification

- `mise x -- mise run code:format`
- `grep -rliw -E 'mempalace|drawer|wing' plugins/vwf/skills/handoff plugins/vwf/skills/recall` finds nothing.
- Each `SKILL.md` frontmatter still parses as strict YAML.

## Guardrails

- Do not touch `plugins/vwf/assets/templates/handoff.md` — U2 owns it.
- Strict-YAML frontmatter: a colon inside an unquoted `description` drops the
  skill silently; quote it if it needs one.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.

## Commit

`feat!: handoff and recall read and write docs/memory files only`
