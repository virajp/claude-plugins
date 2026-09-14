# U3 — Flutter covers four platforms

- **Wave:** 2
- **Depends on:** U2 (the inventory commit)
- **Owns:** `plugins/stackgen/stacks/app-framework/flutter/**`,
  `plugins/stackgen/stacks/bundles/dart-flutter.md`,
  `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Read first:** `…/flutter/pack.yaml`, `…/flutter/conventions.md`,
  `…/flutter/skills/flutter/references/pick-and-trade.md`,
  `plugins/stackgen/stacks/bundles/dart-flutter.md`, and the four code-note
  hits: `…/flutter/skills/flutter/references/ui-composition.md:177,377`,
  `…/integrations/image-handling.md:11`, `…/firebase-auth.md:13`,
  `…/platform-interop.md:122` (paths under `…/flutter/skills/`; locate with
  `command grep -rn -i "web" plugins/stackgen/stacks/app-framework/flutter/skills/`).
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md:201-208` (bundle
  frontmatter), `docs/memory/decisions/2026-09-13-consumer-gaps.md:105-115` (the
  widening-is-minor ruling this inverts).

## Ruling

Decision 4: "Flutter pack `platforms: [mobile, tablet, desktop, auto]`; the
summary, `conventions.md` and the `dart-flutter` bundle say four;
`pick-and-trade.md` says the web is not offered — a web surface is a `site` or
`webapp` project on its own stack. Pack `0.3.0` → `0.4.0` (the inverse of the
consumer-gaps widening ruling); the bundle pin and the inventory follow."
Rejected: "`1.0.0`".

Decision 6: "A Flutter-pack reference that mentions Flutter's web build as a
code fact (an API that behaves differently on web) is left alone; one that
asserts the project ships a web surface is rewritten. U3 reads each of the four
listed hits and reports which it took." Rejected: "rewrite all; touch none".

Decision 7: "U3 regenerates and owns `stacks/inventory.md` in wave 2."

The user's words: "As of now we will NOT support Flutter for webapp."

## Edits

1. **`…/flutter/pack.yaml`** — `:3` summary: drop "web" from "across mobile,
   tablet, desktop, web and in-car" (keep the sentence's shape); `:5`
   `version: 0.4.0`; `:10` `platforms: [mobile, tablet, desktop, auto]`.
2. **`…/flutter/conventions.md:18-20`** — "whichever of mobile, tablet, desktop
   and webapp it ships" → the four; add one sentence: a web surface is not
   offered by this pack — it is a `site` or `webapp` project on a web stack,
   which carries its own stylesheet pin.
3. **`…/flutter/skills/flutter/references/pick-and-trade.md`** — `:6` and
   `:38-42`: the passage arguing Flutter web is "often an acceptable trade" is
   rewritten to say the opposite in the file's voice — the pack does not target
   the web; a product with a web surface pins a web stack for it. Keep the
   surrounding trade-offs (mobile, desktop, in-car) intact.
4. **The four code-note hits** — per decision 6, read each; rewrite only one
   that asserts the project ships to the web; leave an API-behaviour note.
   Report each as a `DECIDED:` line.
5. **`plugins/stackgen/stacks/bundles/dart-flutter.md`** — `:8-13` frontmatter
   `platforms:` loses `webapp`; `:17` H1 becomes "mobile · tablet · desktop ·
   auto"; `:23-27` "five platforms… web" becomes four with no web; the
   `app-framework/flutter@0.3.0` pin → `@0.4.0`.
6. `mise run p:plugins:inventory` — the Flutter row's version and summary move;
   counts unchanged.

## Verification

- `command grep -rn "webapp" plugins/stackgen/stacks/app-framework/flutter/ plugins/stackgen/stacks/bundles/dart-flutter.md`
  is empty.
- `command grep -rn "app-framework/flutter@0.3.0" plugins/stackgen/stacks/` is
  empty;
  `command grep -c "app-framework/flutter@0.4.0" plugins/stackgen/stacks/bundles/dart-flutter.md`
  is `1`.
- `command grep -n "five" plugins/stackgen/stacks/bundles/dart-flutter.md plugins/stackgen/stacks/app-framework/flutter/conventions.md`
  is empty.
- `mise run p:plugins:inventory -- --check`, `mise run p:plugins:check` green.
- Every edited `.md` keeps its fold width by hand (`plugins/**/*.md` is not
  formatted); frontmatter of `dart-flutter.md` still parses (the inventory
  generator read it).

## Guardrails

- Do not touch the pnpm pack, any other bundle, `plugins/vwf/**`, or any doc —
  the vwf passages are U5's, the manual is U6's.
- Do not add a `webapp`-refusal rule anywhere: decision 5 says doctor's cover
  check already does the work.
- Rule 13: nothing landed cites a plugin path; this pack lands no `config/`, so
  only prose is in play.
- Delete with `rm`, never `git rm`; stage nothing.

## Commit

`feat: stackgen — flutter 0.4.0 covers mobile, tablet, desktop, auto; no webapp`
— written by the orchestrator after the wave gate, not by the unit. The pack
version, the bundle pin and the regenerated `inventory.md` land in this one
commit.
