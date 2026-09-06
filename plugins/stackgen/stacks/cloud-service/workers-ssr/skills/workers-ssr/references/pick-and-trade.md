# Workers SSR — pick & trade

## What it is for

Hosting a project whose deployment is **a script plus the files it fronts**.
Some of its responses are decided at build time and served by the platform;
the rest are rendered per request by code running at the edge. One Worker
name, one upload, both halves.

Unlike the account's access stack, this **is** where the project runs. It
produces an artifact and it is what a `site` project pins on the `deploy`
axis when the whole page set cannot be enumerated ahead of time.

## When a project belongs here

- **A site that renders some or all of its pages on demand** — a framework
  in server mode, or a prerendered site with a handful of routes opted out.
- **A prerendered site that needs a few real endpoints** — a form handler,
  a search proxy, a webhook receiver — where standing up a separate service
  for three routes is more machinery than the routes are worth.
- **Anything already on this account as static assets that has outgrown
  them.** Adding `main` is the migration, and the file set, the route and
  the token all survive it.

The common thread is that **the response for some path is decided per
request, and the work is small and I/O-shaped**. Where that holds, there is
no server to size, patch or keep warm, and the deploy is still an upload.

## When it stops being the answer

- **Nothing renders on demand.** If every response is decided at build
  time, `main` is a script that will never be reached for a matched path
  and a billing surface for the ones that are not. That is
  `workers-static-assets`, and it is the cheaper and simpler pack.
- **The work is CPU-heavy or long-running.** Image processing, a
  report build, anything that wants to hold a request open for a long
  stretch. The platform caps CPU time per invocation, and a workload that
  fights the cap wants a container — `cloud-run` — where the ceiling is a
  configuration rather than a platform property.
- **The code needs a real Node runtime.** `nodejs_compat` provides a
  surface, not Node. A dependency reaching for a built-in outside it fails
  at the edge, at runtime, on the path that used it — which is the worst
  place to find out. A container runs the actual runtime and has no such
  cliff.
- **The process must hold state between requests, or hold a connection.**
  Isolates start and stop per request. A pool, a warm cache, a long-lived
  socket to a database — none of them survive, and simulating one is worse
  than not having it.
- **The datastore is reached over a protocol the runtime does not speak.**
  A driver expecting raw TCP is the usual case, and the answer is either a
  proxy the platform does support or a different deploy target.

## The trade, stated plainly

**What it buys:**

- **No origin and no cold start worth naming.** Isolates start in
  single-digit milliseconds, so the pause a scale-to-zero container pays on
  its first request does not exist here.
- **One artifact, one act.** Script and files upload together, so what is
  running is exactly what the build produced, and rolling back is selecting
  a previous version rather than rebuilding an old commit.
- **Global by default**, with no CDN in front of an origin, because the
  code and the files are already everywhere the requests are.
- **The static half stays free.** A request the assets answer never invokes
  the script — see [cost shape](cost-shape.md).

**What it costs:**

- **A runtime that is not Node, and a compatibility flag that is not a
  promise.** See the cliff above. This is the single most common surprise.
- **A CPU ceiling you do not set.** It is a platform property. Discovering
  it late means rewriting the workload or moving the deploy target.
- **No process to attach to.** No shell, no long-running profiler, no
  "reproduce it on the box". Debugging is logs, traces and the local
  runtime — see [local dev](local-dev.md).
- **Local development cannot see the edge.** Routing that lives in DNS or
  the route pattern is invisible on a laptop, exactly as for the static
  sibling.

## What choosing it does not decide

**Which framework or adapter renders the page.** `main` names an entry the
project's adapter defines, and the project bundle that pairs here names the
adapter — `astro-ssr` and `astro-hybrid` name `@astrojs/cloudflare`. This
component fills a marked position; it does not choose what fills it.

**Where the product's API runs.** A rendering front end and a backend
service are two projects with two deploy pins, and this one covers exactly
the first.

**Whether the site is public.** It can sit behind the account's
identity-aware proxy — `cloud-service/zero-trust-access` — which is a
second pin on the same axis rather than a replacement for this one.
