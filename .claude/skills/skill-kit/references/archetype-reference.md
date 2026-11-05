# Reference

Examples: `cloudflare-d1`, `gcp-cloud-run`, `fnox`, `postgres`. Add `paths` only
if the skill owns a config file.

| Section               | Holds                                              |
| --------------------- | -------------------------------------------------- |
| Title line            | The purpose, in 1–2 lines                          |
| API boundary          | One line: the API surface is looked up at use time |
| Routing               | Table: Doing, Read, Loads                          |
| Rules that don't wait | At most 3, each with a reason                      |

`metadata.subtype` fixes the topic files. Write an `n/a` stub with a reason
where a topic does not apply.

| Subtype                        | Topic files                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| cloud-service                  | `pick-and-trade`, `service-doctrine`, `cost-shape`, `identity-shape`, `local-dev`            |
| capability-provider, datastore | `pick-and-trade`, `contract-satisfaction`, `cost-shape`, `access-shape`, `local-stack`       |
| cloud-provider                 | `identity-and-iam`, `networking-and-private-plane`, `cost-doctrine`, `local-development-map` |
| ci-system, deploy-target       | No fixed set yet                                                                             |

- Cite a source URL in each reference — the reader can examine the claim.
- Put an as-of date on each limit, price and quota — these values change.
