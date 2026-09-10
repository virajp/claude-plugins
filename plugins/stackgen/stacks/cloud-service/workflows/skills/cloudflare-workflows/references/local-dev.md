# Local dev — Cloudflare Workflows

**This service runs on a laptop, and only on a laptop.** `wrangler dev`
simulates the Workflows binding locally, and there is no per-binding remote
mode to point it at the deployed engine; Workflows is also one of the three
bindings Cloudflare names as unsupported under whole-Worker
`wrangler dev --remote`, so a Worker binding a Workflow cannot be run
against the live platform from a dev session at all
([supported bindings per development mode](https://developers.cloudflare.com/workers/local-development/bindings-per-env/)).
Where this row sits among Cloudflare's other surfaces is the `cloudflare`
skill's local development map, which this cites rather than restates.

That is unusually good news for a durable execution engine: the local
session is a real engine running real instances, not a stub, so step
caching, retries and resumption behave.

## The loop

Three things, and the third is what makes this pleasant:

1. `wrangler dev` — start the session. The Workflow class in the script
   `main` points at is registered against its binding.
2. Create instances the way production does: through the Worker's own
   handler, hitting the local endpoint.
3. Drive and inspect them from a second terminal. **Every
   `wrangler workflows` command takes `--local`** to target the dev
   session rather than the account, with `--port` selecting it (default
   `8787`); the flag needs Wrangler 4.79.0 or newer
   ([wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/workflows/)).

The commands the loop actually uses
([wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/workflows/),
[local wrangler workflows commands](https://developers.cloudflare.com/changelog/post/2026-04-01-wrangler-workflows-local)):

| Doing | Command |
| --- | --- |
| Start an instance without going through the Worker | `wrangler workflows trigger <name> [params] --local` |
| Start one with a chosen id | `wrangler workflows trigger <name> --id <id> --local` |
| See what exists | `wrangler workflows list --local`, `wrangler workflows instances list <name> --local` |
| See why one is stuck — its logs, retries and errors | `wrangler workflows instances describe <name> <id>` |
| Unblock a `waitForEvent` | `wrangler workflows instances send-event <name> <id> --type <type> --payload '<json>' --local` |
| Hold or release one | `wrangler workflows instances pause \| resume <name> <id> --local` |

`send-event` accepts `latest` in place of an id, which is what makes
driving the instance you just created a one-liner
([send-event](https://developers.cloudflare.com/workflows/reference/wrangler-commands)).

## Sleeps are not fast-forwarded

**Cloudflare documents no way to skip a local sleep.** The `--local`
surface above drives *instances* — trigger, pause, resume, send an
event — and nothing in it moves the clock
([wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/workflows/)).
A `step.sleep("wait 30 days", "30 days")` waits thirty days locally too.

So the duration is a parameter, not a literal. Two shapes work, and the
first is better:

- **Pass the duration in through `params`**, defaulting to the production
  value and overridden by the test. The step and its name are unchanged,
  so what the suite exercises is the real code path.
- **Where the wait is genuinely open-ended, use `waitForEvent` instead of
  a long sleep** and let the test send the event. That is the shape a
  human-in-the-loop process wants anyway, and it is driveable from the
  command line.

A sleep whose duration is hard-coded at anything longer than a coffee
break is a step no local run and no CI job will ever get past — and the
failure mode is a hanging test rather than a failing one, which is worse.

## Resetting local state

There is no Workflows-specific reset command — the command surface is the
list above
([wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/workflows/)).
Local instances persist in the dev server's own persistence directory like
every other locally-simulated binding's state, so the reset is removing it
between runs rather than a subcommand.

That persistence is the usual double edge. It is why an instance you
paused yesterday is still paused; it is also why **a suite that passes
only on its second run is depending on leftovers**. Where a test creates
instances with domain-derived ids — as
[service doctrine](service-doctrine.md) asks — a leftover instance with
the same id is exactly the collision the id was designed to cause, and it
will look like a test failure rather than like stale state. Reset between
runs, not between assertions.

## What does not reproduce locally

- **Scale, and therefore the step ceiling.** A local run of a fan-out with
  ten items behaves identically to one with ten thousand, right up until
  the deployed one meets `limits.steps`. That ceiling is a design
  decision, not something a local suite catches — see
  [cost shape](cost-shape.md).
- **The bill.** Steps executed and CPU time are billed dimensions and are
  not visible locally in the terms the invoice uses. A Workflow that is
  fine on a laptop and expensive in production is expensive because of
  step granularity, which is reviewed against the design rather than
  observed on a laptop.
- **The engine's real hibernation.** Locally a short sleep may never
  exercise the hibernation that erases everything held outside a step, so
  the classic bug — a variable accumulated across steps — can pass a
  local suite and fail in production after a long sleep. The defence is
  the rule rather than the test: nothing crosses a step boundary except a
  step's return value.
- **Anything remote.** There is no remote mode of either kind here, so a
  question genuinely about the deployed engine — how a long-running
  instance behaves across a redeploy, what an errored instance looks like
  after retention — is answered in a deployed environment or not at all.
