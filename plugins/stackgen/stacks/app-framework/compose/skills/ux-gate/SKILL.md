---
name: ux-gate
description: Render a Jetpack Compose slice's changed screens as Roborazzi
  goldens and run the Accessibility Test Framework's checks over them,
  returning findings in vwf's UX-gate vocabulary. Invoked by vwf's UX-review
  stage for a project whose stack this pack owns — not a general-purpose skill.
disable-model-invocation: false
model: sonnet
---

# ux-gate

vwf's UX-review stage knows a UI slice must have its screens rendered and
scanned. It does not know how. This skill is the how, for a Jetpack Compose
project.

> **`invocation` must stay `both`.** A `user` skill is removed from the model's
> context entirely and cannot be invoked by vwf — and the failure is silent, not
> an error. vwf would see no gate and report `rendered: n/a` forever.

## Inputs

The reviewer passes the slice, the changed screens, the path to
`docs/blueprint/design-system.md`, and the flow's Screens contract. You render
and scan. **You do not judge** — conformance against the design system is the
reviewer's call, and duplicating it here would produce two verdicts that can
disagree.

## What to do

A Compose screen is rendered as a **test**, headless, on the JVM: each golden
is a Roborazzi capture under Robolectric, so no emulator is booted and none is
driven interactively.

1. **Resolve the device for each changed screen's platform.** The goldens
   render on a Robolectric device qualifier, fixed per platform:

   | Platform | Qualifier                                   | Viewport            |
   | -------- | ------------------------------------------- | ------------------- |
   | `mobile` | `RobolectricDeviceQualifiers.Pixel7`        | Pixel 7, portrait   |
   | `tablet` | `RobolectricDeviceQualifiers.MediumTablet`  | medium tablet, landscape |

   When `design.viewports.<project>.<platform>` in `.config/vwf.yaml` names a
   size the golden tests' qualifiers do not render, say so in a finding — a
   golden rendered at another size is not evidence for that one. Any other
   changed platform has no device this pack renders: report it as a finding,
   its `where` naming `<project>.<platform>`, never as `ok`.
2. **Check the prerequisites.** The repo has an executable `./gradlew`, the
   `test:golden` task (read the task list rather than assuming), and goldens
   under a module's `src/test/screenshots/`. Any one missing is
   `rendered: n/a` with that reason — never a render you improvised.
3. **Visual — run the goldens once.** `mise run test:golden`, from the repo
   root. Never pass `--record`: recording overwrites the goldens the
   verification is meant to judge. The goldens are named
   `src/test/screenshots/<platform>/<code>--<state>.png`, by the screen's code
   in the flow's Screens table and its state (`default` or a pinned state).
   - **A changed screen or pinned state with no golden is not a pass.** The
     verification fails on it; report it as a finding, so it reaches vwf as a
     spec gap rather than as silence.
   - **On a failed comparison**, point the reviewer at the three in the
     finding's `where`, beside the golden's name and the device: the reference,
     the committed golden; the new render and the comparison image Roborazzi
     wrote under the module's `build/outputs/roborazzi/`; and the report at
     `build/reports/roborazzi/index.html`.
4. **Copy each render out for review.** For each changed screen and state that
   rendered, copy the image to
   `docs/scratchpad/ux-gate/<platform>/<code>--<state>.png` in the worktree,
   creating the directory first: the committed golden when the verification
   passed for it, the new render when it failed. The path is gitignored; a
   render is a working artifact and is never committed. List each one under
   `renders:`.
5. **Accessibility — the same run.** The golden tests run Roborazzi's
   accessibility check with the Accessibility Test Framework over each
   capture, so the step-3 run is the audit. Read each failing test's message
   from the JUnit results under the module's
   `build/test-results/testDebugUnitTest/`. Each issue — a missing label, a
   touch target under 48 dp, low contrast, a duplicate description — is a
   finding, the equivalent of a WCAG A/AA violation; report it at that
   severity so vwf can apply one rule across every stack, its `where` naming
   the check and the device. A changed screen no golden test reaches was not
   audited: a finding, never clean.
6. **Return** the payload below. Report what happened, not what should have.

## Return contract

```yaml
rendered: ok | n/a
reason: <one line> # required when n/a; names the device or the missing prerequisite
renders: # one item per copied image, for the reviewer to read
  - code: <the screen's code> # e.g. 004a
    platform: <the screen platform> # mobile | tablet
    state: <default | a pinned state>
    file: <path relative to the worktree root> # the PNG under docs/scratchpad/ux-gate/
findings:
  - severity: <critical | high | medium | low>
    screen: <screen>/<state>
    what: <the violation, in one line>
    # <project>.<platform> on <device>; the accessibility check,
    # or the golden's name and its three paths
    where: <platform and device; check, or golden and paths>
```

vwf copies the `renders:` files out of the worktree after the run, so a person
can review the built app; each `code` is the screen's code in the flow's
Screens table.

**`n/a` is a legitimate answer and must be honest.** No Gradle wrapper, no
`test:golden` task, no goldens, a suite that would not build — each is a
`reason`, and vwf carries it to the final human gate rather than downgrading
the slice to a code-only review. `rendered: ok` means **at least one changed
screen's goldens were verified** in this run. A platform whose goldens did not
run is a finding, never folded into the `ok`. Reporting `ok` for something
this skill did not render is the one failure mode it exists to prevent.

---

**This skill is materialized into the repo's own `.claude/skills/ux-gate/`.**
vwf invokes it by that fixed name rather than constructing
`<plugin>-ux-gate` from a stack pin — there is no plugin name to construct
from once stacks are packs, and a name built from configuration is a name
that can silently resolve to nothing.
