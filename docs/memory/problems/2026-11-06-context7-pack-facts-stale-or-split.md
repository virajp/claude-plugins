PROBLEM 2026-09-06 ★3 | pack authoring from Context7 | two Context7 libraries
disagreed or served stale data and a unit wrote the wrong fact — the live page
or the npm registry decides, not the first Context7 answer | a reviewer that
re-checks cited pages caught every case

**Source plan** `2026-09-06-cloudflare-ai`,
`2026-09-06-cloudflare-storage-and-data`,
`2026-09-06-cloudflare-compute-and-orchestration`.

Every Cloudflare fact in a pack is checked against Context7 and cited by URL.
Four runs showed that this is not enough alone.

- **Package name.** A unit changed the Agents SDK test import to
  `@cloudflare/vitest-pool-workers` on stale Context7 data. The npm registry
  showed `@cloudflare/vitest-plugin` current and the pool package frozen at
  0.22.0. The pack now names the plugin and carries a clause for its
  predecessor. The same stale name stood in the D1 local-dev text.
- **Limits.** The two Context7 libraries gave 10M and 20M vectors per index for
  Vectorize. The orchestrator fetched the live page: 20M vectors, and 50,000
  namespaces on Paid against 1,000 on Free. The plan text carried the stale 10M.
  The pack was right and the plan was wrong.
- **Per-object SQLite cap.** Context7 returned 1 GB and 10 GB. The pack states
  that a cap exists and tells the reader to read the limits page.
- **Citations off the page.** Reviewers found citations that pointed to a
  parent or a neighbour page: Sandbox pages cited for Containers rules, an
  Agents
  page for a Durable Object call, a landing page for a negative claim. The fix
  is
  to cite the page that states the claim. The Containers `EXPOSE` rule is stated
  in Sandbox docs only, so the pack marks it as an inference.

How to avoid it again: for a package name, check the npm registry. For a limit,
fetch the live page the pack cites. When two Context7 libraries disagree, take
neither on trust and say so in the run log. A convergence guard that trips on a
fact that came back is a signal to settle the fact by hand, not to loop.
