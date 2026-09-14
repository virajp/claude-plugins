---
name: Claude Code
axis: design
kind: design-tool
default: true
components:
- design-tool/claude-code@0.1.0
---

# Design — Claude Code

The terminal you already work in. There is no hosted canvas: the design system
and the logo are authored in session and land as a **committed directory**,
`docs/design/<project>/`, which the three import skills read as files. No
server, no key, nothing written into `.mcp.json`.

**This bundle is the axis default.** A product with no opinion on its design
tool lands here — the architecture menu preselects it — and one with an
opinion picks another.

**It requires one plugin.** Authoring runs through `taste-skill`, so a product
pinning this tool adds `taste-skill@taste-skill` to its required plugins at
init, and the repo's `setup:ai` installs it. Every skill that needs it halts
plainly when it is absent.

**Design system and brand are real surfaces here; screens and conversations
are not yet.** The screens import halts naming the reason, and conversations
answers `harvested: n/a`, until a later release lands both on the canvas.

The slug is the `projects.<name>.design` token itself.
