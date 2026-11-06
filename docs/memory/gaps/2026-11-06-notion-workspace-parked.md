GAP 2026-09-14 ★2 | notion addon has no consuming vwf step | open: no vwf step
reads Notion, and no ruling names which step or what the agent may write back

**Source plan** `2026-09-14-notion-workspace`.

The plan wired Notion as "available" only. The server choice (hosted over
stdio) and the no-token reason live in the addon pack's references. The
`workspace` contract and the moves to the `addon` axis are in the current tree.

Still open:

- A vwf step that uses Notion, for example `/vwf:feedback` harvesting a
  database or `/vwf:product` reading a page as its source. Decide first which
  steps may read it and what the agent may write back.
- A headless path (stdio server with a token from the secrets provider) is not
  shipped. It would be the first pack entry that carries `env`, and checker
  the checker rule on runner overridability would need to cover pack entries.
