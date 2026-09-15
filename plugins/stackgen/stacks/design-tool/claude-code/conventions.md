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
  screens/
    <flow>--<platform>/
      <CODE>.html       one self-contained page per pinned screen code
      index--<platform>.html
                        the prototype: the happy path, linked in order
  comments/
    <flow>--<platform>.yaml
                        the review comments, one list per flow page
```

The canvas is **committed and reviewed like any other doc**. It is the
tool's own record, and it is what the import skills read — it is never
`docs/blueprint/design-system.md`, which stays vwf's import and is written
only by `/vwf:design-system`.

**Screens** mirror vwf's naming contract: the directory is the page
(`<flow>--<platform>`, `<flow>` being the numbered folder under
`docs/blueprint/flows/<project>/`), each `<CODE>.html` is a frame named by its
pinned screen code, and `index--<platform>.html` is the stitch. A page is
self-contained — inline style from the design system's tokens, the logo by
relative path, no script — and marks its non-default states as
`data-state` sections rather than extra files.

**Comments** are a YAML list, one item per remark the reviewer left:

```yaml
- id: <short unique id>
  screen: <CODE>              the screen file the comment sits on
  selector: <css selector>    the element clicked
  text: <what the reviewer wrote>
  status: open | applied
  created_at: <ISO 8601, UTC>
  applied_at: <ISO 8601, UTC, or null while open>
```

**The review loop**, in four lines:

1. `/design-session screens <flow>` authors the pages from the brief
   `/vwf:screens prompt <flow>` wrote.
2. `/design-session review <flow>` serves them from the repo, prints a URL,
   and waits; the reviewer clicks, comments, presses **Done**.
3. The session applies every `open` comment to its screen, marks it
   `applied`, and lists what changed.
4. `/vwf:screens import <flow>` diffs the reviewed screens against the
   contract; `/vwf:feedback canvas` sees whatever is still `open`.

**Loopback only.** The review server binds `127.0.0.1` on an ephemeral port,
serves only the canvas directory, carries no auth and no TLS — a surface for
one person on one machine, never a deployment. It needs `node`, which the
repo's toolchain manager provides (`mise use node` where the stack does not
already carry it).

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
a user invokes — and vwf never calls it. Its `scripts/serve.mjs` lands beside
it, a single-file Node program with no dependencies.
