DECISION 2026-09-14 ★3 | stackgen-reputation placement | the check runs only
where the generator first emits a name, and a block halts the component — the
user picks the replacement | alt auto-substitute, warn-only, a network-enabled
reviewer, an MCP vendor rejected

**Source plan** `2026-09-14-stack-reputation`.

The menu never names a package, so the generator (assemble step) is the one
place a name becomes concrete. Shipped packs stay hand-curated.

- A `block` halts that component and shows the verdict table. The generator
  never swaps a name silently, because a swap is a new recommendation that needs
  its own check. Rejected: auto-substitute and re-check; warn-only.
- Sources are public read APIs through `WebFetch`: deps.dev, OSV.dev, the
  ecosystem registries, the GitHub API, Docker Hub. No MCP server, no key.
  Rejected: a vendor MCP entry in stackgen's manifest (needs an account);
  Context7.
- The reviewer stays stateless with `Read, Grep, Glob`. Its tenth check reads
  the verdict table the orchestrator hands it. Rejected: network tools for the
  reviewer.
- An unreachable source gives `UNRESOLVED`, never an inferred verdict. This is
  the same posture as the Context7 precondition.
- The check does not run on template read-back for `/vwf:plan` and
  `/vwf:execute`. That path stays free of the network.
- Thresholds beyond the plan's block rules were assumed in the run (latest
  publish over 730 days, under 1,000 downloads a week, Scorecard under 4.0,
  CVSS 7.0 or higher blocks). Each lives in `references/signals.md`.

Trap: `WebFetch` is a plain GET. OSV's query endpoint is a POST, so the skill
reads `GET /v1/vulns/{id}` with ids from deps.dev `advisory_keys`. Advisories
for actions and pub, and image existence outside Docker Hub, stay `unavailable`.
