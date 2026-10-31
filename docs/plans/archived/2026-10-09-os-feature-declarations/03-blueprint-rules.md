# U3 — Blueprint rules, flow contract and reviewer checklist

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/blueprint/references/platforms.md`,
  `plugins/vwf/skills/blueprint-authoring/references/flow-contract.md`,
  `plugins/vwf/agents/blueprint-reviewer.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing. Read
  `plugins/vwf/assets/templates/flow-platform.md` as U1 left it, so the entry
  shape matches exactly.
- **Lazy-load:** `plugins/vwf/skills/blueprint/references/platforms.md` lines
  40-79 only if the edit needs their exact wording.

## Ruling

From index.md, decisions 1, 2, 4, 5 and 6:

- Decision 1 — `scope` is the OS name from the platform doctrine: `ios` now;
  `watchos`, `tvos`, `visionos`, `carplay`, `macos` later. Folder 2 adds
  `android:<vendor>`. Rejected: free text; a closed enum in `registry.yaml`.
- Decision 2 — a `features:` list in the flow-platform frontmatter. Each entry
  has `name`, `scope` and `fallback`.
- Decision 4 — `fallback` is required on every entry.
- Decision 5 — enforced by the blueprint reviewer. The flow contract states the
  rule. No checker rule. Rejected: a `p:plugins:check` rule; a doctor finding.
- Decision 6 — any form-factor platform may carry entries.

## Edits

1. **`plugins/vwf/skills/blueprint/references/platforms.md`** — at the places
   that describe Platform deviations (lines 40, 45, 59, 69, 79), state the
   structured rule in one sentence each where the prose says a vendor difference
   is written as a deviation. Point to the `features:` list as the record. Do
   not restate the entry shape in full: name `flow-platform.md` as its owner.
2. **`plugins/vwf/skills/blueprint-authoring/references/flow-contract.md`** —
   add a short section "OS-specific features" to the flow contract. It states:
   an entry has `name`, `scope` and `fallback`; `fallback` is required; `scope`
   takes an OS name from the platform doctrine; and a feature that applies to
   every OS is not a feature entry. Keep the section under the contract's
   existing heading style.
3. **`plugins/vwf/agents/blueprint-reviewer.md`** — add one completeness check
   to the checklist: every `features:` entry in a flow-platform doc has a
   `name`, a `scope` that names an OS of that platform's doctrine, and a
   non-empty `fallback`. A missing or empty `fallback` is a gap, and so is a
   `scope` the platform does not name. Keep the checklist's numbering and its NO
   GAPS return format unchanged.

## Verification

- `mise run p:plugins:check` — green.
- `grep -n 'features:' plugins/vwf/agents/blueprint-reviewer.md plugins/vwf/skills/blueprint-authoring/references/flow-contract.md`
  — at least one match in each file.
- `grep -n 'fallback' plugins/vwf/agents/blueprint-reviewer.md` — the new check
  present, with the word "gap".

## Guardrails

- Do not change `flow-platform.md` or `standard-flows.md`. U1 owns them.
- Do not change the reviewer's return format or its other checks.
- Do not add a checker rule under `plugins/` or a doctor finding.
- Delete with `rm`, never `git rm`.
- Edit with Edit or Write. Never `cat >`.

## Commit

`feat: check OS-specific feature entries in the blueprint reviewer`
