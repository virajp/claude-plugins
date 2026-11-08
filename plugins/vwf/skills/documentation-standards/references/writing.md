# Writing Markdown

## Writing style

- Write short sentences, in the present tense and the active voice.
- Cut filler. Replace "This document describes…" with the content itself.
- Give each code block a language identifier, for syntax highlighting.
- Use a table for a structured comparison.

## Heading hierarchy

- Use one `#` H1 per file, as the title. Everything else is `##` and deeper.
- Never skip a level, such as `##` to `####`. Nest by one.
- Use sentence case, not Title Case.
- Use no trailing punctuation in a heading.
- Use no heading numbers unless the order is load-bearing.

## Links

- Write descriptive link text. Never use "click here" or a bare URL for prose.
- Use a relative link within a repo (`../api/auth.md`). Use an absolute link only
  for an external target.
- Use an inline link by default. Use a reference-style link (`[text][ref]`) only
  when the same target repeats, or the URL is long enough to hurt readability.

## Front matter

- Add YAML front matter only when a tool consumes it, such as a static-site
  generator or a skill or command manifest. Add none to a plain README or doc.
- Keep only the keys that the consumer reads. Add no speculative metadata.
