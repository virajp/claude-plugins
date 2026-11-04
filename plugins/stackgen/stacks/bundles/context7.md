---
name: Context7
axis: addon
kind: addon
components:
- addon/context7@1.0.0
---

# Add-on — Context7

Current library documentation for the agent and for the stackgen generator,
which halts when no Context7 server is reachable from any source.

**What it lands.** One `context7` server entry in `vwf-tools`, the local plugin
stackgen generates, at user scope. Nothing lands in the repo. It is picked on
the tools round and recorded in `.config/vwf.yaml`'s `addons:`; it is never a
default.
