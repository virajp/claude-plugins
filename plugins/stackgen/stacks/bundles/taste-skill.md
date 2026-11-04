---
name: taste-skill
axis: addon
kind: addon
components:
- addon/taste-skill@1.0.0
---

# Add-on — taste-skill

The Claude plugin the claude-code design tool's `design-session` authors
through. That skill halts without it; the tool's three import skills do not need
it.

**What it lands.** Nothing in the repo and nothing in `vwf-tools`: the pack's
`## Claude plugins` section goes to bootstrap, which installs the plugin at user
scope. It is picked on the tools round and recorded in `.config/vwf.yaml`'s
`addons:`; it is never a default.
