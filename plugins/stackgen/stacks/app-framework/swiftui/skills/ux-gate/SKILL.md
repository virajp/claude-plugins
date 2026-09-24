---
name: ux-gate
description: Run a SwiftUI slice's visual and accessibility checks, returning
  findings in vwf's UX-gate vocabulary. Invoked by vwf's UX-review stage
  for a project whose stack this pack owns — not a general-purpose skill.
disable-model-invocation: false
model: sonnet
---

# ux-gate

vwf's UX-review stage knows a UI slice must have its screens rendered and
scanned. It does not know how. This skill is the how, for a SwiftUI project.

> **`invocation` must stay `both`.** A `user` skill is removed from the model's
> context entirely and cannot be invoked by vwf — and the failure is silent, not
> an error. vwf would see no gate and report `rendered: n/a` forever.

## Inputs

The reviewer passes the slice, the changed screens, the path to
`docs/blueprint/design-system.md`, and the flow's Screens contract. You run the
checks. **You do not judge** — conformance against the design system is the
reviewer's call, and duplicating it here would produce two verdicts that can
disagree.

## What to do

A SwiftUI surface is checked as **tests**, headless, through `xcodebuild test`
on a simulator the test run boots and shuts itself. Never drive a simulator
interactively.

1. **Resolve the viewport and the destination** for each changed screen's
   platform: the viewport is `design.viewports.<project>.<platform>` in
   `.config/vwf.yaml` when it is set, otherwise the platform default below, in
   points — the same defaults vwf's design canvas uses. Never a size read back
   from the goldens, which is what is being judged. The destination is the
   platform the table names.

   | Platform | Default viewport | Destination platform |
   | --- | --- | --- |
   | `mobile` | 390×844, portrait | `iOS Simulator` |
   | `tablet` | 834×1194, portrait | `iOS Simulator` |
   | `desktop` | 1440×900 | `macOS` |
   | `auto` | 800×480, landscape | `iOS Simulator` |
   | `watch` | 208×248 | `watchOS Simulator` |
   | `tv` | 1920×1080, landscape | `tvOS Simulator` |
   | `spatial` | 1280×720, the default window | `visionOS Simulator` |

   Name the viewport you used in every finding; a golden rendered at another
   size is not evidence for this one.
2. **Check the simulator pin.** Goldens are pixels from one simulator, so the
   repo pins it once, in its mise `[env]`: `SIMULATOR_PLATFORM`,
   `SIMULATOR_DEVICE` and `SIMULATOR_OS`, from which the golden task builds
   the `-destination` — so the task, this gate and CI render on the same
   simulator. Read them with `mise env`. The task refuses to run without a
   pin; when the pin is unset, report `rendered: n/a` with that reason rather
   than choosing a simulator yourself.
3. **Visual — per changed destination platform.** Group the changed screens
   by the destination platform step 1 gave them:
   - the pinned platform — the one `SIMULATOR_PLATFORM` names — runs the
     repo's golden task once, `mise run test:golden`, on the pin (read the
     task list rather than assuming; a repo may name its snapshot target with
     `--target`);
   - every other platform, `macOS` included, is not run. The goldens were
     recorded on the pin, so a render on any other destination is compared
     with goldens from another platform, or finds no destination the snapshot
     target supports. Report that platform `n/a` in its `viewport` line, with
     a finding that its simulator is not pinned — never run it on a
     destination you picked, and never report it `ok`.

   An unchanged platform is not run and is not reported. Never pass
   `--record`: recording overwrites the goldens the comparison is meant to
   judge. On a failed comparison, point the reviewer at the three: the
   reference, the committed file under the test's `__Snapshots__` directory;
   the new render, under `.build/snapshot-artifacts/`; and the diff, an
   attachment in the result bundle at `.build/golden.xcresult`.

   **A changed screen with no golden at all is not a pass.** The task compares
   with recording off, so a missing golden fails it; report that as a finding,
   so it reaches vwf as a spec gap rather than as silence.
4. **Accessibility** — run the accessibility audit Xcode offers:
   `XCUIApplication.performAccessibilityAudit()`, in the project's UI test
   target, over each changed screen an audit test reaches — run with
   `xcodebuild test -project <Name>.xcodeproj -scheme <scheme> -destination <the destination step 3 used> -only-testing:<that target> -derivedDataPath .build/DerivedData -clonedSourcePackagesDirPath .build/SourcePackages -onlyUsePackageVersionsFromResolvedFile -resultBundlePath .build/a11y.xcresult -collect-test-diagnostics never`,
   on the pinned destination only, as in step 3, removing
   `.build/a11y.xcresult` first, since xcodebuild will not overwrite one. Each
   audit issue — contrast, element description, hit region, Dynamic Type
   clipping, trait — is the equivalent of a WCAG A/AA violation; report it at
   that severity so vwf can apply one rule across every stack. A changed
   screen no audit test reaches is a finding too, not a pass.
5. **Return** the payload below. Report what happened, not what should have.

## Return contract

```yaml
rendered: ok | n/a
reason: <one line> # required when n/a
viewport: <project>.<platform> -> <device or size> | n/a: <reason> # one per changed platform
artifacts: [ <path>, … ] # reference, new render, result bundle (the diff)
findings:
  - severity: <critical | high | medium | low>
    screen: <screen>/<state>
    what: <the violation, in one line>
    where: <audit issue type or golden name>
```

**`n/a` is a legitimate answer and must be honest.** No snapshot test target,
no simulator pin, no simulator runtime for the platform, a suite that would
not build, no Xcode or the wrong one selected — each is a `reason`, and vwf
carries it to the final human gate rather than downgrading the slice to a
code-only review. `rendered: ok` means at least one changed platform ran; a
platform that did not is `n/a` in its `viewport` line, never folded into the
`ok`. Reporting `ok` when nothing ran is the one failure mode this skill
exists to prevent.

---

**This skill is materialized into the repo's own `.claude/skills/ux-gate/`.**
vwf invokes it by that fixed name rather than constructing
`<plugin>-ux-gate` from a stack pin — there is no plugin name to construct
from once stacks are packs, and a name built from configuration is a name
that can silently resolve to nothing.
