# Claude Code — conventions

A file canvas: the design tool is the terminal session itself, and its source
of truth is a **committed directory** in the repo rather than a hosted canvas.
Nothing is reached over an API, so there are no credentials and nothing to
keep out of a log.

**The canvas is `docs/design/<project>/`**, one per registry project:

```text
docs/design/<project>/
  design-system.md      the design system, in the shape taste-skill authors
  brand/
    logo.svg            the one source every variant derives from
    <variant>.svg       mark, wordmark, lockup, mono, dark — as authored
    README.md           clear space, minimum sizes, the rules
```

The canvas is **committed and reviewed like any other doc**. It is the
tool's own record, and it is what the import skills read — it is never
`docs/blueprint/design-system.md`, which stays vwf's import and is written
only by `/vwf:design-system`. Screens and review comments join the canvas in a
later release; until then the screens import reports no screens and the
conversations import answers `harvested: n/a`.

**The plugin this pack requires.** Authoring runs through the `taste-skill`
plugin's design skills, so a product pinning this tool adds
`taste-skill@taste-skill` to the agent plugins it requires — answered at
init's fifth question, which writes the list into the task library so the
repo's `setup:ai` installs it at project scope. The pack vendors none of that
doctrine and vwf depends on none of it. Every skill here that needs the plugin
checks for it first and halts with the one sentence below when it is absent:

> `taste-skill` is not installed. Add `taste-skill@taste-skill` to this
> product's required plugins and run `mise run setup:ai`.

**The `design_system_id` is the canvas path** —
`docs/design/<project>/design-system.md` — rather than a hash of its content.
The pin names *which* design system a project has, and that answer does not
change when the system is edited; a hash would drift on every authoring
session and read as a re-pin nobody made.

The three import skills land at **fixed names** in the repo's own
`.claude/skills/` — `design-import-screens`, `design-import-design-system`
and `design-import-conversations`. vwf invokes those names; it never
constructs one from configuration, and it never learns which tool answered.
The fourth skill, `design-session`, is the tool's authoring surface — the one
a user invokes — and vwf never calls it.
