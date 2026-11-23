# Packs

Packs — the dispatch rule's preferred, pre-created path, one pack per
**component** — live here in the shape `../assets/pack-format.md` defines
(`<type>/<slug>/pack.yaml` + prose + optional skills/agents).

**Knowledge packs — the kinds this tree holds.** `app-framework/` (Flutter,
SwiftUI, Compose: the SDK that owns the build), `framework/` (Effect, Astro,
the Agents SDK, plain HTML, Android), `datastore/` (Postgres),
`capability-provider/` (the flavour half of a capability: identity,
telemetry, workflow, secrets, audit), `ci-system/` (GitHub Actions),
`cloud-provider/` and `cloud-service/` (GCP and Cloudflare, one component per
service), `deploy-target/` (the container image) and `stylesheet/` (Tailwind
CSS, StyleX, plain CSS). Each carries judgment — conventions, skills, the
neutral contracts in `../assets/contracts/` it is judged against — and no
toolchain: a pack's tool pins, gates, LSP servers and generic tasks are
bootstrap's. A pack's `config/` payload is its `p/_project/` tasks and the
files a deploy pack owns; its test tasks are bootstrap's tool parts.

**Bundles — `bundles/`, the recorded compositions users actually pick.** A
bundle lists the bootstrap tools it needs under `tools:`, by name and with no
version, and its knowledge packs under `packs:`, as
`<type>/<slug>@<version>` refs that mix shipped packs with `@generated` ones
researched on first fetch. Tool knowledge is never listed: it follows the
tools. A component answers *what is TypeScript*; a bundle answers *what is a
TypeScript service*, and the menu lists bundles only.

**Tool knowledge — `../tools/`.** One entry per former tool pack, keyed by the
bootstrap tools its `tool.yaml` names: the languages (TypeScript, Kotlin,
Swift, Markdown, Bash), the package managers (pnpm, Gradle, pub, SwiftPM, uv)
and the gates meaningful for one toolchain (tsconfig, ESLint, ktlint, detekt,
swift-format, SwiftLint, analysis_options, Ruff). An entry carries
`conventions.md`, its skills and, for pnpm, a hook; it lands where a project
links, or a bundle names, one of its tools, and an entry naming no tool lands
in every repo.

**Design tools — `../design-tools/`.** The three import roles are generic
skills at fixed names — `design-import-screens`,
`design-import-design-system`, `design-import-conversations` — that read the
named project's `design` value and follow that tool's reference. Each tool
folder (`claude-code`, `lovable`, `stitch`) holds its `tool.yaml`,
`conventions.md`, one `references/<role>.md` per role and any skill only that
tool has, such as `claude-code`'s `design-session`; all of it installs into
`vwf-tools`.

**The inventory is [`inventory.md`](inventory.md)** — generated from this tree,
`../tools/` and `../design-tools/` by `mise run p:plugins:inventory`, never
typed by hand, and guarded by `--check` in pre-commit and CI.
