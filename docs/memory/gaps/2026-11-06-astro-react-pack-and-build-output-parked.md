GAP 2026-09-05 ★2 | Astro bundles: parked follow-ups | `framework/react` is
still `@generated` in the Astro bundles, and `build_output` is not a payload
field | open

**Source plan** `2026-09-05-astro-static`,
`2026-09-05-cloudflare-workers-static`.

Still open in the tree (the four Astro bundles still pin
`framework/react@generated`, and no `build_output` exists):

- `framework/react` as a real pack. The "fold react in too" idea was
  declined at review. It needs the same work as the Astro pack.
- `build_output:` as a template-payload field that a framework pack declares
  and a deploy pack reads at pin time. It needs a new key in vwf's
  `stack-adapter.md` payload contract, so it is a vwf plan. Until then the
  build output (`./dist`) is a named fact in the Astro pack conventions, and
  both Workers packs cite it.
- 95octane still pins `project/site/typescript-astro-react`. It must become
  `project/site/astro-ssr`. That is a one-line edit in that repo's own
  session, then a `/vwf:doctor` run.
- A Worker script in front of a static site (`run_worker_first`) is not
  built. The SSR pack ships the knob off. Nobody asked for the shape.
- Reserved Cloudflare services stay reserved by name: Pages, R2, D1, KV,
  Durable Objects, Queues, Images, Stream (later packs redeemed some).
