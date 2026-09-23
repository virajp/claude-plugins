# U2 — The blueprint contract for watch, tv and spatial

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/blueprint/SKILL.md`,
  `plugins/vwf/skills/blueprint/references/platforms.md`,
  `plugins/vwf/skills/blueprint/references/flow-placement.md`,
  `plugins/vwf/skills/blueprint-authoring/references/frontmatter-and-links.md`,
  `plugins/vwf/skills/blueprint-authoring/references/flow-contract.md`,
  `plugins/vwf/skills/blueprint-authoring/references/ui-ux-contract.md`,
  `plugins/vwf/assets/templates/flow-platform.md`,
  `plugins/vwf/assets/templates/flow.md`,
  `plugins/vwf/assets/templates/flows-index.md`,
  `plugins/vwf/assets/templates/project-claude.md`,
  `plugins/vwf/agents/blueprint-surveyor.md`,
  `plugins/vwf/agents/blueprint-reviewer.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/architecture/references/platforms.md` (read
  only, U1 owns it).

## Ruling

Quoted from index.md:

- **D2** — "`watch`, `tv`, `spatial` — form-factor nouns. `watch` covers watchOS
  and Wear OS, `tv` covers tvOS and Android TV, `spatial` covers visionOS,
  Android XR and Quest."
- **D5** — "All three are **device** screen platforms: store-shipped, the device
  column of the standard flows (splash mandatory), goldens required,
  `deploy_template: []`, the app changelog applies, outside the web-head
  contract."
- **D6** — "Each new token carries its own interaction rules in the blueprint
  contract, mirroring `auto`'s in-car rules — watch: glanceable screens, Digital
  Crown, complications, short sessions; tv: focus-based navigation with a
  remote, the 10-foot distance, no touch; spatial: gaze and pinch, windows,
  volumes and immersive spaces."

## Edits

1. **Every list of screen platforms** in the owned files gains `watch`, `tv` and
   `spatial` beside `auto`: blueprint `SKILL.md:71,109,215`;
   `flow-placement.md:13`; `frontmatter-and-links.md:80`; `flow-contract.md:11`;
   `flow-platform.md:6,16,99`; `flow.md:16`; `flows-index.md:23`;
   `project-claude.md:49`; `blueprint-surveyor.md:98-99` (the vocabulary it
   flags against); `blueprint-reviewer.md:56-57`.
2. **`flow-contract.md:120-121`** — the device platforms that carry no Metadata
   block gain the three (D5).
3. **The interaction contract, mirroring `auto`** (D6). Wherever the tree
   carries `auto`'s in-car rules, add one parallel block per new token, same
   shape and depth:
   - blueprint `references/platforms.md:34-40` and `ui-ux-contract.md:52-57` —
     the rules themselves:
     - **watch** — glanceable screens readable in a couple of seconds; the
       Digital Crown (or rotary input) for scrolling and value entry;
       complications and widgets as first-class surfaces; short sessions;
       nothing that needs a keyboard.
     - **tv** — focus-based navigation with a remote: every interactive element
       focusable, a visible focus state, a predictable focus order; the 10-foot
       distance (large type, safe-area margins); no touch, no hover.
     - **spatial** — gaze and pinch as the primary input; the three surfaces
       (windows, volumes, immersive spaces) and which one each screen uses;
       comfortable depth and ergonomic placement; ornaments for controls.
   - `frontmatter-and-links.md:98`, `flow-contract.md:31`, `flow.md:23,63` —
     wherever `auto` gets a frontmatter field or a contract line, add the
     equivalent for each new token only where the rules above need one; do not
     invent a field `auto` does not have.
4. **Form-factor wording.** Wherever a file explains that `auto` hides CarPlay
   and Android Auto, add the three analogies from D2.

## Verification

- `mise run p:plugins:check` green.
- Every owned file that names `auto` as a platform also names `watch`, `tv` and
  `spatial`.
- blueprint `references/platforms.md` and `ui-ux-contract.md` each carry one
  rules block per new token.

## Guardrails

- Touch nothing outside Owns — the architecture files are U1's, the screens and
  canvas files U3's.
- The blueprint-authoring skill's code-independence line holds: the rules are
  contract-level (what the user experiences), never a SwiftUI or Compose API.
- `plugins/**/*.md` is not formatted — match each file's fold width by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`feat: vwf blueprint contract for watch, tv and spatial`
