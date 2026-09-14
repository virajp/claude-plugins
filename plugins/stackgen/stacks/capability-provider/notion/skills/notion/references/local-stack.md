# Notion — local stack

## There is nothing to compose, and that is the finding

Notion is **hosted-only**, and it is not a service the product talks to — it is
a place the agent reads while a person is present. So the kind's usual answer,
a real engine behind a `wait-on` readiness gate, has nothing to point at.
`pack.yaml` records `local_stack: n/a` honestly rather than inventing a task
name.

What the kind asks for in that case is **a seam and a fake, with the gap
named**. Here they are, and here the seam is unusually clean: it is the absence
of the provider.

## The seam is that nothing automated is on this path

Every task, every gate and every test must run **identically with the workspace
unreachable** — because for CI, for a fresh clone and for anyone who has not
authorised, it always is. That is not a target to work towards; it is the
starting condition, and this pack's job is to avoid breaking it.

Concretely, three rules that all say the same thing:

- **No task reads the workspace.** Not a gate, not a check, not a build step.
- **No test asserts against workspace content.** A page's text is not a
  fixture; it changes without telling the repo, which is exactly why the
  contract calls the workspace a source rather than the truth.
- **No documentation build resolves a Notion link.** A link is a pointer for a
  human, and it stays one.

**The check is one command:** run the repo's full task list on a machine that
has never authorised. If anything fails, the failure is this pack's — nothing
here is allowed to be a prerequisite for anything.

## The fake is the repo's own docs

Where a question has to be answerable without the workspace, the answer lives
in the repo. That is not a workaround: every vwf step already works from the
repo's own docs, which is where the durable contracts are written, and the
contract's absence clause says plainly that a project with no workspace pinned
loses nothing.

So the fake needs no fixtures and no recorded responses. The degraded mode is
the normal mode with one source missing, and the only thing required of the
agent is to **say which mode it is in** — see clause 3 in
[contract satisfaction](contract-satisfaction.md), where reporting *not wired*
rather than *not found* is the whole point.

## The gap, stated

**Anything that genuinely needs the workspace can only run interactively, on an
authorised machine.** There is no offline mode, no local server and no
credential to give a runner —
[authorisation, not a token](oauth-not-token.md) is why. Two honest ways to
live with it, chosen deliberately rather than by accident:

- **Keep those readings in the session**, as something a person asks for and
  reviews, and write anything durable that comes out of them into the repo. The
  workspace informs the docs; it does not become a dependency of them.
- **Copy the decision, not the link**, when a workspace page is the only record
  of something the repo has to keep being right about. A pointer to a page a
  future reader cannot open is not a record.

What must not happen is a task, a gate or a test quietly acquiring the
workspace as a prerequisite: it converts "you have not authorised yet" into a
wall of failures nobody attributes to configuration, and it makes every
automated run a machine that cannot do it.
