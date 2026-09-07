# Containers — identity shape

The least-privilege grant this service needs. The account-side model —
account-owned scoped tokens over the Global API Key, one identity per
workload, why the roles are broader than they look, and the privilege
review that catches what accumulates — is the `cloudflare` skill's
identity and IAM reference, which this cites and does not restate.

**The deploy credential is the Workers credential, and the registry is
not a second one.** That is the whole surprise here, and it points the
opposite way from every other container platform: there is no registry
login to issue, store or rotate.

## The deploy credential

**An account-owned API token authorized to edit Workers on the one
account.** Not a user-owned token, which dies with the user's membership
and turns an ordinary departure into a pipeline outage. Not the Global API
Key, which carries the whole account and cannot be narrowed.

Cloudflare's own CI guidance for deploying a Worker names the
**"Edit Cloudflare Workers"** permission policy, scoped to the specific
accounts and zone resources the deploy needs
([GitHub Actions authentication](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)).
A deploy that binds a custom domain also needs the zone the hostname lives
in; as for the Workers-script sibling, **prefer creating the custom domain
once by hand and leaving the pipeline's token without zone permissions** —
the route changes approximately never, and a token that can edit DNS for a
production zone is a much larger credential than one that can replace a
deployment.

**Confirm the exact current permission names against Context7 rather than
this file.** Cloudflare renames them, a token created from a stale name
fails with an authorization error that says nothing about which permission
was missing, and Containers is new enough that its permission surface is
the most likely of the two to have moved since this was written.

## The image push carries no extra credential

`wrangler deploy` builds the image with the local Docker daemon and pushes
it to a Cloudflare-managed registry, **authenticating that push itself**
([Image management](https://developers.cloudflare.com/containers/platform-details/image-management/)).
There is no `docker login`, no registry service account and no pull secret
in the deployment.

Two rules follow:

- **Do not invent registry credentials for CI.** A pipeline that stores
  one has either pointed at a registry this stack does not use or has
  copied a recipe from another platform. What the runner needs is the
  token and a Docker daemon, and nothing else.
- **Pulling from an external registry is a different arrangement with a
  different credential story.** Local development can pull from Docker
  Hub, ECR or Artifact Registry
  ([Containers](https://developers.cloudflare.com/containers/)), and the
  moment an image comes from somewhere the platform does not own, the
  question of who may pull it comes back. This pack ships a Dockerfile
  path for exactly that reason.

## The two environment variables

The names, the `GLB_` prefix the secrets convention gives them, why the
account id is injected like a secret without being one, and why
`wrangler login` is not the pipeline's path are the provider's identity
and IAM reference and this pack's `conventions.md`. They are stated in one
place and cited from here rather than repeated.

## The container has no Cloudflare identity, and must not be given one

**Whatever the process reaches, it reaches with that system's own
credential** — a datastore, an API, a third-party service — passed in from
the Worker at runtime, never baked into the image and never a Cloudflare
token. A deploy token inside the container is a credential that can
redeploy the thing running it, which is the one grant this shape must
never hand out.

Three rules follow, and each is easy to get wrong in the direction that
looks convenient:

- **A secret in the image is a secret in every deployment of that image**,
  including the tag that stays in the registry as a rollback target and
  including any environment that pulls it. Image layers are not a secret
  store, and `image_vars` are **build** variables — present when the image
  was made, and outliving the build — so they are not one either
  ([Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)).
- **The Worker is the boundary.** It holds the secrets and hands the
  container the narrowest subset that container's job needs. Passing the
  whole environment through because it is easier makes the container's
  blast radius equal to the Worker's.
- **A container instance is not a security boundary between tenants by
  default.** Instances are addressed by id, so *the Worker's id choice* is
  what separates one tenant's instance from another's — application logic,
  reviewed as such. A bug that picks the wrong id is a data-exposure bug,
  not a routing bug.

## What has no identity at all

**The image in the registry.** It is an artifact of the account, reachable
by anything on the account that can deploy. Separation between what
staging may run and what production may run is a tagging discipline
enforced by the pipeline, not a permission — see [pipeline](pipeline.md).

## Separation between environments

A production deployment and a staging deployment are two Workers on one
account, so one token that can edit Workers can publish to both. Where
that is not acceptable, the answer is **a separate account**, not a
cleverer token — account scope is the floor, which is the provider
doctrine's point and applies here unchanged.

The sharper version is the runtime one: two Workers on one account can be
handed the same downstream credentials by accident, and a staging front
end pointed at production data is the usual way it happens.
