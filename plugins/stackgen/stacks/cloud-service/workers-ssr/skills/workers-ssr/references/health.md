# Health — Workers SSR

**There is no instance to probe here, and half the deployment cannot be
unhealthy at all.** vwf's `health` harness capability asks how "is it up?"
is answered; for a Worker with a script the honest answer is an HTTP probe
of the deployed origin, because there is no process of yours running
between requests. The platform either serves the file set and starts the
isolate, or it does not.

The `harness.health` task is therefore `n/a`. This component fixes no task
name and ships no probe — what it fixes is **what the probe must ask**.

## Two probes, and the second is the one worth having

1. **`GET /` returns 200** and the body is the expected entry document.
   This catches the obvious failures: a deploy that never landed, a route
   that points at nothing, an expired certificate.
2. **`GET` a route known to render on demand returns 200 with a response
   the platform did not serve from the file set.** Pick a path the build
   does not prerender, and assert something only the script could have
   produced — a value that changes per request, a header the script sets, a
   body that reflects the request. This is the probe that earns its keep.

The second matters because of the fall-through rule. **A deployment whose
script is broken still passes the first probe** for every prerendered path,
because those requests match a file and the script is never invoked. The
site looks entirely correct until someone asks for a route that renders,
and if the prerendered set is most of the site, that can be a long while
and a small fraction of traffic — which is exactly the shape of failure
nobody notices from a dashboard.

The inverse is worth knowing too: a script that throws returns an error the
framework's own handler produced, or a platform error, at a status the
first probe never sees. Probing only `/` on a mostly-prerendered site is
probing the CDN.

## Why a health endpoint in the build is worse than no endpoint

The instinct is to have the build emit `/health` returning a fixed string.
As a *file* it proves nothing the first probe does not — if it is being
served, `/` is being served from the same upload — and it has to be
excluded from the site's routing, its sitemap and its link checks.

**A `/health` route rendered by the script is a different thing, and it is
the second probe under another name.** If the product wants one, that is
fine and it is what probe 2 asks for; what it must not be is a prerendered
file wearing the name, because that is the version that reports green while
the script is dead.

The exception, as for any deployment, is a build stamp: a value naming the
commit the release was built from. It answers "which release is live?"
rather than "is it live?" — a different and genuinely useful question, and
one the script can answer with the same response as probe 2.

## What health cannot tell you here

- **Whether the rendered output is correct.** A successful upload of a
  broken build is a successful upload, and a script that returns 200 with
  the wrong page is healthy by every definition a probe has. Correctness is
  the acceptance suite's, running against a deployed URL — see
  [pipeline](pipeline.md).
- **Whether the script's dependencies are reachable.** A probe of a route
  that renders from static data says nothing about the one that renders
  from a datastore. If the script has a downstream, the probe should touch
  it — and then it is a dependency check, with a dependency check's cost
  and its own failure modes, which is a decision to make deliberately.
- **Whether the cache policy is right.** A probe fetches once and sees a
  fresh response, which is exactly the case where a bad `Cache-Control` on
  a rendered response looks fine — see [artifact](artifact.md).
- **Whether one region is broken.** A probe runs from wherever it runs.
  Edge-local failures are not visible from a single vantage point, and
  chasing them with more probes has poor returns.

## Alerting is built on request signals, not on instance health

There are no instances. Availability is measured as the error rate, the
latency and the CPU-time distribution of real requests, which the
platform's own analytics report; building an alert on anything
instance-shaped produces a metric that is either always green or
meaningless. The one signal worth adding beyond error rate is **CPU time
approaching the platform's per-invocation limit**, because that failure
arrives as a hard cutoff rather than as a slowdown — see
[pick & trade](pick-and-trade.md).
