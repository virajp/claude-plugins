# U4 — Execute, doctor and docs-sync treat the three as device platforms

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/harness.md`,
  `plugins/vwf/assets/execute-stages.md`,
  `plugins/vwf/agents/execute-ux-reviewer.md`,
  `plugins/vwf/skills/docs-sync/SKILL.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`,
  `plugins/vwf/skills/setup/references/format-lineage.md`,
  `plugins/vwf/skills/setup/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` (read only, U3 owns it and
  adds the `design.viewports` key); `plugins/vwf/assets/format-check.md`.

## Ruling

Quoted from index.md:

- **D4** — "None. The change is additive — precedent `1a07016d`."
- **D5** — "All three are **device** screen platforms: store-shipped, the device
  column of the standard flows (splash mandatory), goldens required,
  `deploy_template: []`, the app changelog applies, outside the web-head
  contract."
- **D7** — "a product may override it per project at
  `design.viewports.<project>.<platform>: <W>x<H>` in `.config/vwf.yaml`."
- **D11** — "Fix the three already-stale passages the survey found, in files
  this plan edits anyway."

## Edits

1. **`harness.md:20`** — `goldens` is required for device platforms: the list
   gains the three (D5).
2. **`execute-stages.md:55-56`** — the `ux` gate's platform list gains the
   three.
3. **`execute-ux-reviewer.md:84-85`** — the browser-versus-device split puts the
   three on the device side; the reviewer judges a device screen at its resolved
   viewport — `design.viewports.<project>.<platform>` when set, else the
   default.
4. **docs-sync `SKILL.md:59`** — the app changelog applies on device platforms:
   the list gains the three.
5. **doctor `stack-checks.md`** — `:151-152` the three are correct with
   `deploy_template: []`. Add one **non-blocking** check: every
   `design.viewports.<project>.<platform>` entry names a project in the
   registry, a platform that project declares, a platform that is a device
   platform, and a value matching `<W>x<H>` with two positive integers; each
   miss is a finding naming the key.
6. **`format-lineage.md:18`** — config_format **20** becomes **21**, the shipped
   value (D11). No new lineage row: this plan bumps no format (D4).
7. **setup `SKILL.md:156`** — "the latest step" names 20 → 21, not 19 → 20
   (D11). Change nothing else in the file.

## Verification

- `mise run p:plugins:check` green.
- `grep -n 'design.viewports' plugins/vwf/skills/doctor/references/stack-checks.md`
  has a hit.
- `format-lineage.md` and setup `SKILL.md` name 21 as current.

## Guardrails

- Touch nothing outside Owns; `vwf-config.md` is U3's — cite the key, never edit
  that file.
- `plugins/**/*.md` is not formatted — match each file's fold width by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`feat: execute, doctor and docs-sync treat watch, tv and spatial as device platforms`
