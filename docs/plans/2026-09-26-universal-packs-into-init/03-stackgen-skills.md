# U3 — stackgen drops the universal tier and learns ownership transfer

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/stackgen-stack-menu/**`,
  `plugins/stackgen/skills/stackgen-stack-template/**`,
  `plugins/stackgen/skills/stackgen-sync/**`,
  `plugins/stackgen/assets/{pack-format,output-tree,kinds,taxonomy}.md`,
  `plugins/stackgen/stacks/readme.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the Facts' stackgen references, each at its lines;
  `stackgen-sync/SKILL.md` whole.

## Ruling

> - Decision 2: The kinds `toolchain-manager`, `repo-gate`, `repo-hygiene` and
>   the `unconditional` key are retired; `stackgen-stack-menu`,
>   `-stack-template`, `-sync`, `inventory.ts` and the assets drop their
>   handling. stackgen's other packs keep sourcing
>   `.config/mise/tasks/_scripts/helpers`, now init's — written down as a
>   cross-plugin contract. The secrets providers (fnox, doppler) stay in
>   stackgen. vwf keeps its `stackgen` dependency.
> - Decision 6: A path whose recorded owner no longer ships it, while another
>   owner now does: unedited (the file matches the old record's hash) → the new
>   owner's content lands and the record moves to the new owner's lock; edited →
>   a replace-or-keep row labelled `owner changed: <old> → <new>`. The old
>   owner's record is always removed. Applies in init's reshape (stackgen pack →
>   init) and in `stackgen-sync` (pack → pack).
> - Decision 11: Any sentence a unit adds is short.

## Edits

1. **`stackgen-stack-menu`** (:29, :36, :39, :87–97, :112) — no fixed slugs, no
   skipped kinds for the universal tier.
2. **`stackgen-stack-template`** (`SKILL.md:80,152-166`,
   `references/materializer.md:57,116-126,147-150`) — composition order no
   longer starts with the toolchain manager; state the contract: stackgen packs
   land into a repo whose task library, gates and hygiene init laid down, and
   source `_scripts/helpers` at runtime.
3. **`stackgen-sync`** (:38–39, :119–134) — drop the universal tier; add the
   transfer rule (decision 6) for a path moving between stackgen packs; a path
   now owned by init is removed from the stackgen lock and left to init's
   reshape.
4. **Assets** — `pack-format.md` (:13, :34–66, :145, :299–317, :353–393: the
   `unconditional` key retired), `output-tree.md` (:147–149, :255, :324–326,
   :378–384), `kinds.md` (:267–475 the three kinds removed, :533), `taxonomy.md`
   (:44, :56, :235–250), `stacks/readme.md` (:8).

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green
- `grep -rn "unconditional" plugins/stackgen` prints only a retirement note, if
  any

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line.
- Touch nothing outside the owned paths; never a pack payload.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: stackgen retires the universal tier and handles an owner change` —
written by the orchestrator after the wave gate.
