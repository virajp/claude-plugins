GAP 2026-11-09 ★2 | execute-coder has no web tools | open: the coder reads
pack hints that say "else the official documentation", but its tools are Read,
Write, Edit, Bash, Grep and Glob, so it cannot fetch a page | parked, no plan

**Source plan** `2026-11-09-generator-without-context7` (decision D22).

- `plugins/vwf/agents/execute-coder.md:8` lists the coder's tools. It has no
  WebFetch, no WebSearch and no MCP tools, so neither Context7 nor the official
  documentation is in its reach. The stack pack hints point to both.
- Giving a vwf agent web tools is a security decision: fetched pages are
  untrusted input to an agent that writes code. Decide the tools, and any
  allowlist of hosts, in a plan of its own.
- Until then the coder works from the pack's judgment and the code it can read.
