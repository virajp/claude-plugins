DECISION 2026-11-06 ★4 | skill:execute | plan execution key: solo or teams
→ teams for edit units and the wave reviewer, solo as the fallback; only a
teams wave names an agent | alts reviewer sends findings directly, questions
that block rejected

# A plan runs `solo` or `teams`

A plan folder's `execution` key asks whether a wave's `edit` units and its wave
reviewer can send messages to each other. No key reads as `solo`.

## Rulings

1. `edit` units and the wave reviewer are teammates. `code` units and `review`
   rows do not change.
2. If a team cannot start, the run falls back to `solo` and records the reason.
   It never stops for this.
3. A `teams` plan has the same permission rule as `solo`, with no new mechanism.
4. The interview recommends `teams` when a wave holds two or more `edit` units,
   otherwise `solo`, and the user confirms.
5. The orchestrator relays findings to the live unit, and each relay is a round.
6. A unit sends only a fact or a boundary question, at most 3 messages a round,
   and never waits for a reply.

## What the tests found (CLI 2.1.318)

These facts are why the rules read as they do. Test them again before you change
a rule.

- With the flag off, an `Agent` call with a `name` succeeds, and only
  `SendMessage` fails. So the preflight reads the flag.
- Under an interactive lead with the flag on, a `name` makes a teammate. Its
  `Agent` call returns a spawn confirmation at once, even when the call asks for
  the foreground, and its report arrives later as a message.
- A message wakes an idle teammate, and it can replace its report. So the latest
  report counts, and the orchestrator waits until all are idle.
- A named agent is a teammate, and a teammate's named `Agent` call fails:
  "Teammates cannot spawn other teammates". So only a `teams` wave uses `name`,
  and an `all` runner has none.
- An unnamed runner can start teammates, but it ends its turn before their
  reports arrive. So a runner always runs `solo`.
- `dontAsk` does not reach a teammate, whose mode reads `default`.
- Hook `agent_type` reads the name for a teammate. So the pane ties an unnamed
  agent by the start of its description.

Not tested: a full `/vwf:execute` run in `teams` mode, a lead inside a worktree,
auto and bypass modes, and a `name` on a custom agent type.
