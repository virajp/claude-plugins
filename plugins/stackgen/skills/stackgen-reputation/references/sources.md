# Sources

Every endpoint `stackgen-reputation` fetches, one table per source: the path
pattern, the request, the response fields read, and the Context7 library id
the row was verified against. **No row here was typed from memory** — each
path and field was read back from Context7 (`resolve-library-id` →
`query-docs`) before it was written, and a source Context7 could not confirm
is not here; the signal it would have carried is `unavailable` in
`signals.md`. Where a first-party source did not document a field and a
third-party client's documentation did, the row says so, and names the
third-party id.

Every read path is **keyless**. Per source, the *unreachable* note says what
the skill does when the source will not answer: always
`UNRESOLVED: <source> unreachable for <name>` on that name's row, never a
guess. The one response that is not "unreachable" is a **404 on the name
itself**, which is the *exists* signal answering.

Field names are written as the verified documentation spells them. deps.dev
documents its shape as protobuf definitions (`published_at`); read the JSON
field that matches case-insensitively.

## `depsdev` — deps.dev

Base `https://api.deps.dev`. One surface across npm and PyPI (also Go, Cargo,
Maven, NuGet, RubyGems, which this skill does not yet address) for versions,
publish dates, deprecation, advisories, provenance and the source project's
Scorecard. Verified against `/google/deps.dev`.

| Endpoint                                                    | Request                                                                   | Fields read                                                                                                                                                      | Context7 id       |
| ----------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `/v3/systems/{system}/packages/{name}`                      | GET; `system` is `npm` or `pypi`; `name` percent-encoded (`%40scope%2Fpkg`) | `versions[]` — `version_key.version`, `published_at`, `is_default`, `is_deprecated`, `deprecated_reason`                                                            | `/google/deps.dev` |
| `/v3/systems/{system}/packages/{name}/versions/{version}`   | GET                                                                       | `published_at`, `is_deprecated`, `advisory_keys[].id`, `slsa_provenances[]` (`source_repository`, `verified`), `attestations[]` (`type`, `verified`), `related_projects[].project_key.id` | `/google/deps.dev` |
| `/v3/projects/{project_key.id}`                             | GET; id is `github.com/owner/repo` (or gitlab, bitbucket), percent-encoded | `stars_count`, `scorecard.overall_score`, `scorecard.date`                                                                                                        | `/google/deps.dev` |
| `/v3/advisories/{advisory_key.id}`                          | GET; an OSV id from `advisory_keys`                                       | `cvss3_score`, `aliases[]`, `title`                                                                                                                              | `/google/deps.dev` |

- **Auth:** none. Caching is permitted under the Google API terms; this skill
  does not cache anyway.
- **Rate limit:** enforced, unspecified; over the limit is a `429`. The skill
  does not retry — a `429` is *unreachable*.
- **Unreachable** unresolves: exists (npm, pypi), first-publish age,
  latest-publish age, deprecated, advisories on version, provenance,
  Scorecard. The package endpoint is the one that says whether the name
  exists at all, so with it down every package signal is unresolved, not
  only its own.
- **Every call is a plain GET** with no header and no body, which is all
  `WebFetch` sends; that is why the advisory list is read here rather than
  from OSV's query endpoint.
- **Which version is default:** the entry whose `is_default` is `true`. The
  earliest and latest `published_at` across `versions[]` are the two age
  signals.

## `osv` — OSV.dev

Advisory detail by id. Verified against `/google/osv.dev`. OSV's query-by-
package-and-version endpoint is a POST with a JSON body, which `WebFetch`
cannot send, so it is **not** here: the ids come from `depsdev`'s version
endpoint (`advisory_keys`), which answers to a plain GET, and this endpoint
fills in each id.

| Endpoint                            | Request                                                        | Fields read                                                                                                            | Context7 id      |
| ----------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `https://api.osv.dev/v1/vulns/{id}` | GET; the id from `depsdev` `advisory_keys`, **case exact** (`GHSA-…`, not `ghsa-…`) | `id`, `summary`, `affected[].ranges[].events[].fixed`, `affected[].ecosystem_specific.severity` | `/google/osv.dev` |

- **Auth:** none.
- **Rate limit:** none documented.
- **The version match is deps.dev's**, not OSV's: `advisory_keys` on the
  version endpoint lists the advisories that affect *that* version, which is
  what makes a hit unpatched at the pin. This endpoint is read for the
  `fixed` event and the severity word only.
- **Severity:** the number the threshold reads is `depsdev`'s `cvss3_score`
  for the same id; `ecosystem_specific.severity` from this endpoint is the
  fallback word where deps.dev has no score for it.
- **Unreachable** unresolves: advisories on version — **only when it is the
  deciding input.** An advisory id whose `depsdev` record carries a
  `cvss3_score` is decided by that score, and OSV being down leaves the hit
  scored as written (the `fixed` event is detail, not a threshold). An
  advisory id with **no** `cvss3_score` is decided by the severity word this
  endpoint carries, so with OSV down that name's row is
  `UNRESOLVED: osv unreachable for <name>` — never "no severity, so warn",
  which would be a verdict inferred about an advisory that may be `HIGH`.

## `npm-registry` — the npm registry

The package document. Verified against `/npm/cli` for the document and its
`dist-tags`, `versions` and `time` keys; the `maintainers` key is documented
by a third-party client, `/ofershap/mcp-server-npm`, reading the same
document.

| Endpoint                              | Request                                                       | Fields read                                                                                | Context7 id                                 |
| ------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `https://registry.npmjs.org/<name>`   | GET; a scoped name is written `@scope%2Fpkg`                  | `dist-tags.latest`, `versions` (keys), `time.<version>`                                    | `/npm/cli`                                  |
| the same document                     | —                                                             | `maintainers[]` (length)                                                                   | `/ofershap/mcp-server-npm` (third-party)    |

- **Auth:** none for a public package.
- **Rate limit:** none documented.
- **Unreachable** unresolves: maintainer count. Existence and dates come from
  `depsdev`, so this source down leaves those standing.

## `npm-downloads` — the npm download counts API

Verified against `/ofershap/mcp-server-npm` (third-party) — npm's own
documentation on Context7 does not describe this API, so the row stands on
the client's documentation of the URL it fetches and the shape it reads.

| Endpoint                                                          | Request                                     | Fields read                                                      | Context7 id                              |
| ----------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| `https://api.npmjs.org/downloads/range/<period>/<name>`           | GET; `period` is `last-week` or `last-month` | the daily entries — one per day, each a date and a count; summed | `/ofershap/mcp-server-npm` (third-party) |

- **Auth:** none.
- **Rate limit:** none documented.
- **The weekly figure** is the sum of the `last-week` range's daily entries.
- **Unreachable** unresolves: downloads (npm), near-name (npm) — the latter
  needs the same endpoint for every candidate.

## `pypi` — PyPI's JSON API

Verified against `/pypi/warehouse`.

| Endpoint                                             | Request | Fields read                                                                                                                                  | Context7 id       |
| ---------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `https://pypi.org/pypi/<project>/json`               | GET     | `info.version`, `info.yanked`, `releases.<version>[]` (`upload_time_iso_8601`, `yanked`), `vulnerabilities[]` (`id`, `fixed_in`, `withdrawn`) | `/pypi/warehouse` |
| `https://pypi.org/pypi/<project>/<version>/json`     | GET     | `info.yanked`, `info.yanked_reason`, `urls[]`, `vulnerabilities[]`, `ownership.roles[]` where present                                       | `/pypi/warehouse` |

- **Auth:** none.
- **Rate limit:** none documented.
- **Downloads** in this document are `-1` by design (the doc marks the key
  deprecated) — never read them; PyPI downloads are `unavailable`.
- **`vulnerabilities[]`** is PyPI's mirror of OSV; the skill takes its
  advisory ids from `depsdev` and uses this list only to cross-check
  `fixed_in` when `osv` returned no `fixed` event for a hit.
- **Unreachable** unresolves: yanked, maintainer count (pypi). Existence,
  dates, deprecation and advisories come from `depsdev` and `osv`.

## `pubdev` — pub.dev

Verified against `/websites/pub_dev_help`. Only the two metadata endpoints
below were confirmed; the package-listing endpoint (versions, publish dates,
the discontinued flag) was not, which is why those pub signals are
`unavailable`.

| Endpoint                                           | Request | Fields read                                                  | Context7 id             |
| -------------------------------------------------- | ------- | ------------------------------------------------------------ | ----------------------- |
| `https://pub.dev/api/packages/<package>/score`     | GET     | `downloadCount30Days`, `likeCount`, `grantedPoints`, `maxPoints` | `/websites/pub_dev_help` |
| `https://pub.dev/api/packages/<package>/publisher` | GET     | `publisherId` (string or `null`)                             | `/websites/pub_dev_help` |

- **Auth:** none. The docs ask that responses be cached for 120 seconds;
  this skill fetches once per name per run and caches nothing across runs.
- **Rate limit:** none documented.
- **Existence** for pub is the score endpoint answering `200`; a `404` is the
  *exists* signal blocking.
- **Unreachable** unresolves: every pub signal.

## `github` — GitHub's REST API

For an action's repository. Verified against `/websites/github_en_rest` for
the paths and the rate-limit rules, and against the OpenAPI description
`/openapi/raw_githubusercontent_github_rest-api-description_main_descriptions_api_github_com_api_github_com_json`
for the response fields (the repository object's `archived`, `disabled`,
`created_at`, `pushed_at`, `stargazers_count`, and the release object's
`tag_name`, `published_at`, `prerelease`).

| Endpoint                                                  | Request                                              | Fields read                                                          | Context7 id                                                  |
| --------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------ |
| `https://api.github.com/repos/{owner}/{repo}`             | GET                                                  | `archived`, `disabled`, `created_at`, `pushed_at`, `stargazers_count` | `/websites/github_en_rest` (path); the OpenAPI id (fields)  |
| `https://api.github.com/repos/{owner}/{repo}/releases/latest` | GET                                              | `tag_name`, `published_at`, `prerelease`; `404` means no release     | `/websites/github_en_rest`; the OpenAPI id (fields)          |
| `https://api.github.com/repos/{owner}/{repo}/git/ref/tags/{tag}` | GET, for a tag ref only                       | `200` or `404`; `object.sha`                                         | `/websites/github_en_rest`                                   |

- **Auth:** none. The skill sends no token: a token is a key, and the ruling
  is keyless.
- **Rate limit:** unauthenticated requests are **60 per hour per IP**.
  Exceeding it returns `403` or `429` with `x-ratelimit-remaining: 0` and an
  `x-ratelimit-reset` epoch; retrying before that is what gets an IP banned.
  The skill does not wait and does not retry: a rate-limited response is
  *unreachable*, and every action name still to be checked in that run
  unresolves on the same line. Three calls per action means a run over
  twenty actions cannot finish inside the window, and says so rather than
  trickling.
- **Unreachable** unresolves: every action signal except *ref is a tag, not
  a SHA*, which is syntactic.

## `dockerhub` — the Docker Hub API

For an image's existence, on the `docker.io` host only. Verified against
`/docker/docs`. The OCI distribution API every registry speaks needs a
`HEAD`, a bearer token and an `Authorization` header, none of which
`WebFetch` can send — so it is **not** here, and an image on any other host
(`ghcr.io` included) has no existence signal; see *Not verified* below.

| Endpoint                                                                      | Request                                                                                     | Fields read                                        | Context7 id    |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------- |
| `https://hub.docker.com/v2/repositories/<namespace>/<repository>/tags?page_size=100` | GET; `namespace` and `repository` are the two path segments after `docker.io/` in the name | `results[].name` — the tag is present or not; `next` — the next page's URL, or `null` | `/docker/docs` |

- **Auth:** none for a public repository — the verified script fetches it
  with no credentials.
- **Rate limit:** Docker Hub's abuse limit, "in the order of thousands of
  requests per minute" per IP, answers `429`; a `429` is *unreachable*.
- **Pagination:** follow `next` until `null`; the tag exists if any page
  lists it. A repository with no page at all (`404`) does not exist, which
  is the *exists* signal blocking.
- **The name's own spelling** supplies both path segments — an official
  image written `docker.io/library/nginx` reads `library` and `nginx`; the
  skill adds no `library/` for a one-segment name (it refuses one, per
  the name syntax).
- **Unreachable** unresolves: tag exists (`docker.io`). *Mutable tag*
  is syntactic and stands.

## Not verified — and therefore not here

- **OSV's query endpoint** (`POST /v1/query`, a JSON body). Confirmed by
  Context7, but not a GET — `WebFetch` cannot send it. The advisory list
  comes from `depsdev` instead, with OSV's GET-by-id endpoint for detail.
- **The OCI distribution manifest check** (`HEAD /v2/<name>/manifests/<ref>`
  behind a bearer token). Confirmed by Context7 for every registry, Docker
  Hub's token realm included — and unusable for the same reason: a `HEAD`,
  a header and a token exchange. So `image:` existence is answered for
  `docker.io` alone, through the Hub API above, and is `unavailable` on
  every other host.
- **GHCR's own API.** GitHub's REST documentation on Context7 has no
  container-registry read endpoint, and the OCI flow is out; a `ghcr.io`
  image gets the syntactic *mutable tag* signal and nothing else.
- **Docker Hub's per-tag metadata** (`tag_last_pushed` and kin on the Hub
  API's tag endpoint). The tag-listing path was confirmed but not those
  fields, so an image's last-push age is `unavailable`.
- **pub.dev's package listing** (versions, publish dates, discontinued).
- **PyPI download counts** (a third-party stats service exists; the ruling's
  source list does not name it, so it was not verified).
- **OSV's `Pub` ecosystem token** and its `GIT` matching for an action's
  tag.
