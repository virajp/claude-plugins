# Testing a hand-authored page tree

The layer on top of the language pack's Vitest reference. That file owns the
runner — config, `_testUtils/`, how suites are run. This one owns what a
page tree adds, which is mostly one tool.

## The `test` task is validation

`html-validate` is the project's `test`. It is an offline HTML5 validator —
no request to a remote service — and it reads every page under `src/`:

```sh
html-validate "src/**/*.html"
```

The glob is **quoted** so the tool expands it rather than the shell: its
documentation says to, and an unquoted glob is expanded by whichever shell
runs the task, which differs between a person's terminal and CI. Its
configuration is `.htmlvalidate.json` at the project root, discovered by
searching upward from each file it reads:

```json
{
  "extends": ["html-validate:recommended"]
}
```

`html-validate:recommended` is the preset the tool's own documentation
names as the starting point. A rule the repo turns off is turned off in that
file with the reason beside it; a rule turned off across the board without
one is the validator being defeated rather than configured.

**Source, not output.** The task validates `src/`, because that is what a
person edits and what a review reads; a defect reported in `dist/` points
at a minified line nobody wrote. The build is a separate proof — a page
listed in `input` that does not parse fails `vite build`, and that runs on
every commit too.

## What validation catches, and what it does not

It catches the document's shape: a missing `<title>`, a missing `lang` on
the root element, an element that does not close, a duplicate `id`, an
attribute that does not exist, an image with no `alt`. That is the half of
the head checklist a machine can check, and it is the half that a framework
would have caught with a type on a layout's props.

It does **not** check that the OpenGraph set is complete, that the canonical
matches the page's URL, or that the sitemap lists the page. Those are the
checklist's, by review — the head reference says so, and this file does not
pretend otherwise.

## Rendering is the language pack's gate

A page that validates can still render wrong, and rendering is not
duplicated here: the language pack ships the `ux-gate` skill, which drives a
real browser over a served page, takes the screenshots the harness expects
of a `site`, and runs the accessibility scan. Point it at the dev server or
at a served `dist/`; this component adds nothing to it and states no
second rendering tool.

## Scripts are tested as modules

A `.ts` or `.js` module under `src/js/` that does more than wire an event —
a function that formats, computes or validates — is a plain module, and
the baseline's Vitest runs over it on the node environment with no page
involved. Keep the DOM wiring thin and the logic in a function the test can
import; a module that can only be exercised by loading the page is a module
that is not unit-tested, and the honest response is to split it, not to
reach for a browser in the unit suite.

There is no jsdom default here. A site that ships a module or two gains
nothing from a DOM in every test, and the one that needs it adds it to the
one suite that does.

## What is not tested

The URL shape, the 404 behaviour, the host's trailing-slash handling and the
deployed cache policy are all **build or end-to-end** concerns: a build that
fails is the first of those tests, and the rest belong to whatever
end-to-end suite the project runs against a served build, not to the
validator and not to Vitest.
