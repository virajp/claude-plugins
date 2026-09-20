# U1 — init: collision detection, the question, the recorded answers

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/fragments-and-sections.md`,
  `plugins/vwf/skills/init/references/existing-repo.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md:105-115` (the `enforcement`
  block, for the exact spelling of a base-relative path with a member prefix —
  read, never edit); `plugins/stackgen/assets/pack-format.md:97-137` (the
  fragment convention — read, never edit).

## Ruling

Decision 1 — Collision handling: "The composition step parses the **whole**
existing file (JSONC, comments tolerated); every top-level `settings` key, every
`nesting` parent, and every extension id that is present **outside** the block
and also in the composed set is a collision. Collisions are never resolved
silently — they are asked."

Decision 2 — The question: "One round per run, one row per collision naming the
file, the key, the hand value and the pack value; choices **keep mine** — the
block omits the key, the hand copy is untouched; **take the pack's** — the block
carries it and init removes the hand copy, the exact lines shown in the plan
before consent; **union** — offered only for an object-valued key and for the
extensions list: pack + hand entries composed into the block, hand copy
removed."

Decision 3 — Persistence: "`enforcement.editor_keys: {}` beside `kept_files` in
the base's `.config/vwf.yaml`: `<file>: { <key>: keep | take | union }`, the
file path base-relative with the member prefix exactly as `kept_files` spells
it. A recorded answer applies on every later run without asking; editing the
block is how a user is re-asked. … `init` now writes two keys into the config."

Decision 4 — Question count: "The collision round belongs to the plan step and
is not an eighth question — the seven stand; a run with no collision asks
nothing."

Decision 6 — Take/union edit: "Removing the hand copy is the **one** edit init
makes outside the block, and only on the recorded or just-given answer; the plan
shows the lines it will remove. A hand copy that is the last member of an object
leaves a valid file (trailing comma handled)."

Reversal, from index.md's Goal: a hand key wins because the block **omits** it,
not because JSON tolerates the duplicate; "everything outside the block survives
byte-for-byte" stands, with the carve-out that *take* and *union* remove the
hand copy on the user's word.

## Edits

1. **`references/fragments-and-sections.md`** (`:137-213`) — the composition
   procedure gains, between "compose the block" and "splice it in": **read the
   existing file whole**, collect the keys outside the block, intersect with the
   composed set, and for each collision apply the recorded answer from
   `enforcement.editor_keys` or add it to the collision round. Then: the block
   is composed **minus** every `keep` key, **plus** the union value for every
   `union` key; the hand copy of every `take` and `union` key is removed
   (decision 6). The passage "A key somebody added by hand after the block is
   theirs, it wins over the block's value, and a second merge must leave it
   exactly as it was" (`:195-197`) is rewritten to the omit rule. State the
   three shapes a collision takes — a scalar setting (keep / take), an
   object-valued setting or a nesting parent (keep / take / union), an extension
   id (keep is a no-op since the value is identical — say so and do not ask; a
   differing id cannot collide). The round's wording and the row shape (file ·
   key · hand value · pack value · choice).
2. **`SKILL.md`** — the plan step's description of the editor block (where
   `SKILL.md` summarises composition) gains one sentence: collisions with a hand
   key are asked in one round inside the plan and recorded under
   `enforcement.editor_keys`; the sentence that says `kept_files` is the one key
   init writes into `.config/vwf.yaml` now names two. The seven-question passage
   is untouched (decision 4).
3. **`references/existing-repo.md`** — pass 1's editor-dir exemption (`:69-72`)
   stays, and a sentence after it says the editor files are read by the
   composition step itself, which is where a hand key is surfaced; the plan's
   section list gains the collision rows where the file describes what the plan
   shows per repo.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "last-wins\|wins over the block" plugins/vwf/skills/init/references/fragments-and-sections.md`
  — zero hits of the old rule.
- `grep -n "editor_keys" plugins/vwf/skills/init/SKILL.md plugins/vwf/skills/init/references/fragments-and-sections.md`
  — at least one hit in each.
- `grep -c "seven" plugins/vwf/skills/init/SKILL.md` unchanged from before the
  edit.

## Guardrails

- Do not edit `plugins/vwf/assets/vwf-config.md` or `setup/SKILL.md` (U2) or
  `plugins/stackgen/**` (U3); cite the key by name.
- No doc outside `plugins/vwf/skills/init/` — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand;
  strict-YAML frontmatter untouched.
- Delete with `rm`, never `git rm`.

## Commit

`feat: init asks about editor keys the hand section already carries` — written
by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
