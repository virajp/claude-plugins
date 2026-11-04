---
name: Claude Code
axis: design
kind: design-tool
default: true
components:
- design-tool/claude-code@2.0.0
---

# Design — Claude Code

The terminal you already work in. There is no hosted canvas: the design system,
the logo and a flow's screens are authored in session and land as a
**committed directory**, `docs/design/<project>/`, which the three import
skills read as files. No hosted server, no key.

**This bundle is the axis default.** A product with no opinion on its design
tool lands here — the architecture menu preselects it — and one with an
opinion picks another.

**It needs the `taste-skill` tool.** Authoring runs through that plugin, which
this bundle does not install: a product using this tool picks `taste-skill` on
the tools round of `/vwf:architecture`. `design-session` halts plainly when it
is absent; the three import skills do not need it and keep working.

**The pack now designs and reviews screens.** `/design-session screens <flow>`
authors a flow's pages from the brief `/vwf:screens prompt` wrote, and
`/design-session review <flow>` serves them from the repo on loopback, takes
comments in the browser, and applies them in session; the screens import reads
the pages and the conversations import returns the open comments.

The slug is the `projects.<name>.design` token itself.
