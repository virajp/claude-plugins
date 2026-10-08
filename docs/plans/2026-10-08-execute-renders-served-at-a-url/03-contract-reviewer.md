# U3 — The `renders:` key in the UX gate contract, and its relay

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/stack-adapter.md`,
  `plugins/vwf/agents/execute-ux-reviewer.md`,
  `plugins/vwf/assets/execute-stages.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/assets/stack-adapter.md:419-470`,
  `plugins/vwf/agents/execute-ux-reviewer.md` top to bottom,
  `plugins/vwf/assets/execute-stages.md:55-66` and `:149-165`.

## Ruling

> - Decision E3: The `ux-gate` return can carry an optional `renders:` list, one
>   item for each image: `{ code, platform, state, file }`. `file` is a path in
>   the worktree; `state` is `default` or a pinned state. A gate with no list
>   works as before.
> - Decision E4: The reviewer returns one
>   `RENDER: <code> <platform> <state> <file>` line for each `renders:` item of
>   the gate's last call, in its return block, after `RENDERED:`.
> - Decision E5: After the last ux round, before the landing, the orchestrator
>   runs `renders.mjs` with the `RENDER:` lines and copies the images into the
>   main checkout's `docs/scratchpad/<project>/renders/<platform>/`.

## Edits

1. **`plugins/vwf/assets/stack-adapter.md`** — in *The UX gate* (lines 419-451):
   add `renders:` to the YAML block as an optional key with the E3 item shape;
   one paragraph says what it is for (vwf keeps the images after the run for a
   person to review with `/vwf:mockups renders`), that `code` is the
   Screens-table code, that a gate that returns no list is valid and its run
   keeps no images, and that the files must be inside the worktree.
2. **`plugins/vwf/agents/execute-ux-reviewer.md`** — where it reads the gate's
   return (lines 44-53): keep the `renders:` list of the last gate call. In the
   return contract (lines 126-146): add the `RENDER:` line (E4) to the block,
   after `RENDERED:`, with a comment "one per renders: item; omit when none".
   The tools stay as they are.
3. **`plugins/vwf/assets/execute-stages.md`** — in the ux stage (lines 149-165):
   one sentence says the reviewer relays the gate's `renders:` list as `RENDER:`
   lines and the orchestrator copies the last round's images before the landing
   (E5), citing the execute skill.

## Verification

- `mise run p:plugins:check` — green.
- `grep -n 'renders:' plugins/vwf/assets/stack-adapter.md` — the E3 key.
- `grep -n 'RENDER:' plugins/vwf/agents/execute-ux-reviewer.md plugins/vwf/assets/execute-stages.md`
  — both files name it.

## Guardrails

- The three existing keys of the contract do not change.
- `plugins/**/*.md` is not formatted — match the fold width by hand; keep each
  code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: vwf ux gate — an optional renders list, relayed by the ux reviewer`
