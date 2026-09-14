# Notion — cost shape

No dollar figures: they age badly and are wrong per plan anyway. What matters
is the **shape** of the bill and which decisions move it.

## The bill is one the team already pays

**Wiring this pack adds no line item.** The workspace plan exists because the
team writes in it; the hosted server is reached with a person's own account, so
there is no per-repo charge, no metered call, and no new vendor relationship to
open. Pinning `notion` on a project is a configuration decision, not a
purchasing one — which is unusual for a backing pin and is most of the case for
this provider.

**Cost scales with people, as it already did.** Notion bills per member, and
the agent is not a member — it acts as whoever authorised it. Nothing about
this pack changes the seat count in either direction.

## What would change that

Three things, each worth checking before assuming the paragraph above:

- **Tool access gated by plan.** The server reports, per tool, whether the
  connected workspace may use it, and points at an upgrade where it may not.
  So the reach this pack promises is a function of the plan, and a workspace on
  a lower tier may find the write or query tools unavailable while search and
  fetch work. Confirm against the connected workspace rather than against this
  page — the gating moves.
- **A seat bought so an agent can read.** If someone is given membership purely
  to authorise a tool, that is a seat the team is buying for this integration,
  and it should be counted as one. It is also the shape that quietly defeats
  clause 5's fence: the grant follows that account's permissions, and an account
  created for a tool tends to accumulate access nobody reviews.
- **Guests and external collaborators.** A workspace that files work in shared
  spaces with guests has a permission surface that differs per person, so what
  the agent reaches — and therefore what an answer is worth — depends on who
  authorised. That is a correctness question before it is a cost one, but the
  usual fix is a seat.

## The recurring cost is on the agent's side, not Notion's

**The bill that actually grows is context, not currency.** A workspace page is
long, a database has many rows, and pulling a subtree into a session costs the
model's window on navigation and boilerplate. That is why
[access shape](access-shape.md) makes search-before-browse a rule rather than a
preference: it is the one habit with a measurable price, paid every session, by
whoever is running the agent.

The same logic explains what is genuinely free here. **Adding pages costs this
integration nothing** — read volume is a function of how often someone asks a
question, not of how large the workspace grew — so there is no incentive to
prune the workspace for the agent's sake, and no reason to cache its contents
into the repo. Copying a page in to save a read trades a nonexistent cost for a
real staleness problem, and the workspace contract already says which of the two
is the source.

## The cost this pack's scope avoids

Nothing the product runs reaches Notion, so the bill does not grow with traffic,
with the number of running services, or with the number of deployed
environments. A workspace on the runtime path would have a completely different
curve — and a different contract, which is why the scope clause refuses it.
