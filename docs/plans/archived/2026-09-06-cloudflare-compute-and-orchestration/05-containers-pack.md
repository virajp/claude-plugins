# U5 — The `cloud-service/containers` pack, its `config/` tier, and the `cloudflare-containers` bundle

- **Wave:** 2
- **Depends on:** U1 (the narrowed provider scope you cite)
- **Owns:** `plugins/stackgen/stacks/cloud-service/containers/**` (all new,
  including its `config/` tier) and
  `plugins/stackgen/stacks/bundles/cloudflare-containers.md` (new). Touch
  nothing outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/workers-ssr/**` top to
  bottom — **the pack you mirror in form**: `pack.yaml` (`category: compute`,
  `axis: deploy`, `artifact:`, the `harness:` prose), `conventions.md`,
  `skills/workers-ssr/SKILL.md` (eight-row router table), the eight references,
  and the two payload files `config/wrangler.jsonc` and
  `config/.config/mise/tasks/p/_project/deploy` — read the task line by line,
  including every comment;
  `plugins/stackgen/stacks/cloud-service/zero-trust-access/pack.yaml:7-9` (the
  unset-`capability` comment shape);
  `plugins/stackgen/stacks/bundles/gcp-cloud-run.md` (the deploy Cloud-Bundle
  you mirror — provider + service only, `artifact: container-image`) and
  `plugins/stackgen/stacks/bundles/cloudflare-workers-ssr.md` (prose register,
  and the pointer sentence plan A left where the reservation was);
  `plugins/stackgen/stacks/cloud-service/durable-objects/**` if U2 has landed in
  your worktree (a Containers instance is addressed through a Durable Object —
  cite that pack by path; if it is not there yet, cite the path anyway and say
  so in `GAP:`); `plugins/stackgen/stacks/cloud-provider/cloudflare/**` as U1
  left it; `plugins/stackgen/assets/kinds.md:186-281` (the five service topics
  **and** the deploy-target extension at `:254-265`);
  `plugins/stackgen/assets/pack-format.md:19-142` (the `config/`
  sub-conventions: root allowlist, `_`-prefixed entries, 755 on tasks) and
  `:144-234`; `.claude/skills/stackgen-plugin/SKILL.md:72-129` (the seven kinds
  of `config/` entry — yours is `(f)`, the deploy overlay — and the composition
  order that puts the cloud pack last);
  `.claude/skills/plugin-authoring/references/checks.md:87-130` (rule 11's seven
  assertions your `config/` tier must pass).
- **Lazy-load:**
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`
  §`p:<project-id>:*` (the task vocabulary the overlay joins);
  `.config/mise/tasks/plugins/shellcheck` (the exact flags your task is checked
  with); Context7 `/websites/developers_cloudflare` for every Containers fact
  (fallback `/cloudflare/cloudflare-docs`).

## Ruling

B2: "`cloudflare-containers` is `axis: deploy` with `artifact:
container-image`,
mirroring `gcp-cloud-run.md` — provider + service only." Rejected: "a
`deploy-target/container-image` component in the Containers bundle".

B3: "**Containers ships one** [config tier], mirroring `workers-ssr/config/` in
form: `config/wrangler.jsonc` and
`config/.config/mise/tasks/p/_project/deploy`."

B4: "A Containers project **is** a Workers project, so `cloudflare-containers`
is pinned **instead of** `cloudflare-workers-ssr`, never beside it — both ship a
`wrangler.jsonc` and would collide; the bundle prose says so. The Containers
`wrangler.jsonc` is a **complete** Worker config (`main`, the container block,
the DO binding and migration)."

B5: "Durable Objects and Containers cite none" of the contracts.

B6: "Durable Objects and Containers **unset** with the zero-trust comment shape
(… deploy-axis `compute` carr[ies] no vwf token)."

B8: "Router skill directory and `name:` are `cloudflare-<slug>`:
`cloudflare-containers`." The pack directory is `containers`.

B9: "Containers: exactly **eight** — the five plus `artifact.md`, `pipeline.md`,
`health.md` (the deploy-target extension of `kinds.md:254-265`)."

B10: "Every Cloudflare fact in a pack is verified against Context7
`/websites/developers_cloudflare` (falling back to
`/cloudflare/cloudflare-docs`) at authoring time and cited by URL in the
reference that states it. No fact from memory."

B11: "`harness:` carries `health`, `e2e_staging`, `local_stack`, each
`task: n/a` with honest mechanism prose, as `zero-trust-access/pack.yaml:14-41`
and `workers-ssr/pack.yaml` do. Containers names no health task either — its
`health.md` carries the doctrine (a Containers health probe **task** is
parked)."

B12: "Packs **cite** the provider pack's identity-and-iam reference for the API
token and account id and never restate them; the Containers deploy task checks
the same two environment variables the `workers-ssr` task checks, with the same
comment."

B13: "Every new pack and bundle is `0.1.0`."

Plan facts, to verify, not trust: `wrangler.jsonc` carries
`containers: [{class_name, image, max_instances}]` with `image` pointing at a
Dockerfile path, alongside a `durable_objects.bindings` entry whose `class_name`
matches and a `migrations` entry; `wrangler deploy` builds and pushes the image;
`wrangler dev` with containers needs Docker running locally; instances start on
demand and sleep after inactivity; instance types have stated CPU/memory/disk
limits.

B16: "The Containers deploy task adds one check the Workers SSR task lacks:
`docker` on `PATH` and the daemon answering (`docker info`), after the
credential check and exempt under `--dry-run`, because `wrangler deploy` builds
the image. The one deliberate departure from line-for-line mirroring."

## Edits

1. **`pack.yaml`** — `name: Cloudflare Containers`; a `summary` in the
   workers-ssr sibling's voice (a Docker image running beside a Worker,
   addressed through a Durable Object — the deploy target for a process that
   needs a real filesystem, a runtime the Workers sandbox cannot host, or more
   than a Worker's CPU budget, while the Worker stays the front door);
   `version: 0.1.0`; `type: cloud-service`; `category: compute`; the
   `capability` comment per B6; `kind: cloud-provider`; `axis: deploy`;
   `artifact: container-image`; `harness:` per B11 — `health` (a container is
   reachable only through its Worker; the mechanism is the Worker's readiness
   path forwarding to the container's own health endpoint, with the cold-start
   window stated; `task: n/a`), `e2e_staging` (a staging Worker with its own
   container class and image tag; the suite targets its URL; never a shared
   image tag between environments), `local_stack` (`wrangler dev` builds and
   runs the container locally via Docker — what it needs on the machine and its
   fidelity trap, verified).
2. **`conventions.md`** — the component's prose, copied verbatim into the
   template payload: what this pack writes (`wrangler.jsonc` at the root — and
   **why the root**, citing the allowlist rule and that wrangler discovers its
   config there; the `p/_project/deploy` overlay); the marked positions and who
   fills them; the credentials rule by **citation** of the provider's
   identity-and-iam (B12); the task CI must run (`p:<id>:deploy`) and that the
   workflow file is the repo's per the charter fence; the artifact contract (a
   Dockerfile in the repo, the image built and pushed by `wrangler deploy` to
   Cloudflare's registry, tagged per deploy); the **instead-of** rule (B4) in
   its own short paragraph, with the reason; how the Worker addresses the
   container (the Durable Object class, cite U2's pack by path for DO doctrine);
   instance types and the sleep/wake lifecycle as stated; what this pack
   explicitly does **not** cover (static assets — the Workers packs; a container
   without a Worker in front — not a Cloudflare shape; one pointer sentence to
   the provider conventions for scope). Cite the provider doctrine for cost and
   identity; never restate.
3. **`config/wrangler.jsonc`** — a **complete** Worker config in the
   `workers-ssr/config/wrangler.jsonc` form: the same header comment block
   rewritten for Containers (what the stack is; credentials never live here, by
   the same two sentences the sibling uses), `$schema`, the
   `"name": "PLACEHOLDER"` marked position with the sibling's comment block
   verbatim in structure (deliberately invalid uppercase), `main` as a marked
   position with a real default the project bundle can override (mirror how the
   sibling treats `main`), `compatibility_date` as today's date,
   `compatibility_flags: ["nodejs_compat"]`, a `containers` array with one entry
   — `class_name` (a real default, e.g. the same name the DO binding uses),
   `image` as a Dockerfile path (`./Dockerfile`), `max_instances` with a
   conservative real value and a comment saying why — a
   `durable_objects.bindings` entry whose `class_name` matches, and a
   `migrations` entry declaring the class (the exact key for a container-backed
   class as verified — `new_sqlite_classes` or otherwise),
   `observability.enabled: true`. Every real value gets a why-comment in the
   sibling's register. The file must be valid JSONC: strip `//` and `/* */`
   comments and it parses as JSON.
4. **`config/.config/mise/tasks/p/_project/deploy`** — executable,
   `#!/usr/bin/env bash`, and **line-for-line the workers-ssr task** where the
   semantics are the same: the `#MISE description=` (rewritten: "Build this
   project's container image and deploy it with its Worker to Cloudflare"),
   `#MISE dir="{{ config_root }}"`, `#USAGE flag "--dry-run"`, the `_project`
   marked-position header comment verbatim, `set -euo pipefail`, the `helpers`
   source with `# shellcheck source=/dev/null`, `project_id` from the directory
   name, `have_task`, `print_header`, the credentials check verbatim (same two
   variables, same comment, same `--dry-run` exemption), the
   `pnpm exec wrangler` / `npx wrangler` resolution with its comment,
   `wrangler deploy` (and `--dry-run` mapped through). Add one step the sibling
   lacks, before the deploy: a check that `docker` is on `PATH` and the daemon
   answers (`docker info >/dev/null 2>&1`), exiting non-zero with a
   `print_error` naming Docker as what `wrangler deploy` needs to build the
   image — exempt under `--dry-run` for the same reason credentials are. Keep
   the credentials check **first**: a missing token must be reported before a
   missing Docker.
5. **`skills/cloudflare-containers/SKILL.md`** — the router, frontmatter in the
   workers-ssr sibling's exact shape (`name: cloudflare-containers`,
   `version: 0.1.0`, `category: development`, `description`, `license: MIT`,
   `allowed-tools`), model-invocable, not paths-scoped. The "read one, not all"
   table with **eight** rows.
6. **`skills/cloudflare-containers/references/`** — the eight files of B9:
   - `pick-and-trade.md` — Containers over Workers alone (when the sandbox is
     not enough), over Cloud Run or GKE (cite the GCP packs by path — one
     provider vs two), over a Durable Object alone (cite U2's pack); the
     instead-of rule (B4) restated in one sentence with the reason; when
     Containers is the wrong answer (a request/response API that fits a Worker;
     a long-running daemon with no Worker front).
   - `service-doctrine.md` — the container class and its Durable Object, the
     `containers` block and its fields as stated, instance types and limits, the
     sleep/wake lifecycle and `sleepAfter`, port and health endpoint conventions
     inside the image, environment variables and secrets into the container
     (cite the provider's secrets doctrine; the plan-D Secrets Store pack later
     — pointer to the provider's scope), logs and exec as stated.
   - `cost-shape.md` — the pricing dimensions (vCPU-seconds, memory, disk,
     egress, per instance type) as Context7 states them today, the
     sleep-when-idle note, and that image storage is billed as stated; cite the
     provider's cost-doctrine.
   - `identity-shape.md` — the API-token permissions a deploy needs for Workers
     **and** Containers (verified names), the image registry credential as
     handled by `wrangler deploy`, the binding as runtime identity, pointer to
     the provider's identity-and-iam (B12).
   - `local-dev.md` — `wrangler dev` with containers (Docker required, how the
     image is built locally, the fidelity trap that local sleep/wake differs),
     `--remote`, resetting local state; pointer to the provider's
     local-development-map row.
   - `artifact.md` — the artifact contract: the Dockerfile, the image built by
     `wrangler deploy`, Cloudflare's registry and image tagging as stated, image
     size limits as stated, multi-stage builds as judgment, what makes an image
     deployable (the port, the health endpoint, no baked secrets).
   - `pipeline.md` — CI runs `p:<id>:deploy`; the workflow file is the repo's
     (cite the charter fence by path); what the runner needs (Docker, the two
     credentials from the secrets provider); rollback as stated
     (`wrangler rollback` or redeploy of a previous tag — verify); a preview
     deployment is a separate Worker name (parked `p:<id>:preview` — do not ship
     it).
   - `health.md` — the doctrine: the container's own health endpoint, the
     Worker's readiness path forwarding to it, the cold-start window and how a
     probe distinguishes "sleeping" from "dead", what a green probe does not
     prove. `task: n/a` — no task is shipped (B11). Each reference individually
     researched against Context7 and cited by URL.
7. **`plugins/stackgen/stacks/bundles/cloudflare-containers.md`** — frontmatter
   exactly: `name: Cloudflare Containers`, `axis: deploy`,
   `kind: cloud-provider`, `components:` `cloud-provider/cloudflare@0.1.0` and
   `cloud-service/containers@0.1.0`, `artifact: container-image`; no
   `platforms:`, no `unconditional:`. Body in the `cloudflare-workers-ssr.md`
   register: a heading `# Deploy — Cloudflare Containers`, the composition and
   why provider + service only (mirroring `gcp-cloud-run.md`), what pinning it
   gives a project (the `wrangler.jsonc`, the deploy task), **the instead-of
   paragraph** (B4: pinned instead of `cloudflare-workers-ssr`, never beside it,
   because both ship the root `wrangler.jsonc`; a Containers project is a
   Workers project and this config is complete), and one sentence that
   `cloudflare-zero-trust` still composes beside it as it does beside the other
   hosting pins.

## Verification

- `ls plugins/stackgen/stacks/cloud-service/containers/skills/cloudflare-containers/references/ | wc -l`
  is 8, and the names are exactly B9's eight.
- `find plugins/stackgen/stacks/cloud-service/containers/config -type f | sort`
  is exactly `config/.config/mise/tasks/p/_project/deploy` and
  `config/wrangler.jsonc`.
- `find plugins/stackgen/stacks/cloud-service/containers/config -type f -path '*/tasks/*' ! -perm -u+x`
  is empty; the task's first line is `#!/usr/bin/env bash`.
- Strip comments from `config/wrangler.jsonc` and parse it as JSON: valid, with
  `main`, `compatibility_date`, `containers[0].class_name`,
  `containers[0].image`, `containers[0].max_instances`,
  `durable_objects.bindings[0].class_name` equal to the container's, and a
  `migrations` entry present.
- `grep -n '^category: compute$'`, `grep -n '^axis: deploy$'` and
  `grep -n '^artifact: container-image$'` on `pack.yaml` each hit once;
  `grep -c '^capability:' pack.yaml` is 0 and the comment is present.
- `grep -n '^artifact: container-image$' plugins/stackgen/stacks/bundles/cloudflare-containers.md`
  hits once; `grep -c 'instead of' …/cloudflare-containers.md` ≥ 1 and the same
  file names `cloudflare-workers-ssr`.
- `mise run plugins:check` exits 0 (rule 11's seven assertions over your
  `config/` tier; rule 4 on `SKILL.md`; rule 12 vocabulary).
- `mise run plugins:shellcheck` exits 0 (your deploy task is in its walk, under
  `shellcheck -x -s bash -e SC2034 -e SC2154 -P <pack>/config` and
  `shfmt -d -i 2 -ci`).
- `mise run plugins:inventory --check` **fails** with a diff that is exactly
  your new pack row and bundle row — expected; do not regenerate (U7's).
- `grep -rn "95octane\|virajp\|claude-plugins\|<account" plugins/stackgen/stacks/cloud-service/containers plugins/stackgen/stacks/bundles/cloudflare-containers.md`
  is empty.
- Every reference contains at least one `developers.cloudflare.com` URL.

## Guardrails

- Do not edit `cloud-provider/cloudflare/**` (U1's), `workers-ssr/**` or
  `workers-static-assets/**` (read-only siblings), `assets/**`, any other pack,
  any other bundle, any doc, `inventory.md`, `plugin.json`,
  `scripts/src/check.ts`.
- Do not add a `deploy-target/container-image` component to the bundle (B2). Do
  not add a CI workflow file under `config/.github/` — rule 11 refuses it and
  the deploy task is what CI runs. Do not ship a health task or a preview task
  (B11; parked).
- Do not create a ninth reference (B9). Do not name a mise task this pack does
  not ship beyond `p:<id>:deploy` (B11).
- Do not restate the credential names' issuance rule or the account-level cost
  shape — cite the provider (B12). The two environment-variable names appear in
  the task and its comment exactly as the sibling writes them, and nowhere else
  new.
- `plugins/**/*.md` is not dprint-formatted; `config/` is excluded from this
  repo's dprint entirely — format payload files by hand and never with this
  repo's `code:format`. `shfmt -d -i 2 -ci` is the shell formatter that must
  pass.
- `cat` is aliased to `bat` — Write/Edit, never heredocs. A pipe containing
  `npm` is rewritten to `pnpm` by a hook — write the `npx wrangler` fallback
  line with Write and check the file after.
- Strict-YAML frontmatter: a rejected `SKILL.md` is dropped silently — no tabs,
  quoted strings where a colon appears in a value.
- No absolute paths, repo names, account ids, domains or real image names in
  shipped files.
- Never run `git checkout`, `git restore`, `git stash` or a formatter `--fix`
  outside your owned paths.

## Commit

`feat(stackgen): add the Containers pack — a Worker-fronted container image with wrangler.jsonc and a deploy overlay — and the cloudflare-containers bundle`
— written by the orchestrator after the wave gate, not by the unit.
