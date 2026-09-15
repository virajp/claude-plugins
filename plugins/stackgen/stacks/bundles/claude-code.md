---
name: Claude Code
axis: design
kind: design-tool
default: true
components:
- design-tool/claude-code@0.2.0
---

# Design — Claude Code

The terminal you already work in. There is no hosted canvas: the design system,
the logo and a flow's screens are authored in session and land as a
**committed directory**, `docs/design/<project>/`, which the three import
skills read as files. No hosted server, no key, nothing written into
`.mcp.json`.

**This bundle is the axis default.** A product with no opinion on its design
tool lands here — the architecture menu preselects it — and one with an
opinion picks another.

**It requires one plugin.** Authoring runs through `taste-skill`, so a product
pinning this tool adds `taste-skill@taste-skill` to its required plugins at
init, and the repo's `setup:ai` installs it. Every skill that needs it halts
plainly when it is absent.

**The pack now designs and reviews screens.** `/design-session screens <flow>`
authors a flow's pages from the brief `/vwf:screens prompt` wrote, and
`/design-session review <flow>` serves them from the repo on loopback, takes
comments in the browser, and applies them in session; the screens import reads
the pages and the conversations import returns the open comments.

The slug is the `projects.<name>.design` token itself.
