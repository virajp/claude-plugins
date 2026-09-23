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

A SwiftUI surface is checked as **tests**, headless, on a simulator the test
run boots and shuts itself. Never drive a simulator interactively.

1. **Resolve the viewport** for each changed screen's platform:
   `design.viewports.<project>.<platform>` in `.config/vwf.yaml` when it is
   set, otherwise the platform default below, in points — the same defaults
   vwf's design canvas uses. Never a size read back from the goldens, which is
   what is being judged.

   | Platform | Default viewport |
   | --- | --- |
   | `mobile` | 390×844, portrait |
   | `tablet` | 834×1194, portrait |
   | `desktop` | 1440×900 |
   | `auto` | 800×480, landscape |
   | `watch` | 208×248 |
   | `tv` | 1920×1080, landscape |
   | `spatial` | 1280×720, the default window |

   Name the viewport you used in every finding; a golden rendered at another
   size is not evidence for this one.
2. **Visual** — run the repo's golden task, `mise run test:golden` (read the
   task list rather than assuming; a repo may name its snapshot target with
   `--target`). Never pass `--record`: recording overwrites the goldens the
   comparison is meant to judge. On a failed comparison, point the reviewer at
   the reference, render and diff images under `.build/snapshot-artifacts/`.

   **A changed screen with no golden at all is not a pass.** The task compares
   with recording off, so a missing golden fails it; report that as a finding,
   so it reaches vwf as a spec gap rather than as silence.
3. **Accessibility** — run the accessibility audit Xcode offers:
   `XCUIApplication.performAccessibilityAudit()`, in the project's UI test
   target, over each changed screen an audit test reaches — run with
   `tuist test --no-selective-testing --inspect-mode off --test-targets <that target>`,
   inspect mode off so the result bundle, screenshots and all, is never
   uploaded to a Tuist server. Each audit
   issue — contrast, element description, hit region,
   Dynamic Type clipping, trait — is the equivalent of a WCAG A/AA violation;
   report it at that severity so vwf can apply one rule across every stack. A
   changed screen no audit test reaches is a finding too, not a pass.
4. **Return** the payload below. Report what happened, not what should have.

## Return contract

```yaml
rendered: ok | n/a
reason: <one line> # required when n/a
viewport: <project>.<platform> -> <device or size> # one per platform checked
artifacts: [ <path>, … ] # snapshot reference, failure and diff images
findings:
  - severity: <critical | high | medium | low>
    screen: <screen>/<state>
    what: <the violation, in one line>
    where: <audit issue type or golden name>
```

**`n/a` is a legitimate answer and must be honest.** No snapshot test target,
no simulator runtime for the platform, a suite that would not build, Xcode or
Tuist absent — each is a `reason`, and vwf carries it to the final human gate
rather than downgrading the slice to a code-only review. Reporting `ok` when
nothing ran is the one failure mode this skill exists to prevent.

---

**This skill is materialized into the repo's own `.claude/skills/ux-gate/`.**
vwf invokes it by that fixed name rather than constructing
`<plugin>-ux-gate` from a stack pin — there is no plugin name to construct
from once stacks are packs, and a name built from configuration is a name
that can silently resolve to nothing.
