---
name: ux-gate
description: Render a web UI slice's changed screens and run an accessibility
  scan, returning findings in vwf's UX-gate vocabulary. Invoked by vwf's
  UX-review stage for a project whose stack this pack owns — not a
  general-purpose skill.
disable-model-invocation: false
model: sonnet
---

# ux-gate

vwf's UX-review stage knows a UI slice must have its screens rendered and
scanned. It does not know how. This skill is the how, for a web project built on
this pack's stack.

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

1. **Boot the project** with its own `dev` task, per the harness contract. If
   the screens need data, bring up the project's local stack first and wait on
   its readiness signal. Never hand-roll infrastructure, and never start
   anything interactively.
2. **Capture each changed screen**: its default view, and every state pinned in
   that screen's States cell of the Screens contract that the app can reach.
   Take each screen's code from the Code column of the same table. Use the
   browser driver the repo already depends on — check its manifest before
   reaching for one. Write each capture, as a PNG, to
   `docs/scratchpad/ux-gate/<platform>/<code>--<state>.png` in the worktree,
   creating the directory first; `state` is `default` for the default view.
   The path is gitignored; a capture is a working artifact and is never
   committed. A pinned state the app cannot reach gets no capture and one
   `findings` item that says so.
3. **Scan each captured screen** for accessibility violations at WCAG A/AA,
   using the scanner the repo already depends on.
4. **Return** the payload below. Report what happened, not what should have.

## Return contract

```yaml
rendered: ok | n/a
reason: <one line> # required when n/a
renders: # one item per capture, for the reviewer to read
  - code: <the screen's code> # e.g. 004a
    platform: <the screen platform> # site | webapp
    state: <default | a pinned state>
    file: <path relative to the worktree root> # the PNG above
findings:
  - severity: <critical | high | medium | low>
    screen: <screen>/<state>
    what: <the violation, in one line>
    where: <rule id or selector>
```

vwf copies the `renders:` files out of the worktree after the run, so a person
can review the built app; each `code` is the screen's code in the flow's
Screens table.

**`n/a` is a legitimate answer and must be honest.** No `dev` task, no browser
driver in the manifest, a server that would not boot — each is a `reason`, and
vwf carries it to the final human gate rather than downgrading the slice to a
code-only review. Reporting `ok` when nothing rendered is the one failure mode
this skill exists to prevent.

---

**This skill is materialized into the repo's own `.claude/skills/ux-gate/`.**
vwf invokes it by that fixed name rather than constructing
`<plugin>-ux-gate` from a stack pin — there is no plugin name to construct
from once stacks are packs, and a name built from configuration is a name
that can silently resolve to nothing.
