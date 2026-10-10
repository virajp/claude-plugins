---
title: "stackgen plugin"
description: "The principles-driven stack materializer that implements vwf's stack-adapter contract with the dispatch rule and lands artifacts in the repo's committed .claude/ tree."
order: 2
---

The principles-driven stack materializer. stackgen implements vwf's
stack-adapter contract with one core rule — **the dispatch rule** — and one
output shape — **artifacts landing directly in the repo's committed `.claude/`
tree**, with three narrow targets beside it: the two things no repo file can
express, and the repo config a component genuinely owns. It makes a product
*executable* on stacks nobody curated, by generating project-level skills,
agents, hooks-wiring and rules from vwf's principles catalog and current
documentation, behind a reviewer gate and your consent.

Configure, not conjure: stackgen wires and documents existing tools — it never
implements a server, and it never invents a tool the ecosystem does not have.

## Install

```sh
claude plugin install stackgen@virajp-plugins
```

Independent of `vwf` at install time — but its two adapter skills exist to be
called by `/vwf:architecture`, `/vwf:setup`, `/vwf:plan` and `/vwf:execute`, so
in practice you list it in the product's roster:

```yaml
# .config/vwf.yaml
stacks: [ stackgen ] # the only stack plugin there is
```

## Components and bundles

**Components** are the atoms — the language, its package manager, each
framework, each toolchain gate, a datastore instance, a cloud service. Each is a
pack (or a generated artifact set) declaring a **type**, a finer **category**,
and the vwf **capability** token it realizes where one applies; the type and
category vocabularies are closed, in `assets/taxonomy.md`, extended
deliberately.

**Bundles** are recorded compositions of component refs —
`<type>/<slug>@<version>`, or `@generated` — never directories. Four bundle
shapes exist today: a Language-Bundle is the composition rooted at a language
component (language + package manager + framework components + toolchain gates);
a Cloud-Bundle is provider + service components; a Datastore-Bundle is
category-level doctrine + an instance component; and the standing-alone shape —
a Deploy-, Design- or **Stylesheet-Bundle**, exactly one component with no
second half.

The taxonomy splits at the existing seam: **capability tokens stay vwf's**
(`capability-vocabulary.md`); the finer **category taxonomy is stackgen's**. vwf
never learns what an ORM is; stackgen never redefines a capability — several
categories, `cdn` and `access` among them, leave their capability token
deliberately unset until vwf defines one, because a category classifies what a
component *is*, never whether a product must have one. `workspace` is unset for
a reason of its own rather than a pending decision — it is the agent's knowledge
source, not the product's runtime, so no capability is waiting on it. Which
categories those are is
[`assets/taxonomy.md`](https://github.com/virajp/claude-plugins/blob/main/plugins/stackgen/assets/taxonomy.md)'s
to say. Categories make components substitutable answers to one blueprint
capability, which is what lets stack menus become category-filtered queries
instead of per-plugin lists. Category-level doctrine is written once as curated
knowledge; instance components cite it and stay thin.

### Four bundles on one pack — the Astro example

The clearest worked example of "bundles are compositions, not directories" is
the `site` platform. Four Astro bundles serve it, all pinning the one
`framework/astro` pack and all carrying React for islands, and they differ by
which of Astro's two `output` values is set and whether an adapter is present.
`astro-ssg` carries `default: true`, so a `site` project's round preselects it;
the other three are picked deliberately:

| Bundle         | Menu name        | Renders                                                                                                             |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| `astro-ssg`    | `Astro (SSG)`    | every route at build time, no adapter, nothing per request — a marketing site, a docs build, a changelog            |
| `astro-ssr`    | `Astro (SSR)`    | every route per request, behind an adapter, so a page can read the request that asked for it                        |
| `astro-hybrid` | `Astro (Hybrid)` | prerendered by default, with the handful of routes that must read a request opting out per route                    |
| `astro-csr`    | `Astro (CSR)`    | one shell page plus a catch-all, the app itself a client-only island with its own router — a console or a dashboard |

`astro-ssr` and `astro-hybrid` also pin `framework/effect`, because Hybrid is
SSR with prerendering flipped and its on-demand routes cite the SSR bundle's
server doctrine rather than restating it. SSG and CSR have no server, so neither
does.

**The `site` platform's fifth entry is not Astro at all.** `html`, on the
`framework/html` pack, is a hand-authored HTML5 page tree with plain CSS and
ES-module JavaScript — no framework, no components, no content model. Vite
serves it in development and `vite build` writes `./dist`; a repo that wants its
tree served byte-for-byte replaces the build with
`cp -R src/. dist/ && cp -R public/. dist/` and keeps Vite for the dev server
alone, at the cost of hashing, minification, `.ts` scripts and any stylesheet
approach that needs a build plugin. `html-validate` over `src/**/*.html` is its
`test`. It carries no `default:` flag — `astro-ssg` stays what the round
preselects — and its category is `document`, a token minted for it: the build is
a bundler, not a framework. Pick it over `astro-ssg` when the site is a handful
of pages someone writes by hand, needs no content collections and no islands; a
blog, a changelog, documentation past a page or two, anything in Markdown, or
anything wanting a per-route rendering mode is one of the Astro bundles. With no
layout file, the web-head contract's layout clause is met per page: every page
carries the full head set as a checklist, the sitemap and `robots.txt` are
hand-authored under `public/`, and the site origin is one exported constant in
`vite.config.ts` that a review checks the hand-typed canonicals against. The
stylesheet axis is answered as for any site, with one rule: `plain-css` needs
nothing, `tailwindcss` uses its Vite plugin under the default build and its CLI
under the copy-only opt-out, and `stylex` needs the Vite build.

There is no output-mode field on a bundle and no per-project setting: Astro has
exactly two `output` values (`hybrid` was removed in Astro 5 and merged into
`static`), and CSR is a page shape rather than a mode, so all four are decisions
the pack's doctrine carries and each bundle pins one. **A page with no island
ships no JavaScript**, which is why React rides along in all four rather than
splitting the menu into with- and without-React pairs.

**Every one of the four ships the head.** Since `framework/astro` **0.2.0** the
pack's conventions carry a fixed `## Head` section — the title and description a
page states about itself, the canonical address, the OpenGraph and card set, the
favicon links and the manifest, `robots.txt` and the sitemap — and it lands one
file: a `p/_project/icons` task that rasterizes the whole favicon set from the
product's single source mark, installing its tools one-off rather than adding a
dependency. That is the first `config/` payload the Astro pack has ever shipped.
What it renders comes from the blueprint: each screen's Metadata block, the
product-wide text under `conventions.md`'s `#web-metadata` anchor, and the
design system's Brand assets. The `public/` files themselves — `robots.txt`, the
manifest, the rasterized icons, the social image — are written by `/vwf:execute`
from that doctrine, not landed by the pack.

**Every one of the four also carries MDX, images and layouts.** Since
`framework/astro` **0.4.0** the pack's skill routes to three more references:
MDX — when a page earns it over plain markdown, the `@astrojs/mdx` integration,
MDX inside a content collection; the image pipeline — `src/` versus `public/`,
`<Image>` and `getImage` from `astro:assets`, layout shift, and `sharp` as the
default service; and layouts and slots — the shell-versus-route split, named
slots, nesting, and layouts for collection entries. They are written once for
the pack and state each mode's difference inline — images is the one where the
four genuinely differ — so no bundle's composition changed.

**The doctrine above the pack is a contract.**
[`assets/contracts/web-head.md`](https://github.com/virajp/claude-plugins/blob/main/plugins/stackgen/assets/contracts/web-head.md)
states, provider-neutrally, what **any** web framework pack — shipped or
generated — must realize for a project declaring `site`, or `webapp` with the
`seo` capability: the head set, the icon sizes, the manifest, robots and
sitemap, and the icon task. Astro's conventions restate it by role and cite
nothing by path, which is what lets a framework pack that does not exist yet
satisfy the same bar. It sits beside the other cross-pack contracts —
`datastore`, `identity`, `local-stack`, `object-storage`, `observability`,
`orchestration`, `release-trigger`, `secrets`, `audit` and `workspace`.

**The build output is a named fact.** The `framework/astro` pack's conventions
carry a fixed `## Build output` heading stating that the build writes `./dist` —
Astro's `outDir` default — and that a deploy pack may rely on it. The two
Cloudflare deploy packs that upload an asset directory —
`cloud-service/workers-static-assets` and `cloud-service/workers-ssr` — cite
that heading from their `assets.directory`, which is what makes the seam between
the project axis and the deploy axis a written contract instead of a
coincidence. (`cloud-service/containers`, the third Cloudflare deploy pack,
ships no `assets` block at all: what it publishes is an image.) A repo that
changes `outDir` has changed that contract and has to change its deploy
configuration in the same commit; nothing detects the mismatch. The
`framework/html` pack carries the same heading, stating the same `./dist`, so
the deploy packs' citation holds for a site on either pack.

**Which deploy each pairs with.** SSG and CSR name `cloudflare-workers-static`,
the bundle they were built for — CSR flipping the host's not-found handling to
single-page-application mode so a deep link still serves the shell. SSR and
Hybrid pair with **any** supported deployment and name `cloudflare-workers-ssr`
first, then `gcp-cloud-run`, `gcp-gke` and `container-generic`; the adapter a
repo installs follows whichever pairing it picks. None of this is in frontmatter
— `artifact:` is deploy-only and the axes are pinned independently — so a bundle
names its pairing in prose and a project still pins the two axes separately.

> **`typescript-astro-react` is now `astro-ssr`.** The old slug shipped in
> `stackgen-v1.0.0` and is gone; a repo pinning it gets an unknown-slug error,
> which is the adapter refusing to guess. Re-point the `project` axis pin in
> `.config/vwf.yaml` and re-run `/vwf:doctor`. "TypeScript" left the display
> names because every one of the four pins the TypeScript language component
> anyway.

### Three stylesheet packs, on an axis of their own

How a web frontend's styles are authored is a **pin**, not something the
framework pack decides — so `astro-ssg` and an `astro-ssg-tailwind` sibling
never had to exist. Three packs answer the `stylesheet` axis, each its own
one-component bundle whose slug is the `projects.<name>.stylesheet` token:

| Bundle        | Is                                                                                   | Costs                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `tailwindcss` | utility classes generated from a token block, every style written at the call site   | markup carries the styling, nothing is type-checked, and the v4 line's CSS-first config reads no JS file |
| `stylex`      | typed style objects in the component's own language, compiled to atomic CSS at build | a build step and a bundler plugin registered in the right order; the most locked-in of the three         |
| `plain-css`   | the design system's roles as custom properties in one token module, rules in layers  | nothing checks anything, there is no deduplication, and the project must name a browser baseline         |

Each pack's `tokens.md` is required by the kind, because the mapping from the
design system's semantic roles to something a component can reference is the one
topic nothing else in the tree carries. None of them ships token **values** — a
pack shipping a palette would have replaced the product's contract with a
default — and none of them names a component library. An approach none of the
three covers takes the same `generate` door every other axis has.

## The dispatch rule

Given a bundle a project pins, stackgen resolves its composition and dispatches
**per component**:

1. **Pre-created pack first, per component.** Curated packs ship as stackgen
   assets under its `stacks/` tree — one pack per component, assets, not live
   skills, so installing stackgen floods no session with every stack's doctrine.
   A component a pack covers is **copied** from its pack into the repo — never
   generated.
2. **Generation only for what no pack covers, per uncovered component.** The
   first template fetch runs the pipeline for each uncovered component: resolve
   the **kind** and its topic bar → detect the real stack (manifests + the
   graphify graph) → one Context7 research pass per bar topic → instantiate
   vwf's principles catalog with citations → vet every concrete third-party name
   the component emits — packages, runner-invoked tools, GitHub Actions,
   container images, SwiftPM packages, Maven artifacts and Gradle plugins, and
   mise tools on any backend — through `stackgen-reputation`, one verdict per
   name (`pass`, `warn`, `block`); a **`block` halts that component** with the
   verdict table and you name the replacement, which is checked in turn — the
   generator never swaps a name silently → the `stackgen-skill-reviewer` gate
   (capped at **four rounds**, after which residuals are reported rather than
   looped forever) → the same materialized tree, the verdict table shown whole
   beside the reviewer's verdict at the dry-run consent gate. Context7 or a
   reputation source unreachable → **halt, never guess**. When the bundle root
   itself is uncovered, the pin is `generated/<technology-slug>`.

Mixed compositions are the ordinary case — a covered language beside an
uncovered framework copies the language's packs and generates only the
framework's artifact — so a later re-sync can act on one component alone.

**The full pack and bundle inventory is generated from the tree** —
[`stacks/inventory.md`](https://github.com/virajp/claude-plugins/blob/main/plugins/stackgen/stacks/inventory.md),
never typed by hand and guarded against drift in pre-commit and CI. The packs
arrived in waves, starting with `dprint`, `gitleaks`, `grype` and `pre-commit` —
the `repo-gate` kind's components — and closing with `cloud-provider`, the last
kind that had been defined but never authored against, which the `cloudflare`
and `gcp` packs filled. Along the way three packs each deleted a curated *skill*
in the same commit, because the pack plus a neutral contract carry everything
that source said — `deploy-target/container-image` with
`assets/contracts/local-stack.md`, `capability-provider/doppler` with
`assets/contracts/secrets.md` (the pack itself deleted on 2026-10-05, `fnox` the
one secrets provider left), and `ci-system/github-actions` with
`assets/contracts/release-trigger.md`. The third was the first to retire not a
skill but a **whole plugin**: `cicd` was exactly one kind wearing a manifest.

The retirement wave then took the four that were left — `typescript`, `flutter`,
`gcp` and `cloudflare` — each once its doctrine had landed as packs. That
ordering is the no-skill-lost rule: a pack is the destination that must exist
*before* a plugin retires, never a replacement the moment it lands.

**The TypeScript pack's `ux-gate`** captures each changed screen of a web
project (`site` or `webapp`) in the browser, in its default view and each pinned
state it can reach, as `<code>--<state>.png`, and returns the captures as vwf's
`renders:` list. [`/vwf:execute`](./vwf.md#vwfexecute) keeps them after the run,
and [`/vwf:mockups renders`](./vwf.md#vwfmockups) serves them. The Compose
pack's `ux-gate` returns the same list for `mobile`, `tablet`, `watch` and `tv`
— never `auto`, which it does not render — copying each Roborazzi golden it
verified. The Flutter and SwiftUI gates return no such list yet, so their
renders are not kept.

Five **framework** packs ship today, `effect`, `astro`, `cloudflare-agents`,
`html` and `android`; every other framework a bundle names is a `@generated`
ref, which is the generated path working as designed rather than a gap.
`framework/astro` arrived on 2026-09-06 as the second, and it is the pack all
four bundles in
[the Astro example](#four-bundles-on-one-pack--the-astro-example) pin.
`framework/cloudflare-agents` arrived on 2026-09-06 as the third — the
Cloudflare Agents SDK, whose `Agent` class compiles to a Durable Object — and it
is the pack the `typescript-cloudflare-agents` bundle pins. `framework/html`
arrived on 2026-09-15 as the fourth, under a category minted for it, `document`
— a hand-authored page tree whose build, if any, is a bundler rather than a
framework — and it is the pack the `html` bundle pins, the `site` platform's one
entry beside the four Astro ones. `framework/android` arrived on 2026-10-09 as
the fifth, under `meta-framework`, the nearest category to a build SDK — the
Android Gradle plugin owns the module's build as a meta-framework owns an app's
— and it is the pack the `kotlin-compose` and `android-library` bundles pin.

**Swift** arrived on 2026-09-23 as the fourth language a language-bundle is
rooted at, after TypeScript and the Markdown and Bash pair the
`claude-code-plugin` bundle composes: `swift-package`, a Swift library on the
`packages` platform, pins four new packs. `language/swift` is the root — the
12-topic doctrine, the sourcekit-lsp declaration, and `binaries: [swift]`, since
the toolchain is the host's rather than mise's and `/vwf:doctor` blocks when
`swift` is not on `PATH`. `package-manager/swiftpm` carries SwiftPM's doctrine
and lands no file, and declares where its lockfile lives — `Package.resolved` at
the root, or inside an `.xcodeproj` for an app — as a `lockfile` fact doctor's
package-manager check reads; its skill sends an app whose lockfile Xcode manages
to the `setup:deps:*` tasks rather than `swift package resolve`; no pack lands
`Package.swift`, which `swift package init` creates.
`toolchain-gate/swift-format` lands `.config/swift-format.json`, and
`toolchain-gate/swiftlint` lands `.config/swiftlint.yml` plus a
`templates/.config/mise/conf.d/swiftlint/mise.toml` that pins
`aqua:realm/SwiftLint` — rendered exact, since CI loads it. Each gate pack
supplies its own subtasks: `code:format:swift-format` and
`code:lint:swift-format`, and `code:lint:swiftlint`, which `code:format:all` and
`code:lint:all` call. Each takes the staged files the hook passes and otherwise
takes its file list from git — every file it does not ignore, read NUL-separated
and passed `./`-prefixed, so no file name is read as a flag, and a failed
`git ls-files` stops the task with an error rather than judging an empty list;
with neither a `.git` entry nor `GIT_DIR`, or no git installed, it walks the
tree instead — and skips when no Swift source is in scope. The `language/swift`
pack ships no format or lint task. Of its `setup:deps:<verb>:swift` subtasks,
`install`, `outdated` and `upgrade` run `swift package`; `cleanup` removes
`.build/`, and `audit` is a stated no-op, since SwiftPM ships no advisory
command.

**SwiftUI** followed the same day as the second `app-framework` pack, and the
first in the `native-ui` category. `app-framework/swiftui` is the root of the
`swift-swiftui` bundle, which pins it with `package-manager/swiftpm`,
`toolchain-gate/swift-format` and `toolchain-gate/swiftlint` and serves
`mobile`, `tablet`, `desktop`, `auto`, `watch`, `tv` and `spatial` from one
project — `auto` being CarPlay through the same iOS app, so it is declared
beside `mobile` and never alone. The app is a **committed Xcode project**,
created once by a person in Xcode: no pack lands the `.xcodeproj` and no
generator writes one, so the tasks call `xcodebuild` and `swift` alone. The pack
declares `swift` as a bare binary and `xcodebuild` with a **probe**,
`xcodebuild -version`, which `/vwf:doctor` runs rather than looking the name up:
a Mac with only the Command Line Tools has an `xcodebuild` on `PATH` that fails
the moment it runs. The repo pins its Xcode as `XCODE_VERSION`, an `@@` name in
the pack's `templates/.config/mise/conf.d/swiftui/mise.toml` beside the three
simulator values, rendered by
`/stackgen:tool-config pack --slug swiftui --dir <pack dir> --set xcode_version=<v> …`
and stored under `packs.swiftui` in `.config/stackgen.yaml` — a render missing
one refuses, naming the `--set` it needs. The pack declares all four in a
`values:` list, each with a `detect` command and a `question`, so
[`/vwf:setup`](./vwf.md#the-materialize-pass) reads them off this Mac and asks
only for one it cannot detect — and every task that builds checks
`xcodebuild -version` against it and fails fast. The tasks read the pins from
the environment mise exports, never from a file. A pin set in the environment or
in a gitignored `mise.local.toml` is a machine's deliberate override and is left
alone. The app's dependencies are added through Xcode and locked in the
`Package.resolved` the project keeps — a path the swiftpm pack's `lockfile` fact
names, so doctor finds it — and the swiftpm component governs only a local
package the app splits out. Goldens run through swift-snapshot-testing in a
`SnapshotTests` target under `test:golden`, on the simulator the repo pins as
`SIMULATOR_DEVICE`, `SIMULATOR_OS` and `SIMULATOR_PLATFORM` in the same
fragment, and the pack's `ux-gate` skill runs them for the pinned platform,
audits accessibility on that platform and on `desktop` — a native macOS target;
Mac Catalyst is not supported — and reports every other changed platform as a
finding that it was not run; it returns only vwf's three keys — no `renders:`
list, so its renders are not kept yet — and reports `rendered: ok` only when
some goldens were compared. Its doctrine covers the whole app-framework bar.
Beside topics 1–11 its router carries one reference per Apple platform, keyed by
the vwf token it realises — iOS and iPadOS for `mobile` and `tablet`, macOS for
`desktop`, CarPlay for `auto`, watchOS for `watch`, tvOS for `tv`, visionOS for
`spatial` — and topic 12, the wiring for Apple's core integrations: widgets and
complications, App Intents, push notifications, StoreKit and Sign in with Apple.
Its iOS reference builds a flow's declared OS-specific feature (a `features:`
entry with `scope: ios`, the Dynamic Island its worked case) behind an
`#available` guard at the smallest scope, showing the entry's declared
`fallback` wherever the guard fails and never inventing one, where it once left
device and OS features to a prose deviation. Like Flutter's, those integration
references are wiring only — setup order, platform configuration, anti-patterns
— with the API surface left to Context7 at use time. Third-party integrations
are not covered yet.

**Kotlin** arrived on 2026-10-09 as the fifth language a language-bundle is
rooted at: `kotlin-library`, a Kotlin/JVM library published as a JAR on the
`packages` platform, pins four new packs. `language/kotlin` is the root — the
12-topic doctrine, with tests on `kotlin.test` and JUnit 5,
`kotlinx-coroutines-test` and Kover — and its
`templates/.config/mise/conf.d/kotlin/` pins the JDK the Gradle wrapper and the
Kotlin Gradle plugin run on: `mise.toml` holds `java` at `temurin-25`, a Temurin
LTS line rather than `latest`, which would answer a non-LTS feature release.
Beside it, `mise.dev.toml` installs **kotlin-lsp**, JetBrains' language server,
through mise's `http:` backend from the JetBrains archive, since it publishes no
GitHub release asset — on macOS and Linux; on Windows it is installed by hand.
The compiler is the Kotlin Gradle plugin's and Gradle is the committed
wrapper's, so mise pins neither. `package-manager/gradle` carries the wrapper,
Kotlin DSL and version-catalog doctrine (`gradle/libs.versions.toml`), lands no
file and no task, and declares its lockfiles — `gradle.lockfile` at the root and
beside each module, and `settings-gradle.lockfile` — as a `lockfile` fact. The
`setup:deps:<verb>:kotlin` subtasks are the language pack's and run `./gradlew`:
`install` resolves every configuration of every project, so a graph that
disagrees with any lockfile fails; it writes lockfiles only when none exists
anywhere, and under `--frozen` refuses instead, as it does without a wrapper or
a 64-hex `distributionSha256Sum`. `upgrade` re-locks every project under
`--write-locks`, `outdated` runs the ben-manes `dependencyUpdates` task and
warns when the build lacks it, `audit` runs one advisory grype scan over every
`*gradle.lockfile`, and `cleanup` runs `./gradlew clean` and keeps the
lockfiles. `toolchain-gate/ktlint` lands `.config/ktlint.editorconfig` with the
`code:format:ktlint` and `code:lint:ktlint` subtasks, and
`toolchain-gate/detekt` lands `.config/detekt.yml` with `code:lint:detekt`,
leaving every layout rule to ktlint; each pins its tool in a mise template
rendered exact, since CI loads it — ktlint from the mise registry, detekt's CLI
through the `github:` backend. The bundle carries no Android and no Kotlin
Multiplatform.

**Android** followed the same day on those four packs, as two bundles:
`kotlin-compose`, the third `app-framework` bundle and the second under
`native-ui`, serving `mobile`, `tablet`, `watch`, `tv` and `auto` from one
Gradle project, and `android-library`, a language-bundle publishing an **AAR**
on `packages`. Both pin `framework/android` — the Android Gradle plugin, the
Android SDK, Android Lint and the emulator — and `kotlin-compose` adds
`app-framework/compose`. The android pack's
`templates/.config/mise/conf.d/android/mise.toml` pins the SDK's
**cmdline-tools** through mise's `http:` backend at an exact build, with a
sha256 per platform — a build number is no `X.Y.Z`, so the render cannot resolve
`latest` and the pin is moved by hand — and sets `ANDROID_HOME` to
`~/.local/share/android/sdk` beside four values: `COMPILE_SDK`, `MIN_SDK`,
`TARGET_SDK` and `EMULATOR_IMAGE`, the sdkmanager id without its ABI.
[`/vwf:setup`](./vwf.md#the-materialize-pass) detects each from the first module
`build.gradle.kts` that states it as a literal and asks only for one it cannot
read. `setup:deps:install:android` accepts the SDK licenses and installs
`platform-tools`, the `COMPILE_SDK` platform, the emulator and the emulator
image with this host's ABI appended; it installs no build-tools, which AGP
fetches itself. `code:lint:android` runs Android Lint. `test:e2e` runs the
instrumented Compose UI tests on a **Gradle Managed Device**, an emulator AGP
creates, boots headless and tears down: by default
`./gradlew e2eDebugAndroidTest` on the managed device `e2e`, with `--device` and
`--variant` naming another, while `mise run test:e2e -- --connected` runs
`connectedCheck` on an emulator or device already attached. The compose pack
teaches Jetpack Compose with **Material 3** as the only UI toolkit — no
Views/XML — and the app doctrine of a ViewModel exposing StateFlow, **Hilt**,
**Navigation Compose** and **Room**, with Jetpack integration references for
Hilt, Navigation Compose, Room, DataStore, Paging, WorkManager and CameraX,
wiring only like Flutter's and SwiftUI's. Its goldens are
[Roborazzi](https://github.com/takahirom/roborazzi) captures rendered on the JVM
under Robolectric, committed under `src/test/screenshots/`: `test:golden`
verifies them, `mise run test:golden -- --record` re-records them. Its `ux-gate`
runs them on a Pixel 7 qualifier for `mobile`, a medium tablet for `tablet`, a
large round Wear OS watch for `watch` and a 1080p television for `tv`, reads the
Accessibility Test Framework's checks off the same run, and returns the
`renders:` list.

The two packs then went to **0.2.0** and the bundle took every Android form
factor but XR: `watch` is Wear OS, `tv` is Android TV and Google TV, and `auto`
is Android Auto and Android Automotive OS, declared only alongside `mobile`. The
compose pack gained one platform reference each — Compose for Wear OS with tiles
and complications, Compose for TV with D-pad focus, and the Car App Library
templates `auto` draws instead of Compose — plus a Jetpack Glance widgets
reference. Roborazzi cannot render a Car App Library template, so the `ux-gate`
reports each changed `auto` screen as a finding and returns `rendered: n/a` when
every changed screen is `auto`. The android pack gained references for each form
factor's manifest features and devices, Baseline Profiles with Macrobenchmark,
Play Feature Delivery modules, and a note that instant apps are retired.
[`/vwf:setup`](./vwf.md#vwfsetup) detects `watch` from
`android.hardware.type.watch`, `tv` from `android.software.leanback`, and `auto`
from the Car App Library metadata or `android.hardware.type.automotive`. Android
XR (`spatial`) is not covered. The compose pack's phone-and-tablet reference
then gained the rule for a flow's declared Android device feature (a `features:`
entry with `scope: android:samsung` or `scope: android:oneplus`): the feature is
built behind the platform's own capability check, such as
`PackageManager.hasSystemFeature` where a vendor documents a flag, never behind
the device's maker, and the entry's declared `fallback` shows wherever the check
fails. The vendor name is a label only. The rule ships without a vendor worked
case, because no stable public API was verified for either vendor.

The `devtools` plugin then dissolved into stackgen and was deleted, closing the
marketplace at two plugins. Its mise doctrine and its file-based task library
became the `toolchain-manager/mise` pack, its four repo gates the `repo-gates`
bundle, and `/devtools:scaffold` stopped being a command at all: laying the
toolchain into a repo is a materialization now, like every other pack. Two kinds
were minted on the way — `toolchain-manager` and `workspace` — and packs gained
a fourth output target so one could write a repo's own config files. A third
kind, for the hygiene files, followed when that target widened to cover every
gate's config and the hygiene files, and `/vwf:init` arrived to lay them down.
On 2026-09-26 the mise pack and its kind retired: the `stackgen:tool-config`
skill owns the mise config now. The four gate packs, the `repo-gates` bundle and
the `repo-gate` kind followed the same day, into the same skill. On 2026-09-27
the hygiene kind, its pack and its bundle retired too: the ignore, attribute and
graph-ignore files became the skill's, and the prose files `/vwf:init`'s own
assets. On 2026-10-05 the skill moved to rendering every one of them from its
own `assets/` and `templates/` trees, a pack shipping files instead of asking
for lines, and Renovate left it.

The newest category is **`workspace`**, under `capability-provider`, minted on
2026-09-14 — and the first minted for something no blueprint chooses. The
workspace is where a team's docs, specs and tickets live, and it is the
**agent's** knowledge source rather than anything the product runs against, so
it realizes no vwf capability token and none is pending. Its neutral contract
(`assets/contracts/workspace.md`) states a permission shape rather than an
availability one: the person authenticates and not the repository, the agent's
reach stops where that person's does, and a write needs the person to ask for it
in the session. One pack realizes it — `notion` — and what it lands is **wiring
and nothing else**: an `mcp_servers:` entry the materializer writes into the
repo's own `.mcp.json` behind its own consent line, the second pack to use that
door after `claude-design`.

Before it came **`audit`**, under the same kind and minted the same day for
vwf's `audit-store` token — the append-only, access-controlled store the
operator console reads. It is deliberately *not* part of observability:
telemetry answers what the system did and may sample, drop and expire; an audit
store may do none of those, so it gets its own neutral contract
(`assets/contracts/audit.md`) and `assets/contracts/observability.md` dropped
the half-claim it used to carry, leaving a trace id as the only thing the two
share. Two packs realize it — `audit-store-d1` and `audit-store-postgres` — and
each **rides a datastore pack the product already runs** rather than composing
an engine of its own, so neither ships a migration and both declare
`local_stack: n/a`. What separates them is where the invariants are enforced:
real grants on one side, the code path holding the only binding on the other.

The newest **type** and the newest **kind** are both `stylesheet`, minted the
same day for an axis vwf had not had before — with three categories of their own
(`utility`, `compile-time`, `plain`, the three ways the token mapping can be
paid for) and three packs filling them at once. It is the first kind whose
single required artifact is named by the kind itself: every pack in it ships a
`tokens.md`.

The newest **design tool** is the terminal itself — `claude-code`, the fourth
`design-tool` pack beside `claude-design`, `lovable` and `stitch`, and the first
with a **file canvas**: there is no hosted server, no key and nothing written
into `.mcp.json`. The design system, the logo and a flow's screens are authored
in session, through the `taste-skill` plugin's design skills, into a committed
`docs/design/<project>/` — `design-system.md` in the shape that plugin authors,
`brand/logo.svg` and its variants, `screens/<flow>--<platform>/<CODE>.html` one
per pinned screen code with a stitched `index--<platform>.html`, and
`comments/<flow>--<platform>.yaml` — which the three fixed import skills read as
files. The pack ships a fourth, **user-invocable** skill beside them,
`design-session`, which runs those sessions; vwf never calls it. It declares
`taste-skill@taste-skill` as its own plugin through its `setup:ai:claude-code`
subtask, so the repo's `setup:ai:all` installs it at user scope when it is
installed at no scope that serves the repo, and every skill that needs it halts
with one plain sentence when it is absent.

The review loop is four lines. `/design-session screens <flow>` authors the
pages from the brief `/vwf:screens prompt <flow>` wrote.
`/design-session review <flow>` serves them from the repo — a single-file Node
script with no dependencies, bound to `127.0.0.1` on an ephemeral port, no auth
and no TLS, a surface for one person on one machine — prints
`URL: http://127.0.0.1:<port>/screens/<flow>--<platform>/index--<platform>.html`,
and waits while you click an element, leave a comment and press **Done**. The
session then applies every `open` comment to its screen, marks it `applied`, and
lists what changed. `/vwf:screens import <flow>` diffs the reviewed screens
against the contract, and `/vwf:feedback canvas` sees whatever is still `open`.
The comments are **committed**: one YAML list per flow page, each item
`{ id, screen, selector, text, status, created_at, applied_at }` with
`applied_at: null` while open. Its bundle is the first to carry
**`default: true`** — the optional frontmatter key that marks the entry vwf's
architecture menu preselects on that axis, highlighted and never assumed, so a
product with no opinion on its design tool lands here and one with an opinion
picks another. The menu skill copies the key onto every entry whose bundle
carries it and computes none; at most one bundle per axis **per platform**
carries it — two flagged bundles on one axis conflict when either declares no
`platforms:` list or their lists intersect — and `p:plugins:check` refuses the
pair, naming both files and the platform they share. That is what lets
`astro-ssg` be flagged too, on the `project` axis for `site` alone, without
being preselected on any other platform's round.

**stackgen is now the only stack plugin.** Its packs are the covered path, and
the menu keeps its open `generate` entry for the rest — the stack you use that
nobody wrote a pack for.

## Kinds — what can be generated, and its shape

Every pack and generation run declares a **kind**, and the kind — not the run —
decides the output's structure and scope, so generated output is deterministic
in shape while only content varies:

| Kind                  | vwf axis               | Shape                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `language-bundle`     | project (+ repo facts) | the composition rooted at a `language` component — a **12-topic bar** behind a lean router skill → on-demand references, plus paths-scoped doctrine per config file the toolchain owns (archetypes: the `language/typescript` bundle, `swift-package` rooted at `language/swift`, and `android-library` rooted at `language/kotlin` with `framework/android`)                                                                                                                                        |
| `database`            | backing                | a **6-topic bar** on the instance component — pick & trade, data-model constraints, clause-by-clause satisfaction of the neutral datastore contract *by citation*, connection & access incl. credentials, cost shape, the Docker-composed `local_stack`                                                                                                                                                                                                                                              |
| `capability-provider` | backing                | the same two halves as `database` — the neutral capability contract plus one provider component that realizes it, citing rather than restating                                                                                                                                                                                                                                                                                                                                                       |
| `cloud-provider`      | backing + deploy       | **4 provider topics** (cost, IAM, local-dev map, networking & private plane) + **5 per `cloud-service` component**, plus a **deploy-target extension** — artifact/pipeline/health — where the service's category is `compute` or `static-hosting`, the two categories that are deploy targets (archetypes: the `cloud-provider/gcp` and `cloudflare-workers-static` bundles)                                                                                                                         |
| `workspace`           | repo                   | the `package-manager` component that installs and locks the repo's members, plus a `build-orchestrator` where there is one — a **5-topic bar**, no router. The only repo-axis kind you **pick**: it is what `repo.stack.template` selects from. A single-package repo pins none, which is the kind's edge rather than a gap                                                                                                                                                                          |
| `ci-system`           | cicd                   | the **release-trigger contract** + **exactly one** `ci-system` component, a **6-topic bar** behind a router skill with one reference per system. Three layers, none duplicated: vwf's delivery-pipeline rules say what a deploy must guarantee, the contract is the recommended mechanism above any one system, the component is how that system spells it. A second CI system in one bundle is a gap, not extra coverage                                                                            |
| `app-framework`       | project                | rooted at the SDK that owns the manifest and build, carrying its languages as members with a `role` — one `primary`, any number of `platform-edge` (archetypes: the `app-framework/flutter` bundle, and `swift-swiftui` and `kotlin-compose` rooted at `app-framework/swiftui` and `app-framework/compose`)                                                                                                                                                                                          |
| `deploy-target`       | deploy                 | **one component, standing alone** — the only bundle with no second half. A **6-topic bar** covering pick & trade, the artifact, hygiene, promotion, config/secrets and health. Its discipline is a scope fence: the pipeline, the cloud and the local stack each belong to a kind that already owns them                                                                                                                                                                                             |
| `design-tool`         | design                 | one component, standing alone — a **5-topic bar** on the three imports, reach & credentials, and the naming contract. Lands three skills at **fixed names** in the repo's `.claude/`, all mandatorily model-invocable, because a user-only one is invisible to vwf rather than a smaller feature. The tool's source may be a hosted canvas or a **committed directory** the imports read as files, and a pack may ship one extra, user-invocable authoring skill beyond the three the checker counts |
| `stylesheet`          | stylesheet             | one component, standing alone — a **7-topic bar** on tokens, authoring, theming, responsive, the single integration hook, performance and (conditionally) testing. `tokens.md` is required of every pack in the kind: the mapping from the design system's semantic roles to something a component can reference is the one topic nothing else in the tree carries                                                                                                                                   |

Every kind in that table is defined; no reservations are outstanding. Three of
the seven axes — `design`, `cicd` and `stylesheet` — are **tool axes**, where
the bundle slug is the token the project config already holds, so picking from
the menu and writing the config key are one act. Kinds compose through vwf's
capability vocabulary — a language bundle says "the datastore", never a database
by name — so each stays independently re-syncable.

Each kind's structure **is a topic bar**: a closed list of topics the output
must cover, one artifact per topic, lazy-loaded — a reference behind a lean
router skill, or a paths-scoped doctrine skill on the config file it governs. A
conditional topic the detected stack makes inapplicable is stated `n/a` with
why, never silently skipped. **No artifact carries a line cap.** A skill puts
only its description in context — its body loads on activation, a reference only
when something reads it — so length is not what costs; loading is, and lazy
hanging already pays that bill. A cap would only cap depth, pressuring research
to stop early. An artifact that has outgrown one sitting is decomposed into a
router skill plus on-demand references, never trimmed.

The **composition** covers the bar, whichever components supply each topic: the
language component owns standards, errors, async, testing, build and
config/observability wiring; the package-manager component owns the manifest and
workspace/supply-chain topics; toolchain-gate components own the compiler config
and lint/format gates; and each framework component supplies one usage reference
of its own.

The **framework ruling**: generation is selection-neutral and usage-opinionated
— it never opines on *which* framework (the pin and the packs own selection),
and every usage opinion traces to a source in precedence order: the repo's own
**detected** settled pattern, then the framework's **documented recommendation**
(cited), then a **catalog entry** instantiated (cited). A genuinely split
ecosystem choice with no detection signal is presented as an **open decision**
with real options — never fake consensus. Dependencies get no reference — a line
in manifest doctrine at most; frameworks are written against, dependencies are
looked up at use time.

## The output — `.claude/` first, and three targets beside it

The output vocabulary is **closed**: skills, agents, hooks (config + scripts),
and rules, all landing in the repo's own `.claude/` tree. Three things cannot be
`.claude/` files, and each is a separate target with its own consent line rather
than something that rides the landing:

- **An MCP server** goes into the project's own `.mcp.json`. It is genuinely a
  project file — collaborators should get it — and the alternative, a curated
  registry of servers, fails on scaling before it fails on charter: a list holds
  only what someone curated, and stackgen exists for the tail nobody did.
- **A language server** cannot be expressed by any project file at all —
  `lspServers` is a plugin-manifest feature — so the one way to provide one is
  to *be* a plugin. stackgen writes a small local plugin at the fixed path
  `~/.claude/plugins/local/stackgen-lsp/`, holding the union of what every repo
  you have materialized from contributed, and **prints the two registration
  commands rather than running them**.
- **A repo's own config files** belong to the repo, not to `.claude/`. A pack
  that owns some — a language gate owns its own config file; a deploy target
  owns the root config its own tool reads, which is how
  `cloud-service/workers-static-assets`, `cloud-service/workers-ssr` and
  `cloud-service/containers` each ship a `wrangler.jsonc` and the
  `p:<id>:deploy` task beside it — declares them in a `config/` tree mirroring
  the repo root, and they land there — its subtasks among them, which the
  `…:all` gate tasks call. Its own mise folder and any file needing a value sit
  in a `templates/` tree beside it, rendered by `stackgen:tool-config`'s `pack`
  call rather than copied. The mise, dprint, taplo, pre-commit, gitleaks, grype
  and house-linter files, `.gitignore`, `.gitattributes`, `.graphifyignore`,
  `.vscode/settings.json` and `.config/claude-status.json` are no pack's:
  `stackgen:tool-config` writes them, each list a universal superset, and a pack
  adds no line to them. A pack may also mark some of its `config/` files
  **conditional**: an optional `conditional:` list in its `pack.yaml`, each
  entry a `config/` path or glob and a `when:` of one axis to one value —
  `forge` (`github`, `gitlab`) or `secrets` (a provider slug) — no shipped pack
  declares one today — evaluated by the materializer against the `answers:` map
  the caller passes beside `repo:`; a path whose answer differs is left out of
  the landing set and written to the lockfile's `skipped:` list with its
  condition, never a create and never a conflict, and an axis the caller did not
  answer reads true. That last rule is a **fallback**, not the path anything
  here takes: all three callers — `/vwf:init`, `/vwf:setup`'s materialize pass
  and `/stackgen:stackgen-sync` — pass a full map, read from the repo's own
  `.config/stackgen.yaml` (its `forge` and `secrets`, which `tool-config all`
  wrote) with the forge re-read live from the repo's `origin`. A pack's
  `skipped:` rows live and die with its `entries:`, so removing or un-pinning
  the pack drops them too. Everything else goes under `.config/`: a `config/`
  tree landing a root path outside the **landable** tier of the fixed allowlist
  is a pack authoring error the materializer refuses — that list also names the
  root files vwf itself writes, `CLAUDE.md` and `mempalace.yaml`, which may sit
  at a shaped root and which no pack may land. Two **directories** are
  allowlisted at that root, `.config/` and `.github/`, and a CI workflow inside
  the second is refused outright. Mode is preserved, because a task file
  arriving without its exec bit fails as an *unknown task* rather than as a
  permission error.

The need still travels as `language_facts` in the template payload for
`/vwf:doctor` to verify; the local plugin is what actually provides the server.
Its scope is `user`, so **your collaborators get none of it** — a teammate's
language server is their machine's business, the same line your editor already
draws, and what user scope buys is one registration serving every repo instead
of a per-repo obligation nobody maintains. What makes that safe is the
`extensionToLanguage` map every generated declaration must carry: a repo with no
matching files never starts the server, and a declaration without a map is
forbidden outright.

```text
.claude/
├── skills/  agents/  hooks/  rules/   # the artifacts, auto-discovered
└── stackgen/                          # bookkeeping, not discovered
    ├── lock.yaml                      # one entry per path, per component
    ├── templates/<slug>.md            # payload (incl. components:) + prose
    └── citations/<component>.yaml     # sources per component, keyed by topic
```

**Repo-owned means:** committed, editable by the project, and working for every
collaborator with no plugin installed. **Three consent tiers** guard a landing:

1. The `.claude/` file set is a dry-run plan you approve — every path listed,
   nothing written unapproved.
2. **`.claude/settings.json`, `.mcp.json` and a pack's `config/` tree are never
   written without your explicit, separate consent**, each as its own line in
   the gate. A hook script can land while its wiring is declined (it stays
   inert, and the plan says so); a declined MCP wiring leaves the skills landed
   and says the tool will be unreachable; a declined config write leaves the
   skills landed and says the tasks will be absent.
3. **The local plugin gets a larger gate still** — writing outside the repo and
   registering with a user-scoped tool is a bigger act than editing a project
   file — split into two separately declinable items: the manifest write, and
   the registration. Declining the registration leaves a valid plugin directory
   nobody has installed, and prints the two commands for later.

Every target **merges, never owns**: the keys stackgen added are recorded in the
lockfile, so sync and removal touch only those, and removal of the local plugin
is **by subtraction** — another repo's contributions to the union stay, and the
directory and its registration go only when the last key does. Hook *scripts*
come only from curated packs; generation never emits an executable.

**A pack may still need repo files the materializer will not write.** The
`config/` tree is what a pack *owns*, and the fence around it is still real,
just drawn further out. Gate and provider configs came inside it on 2026-09-05,
and so did a deploy target's own config and its `p:<id>:deploy` task, the same
day; **four things stay out, enumerated rather than left to judgment** — a
language manifest and its lockfile (a manifest is the project's own declaration
of what it is), CI workflow files (a pack states which task names CI must run;
the workflow is the repo's), **a pack's editor settings** (no pack ships any),
and `CLAUDE.md` (vwf's, out of scope outright). Charters ratchet, which is why
they are a list: each file the tier absorbs makes the argument for the next one
easier, and "gate configs went in, so why not the manifest" is the argument that
list exists to answer.

The third of those was narrowed on 2026-09-06 to let each pack ship a slice of
editor settings that `/vwf:init` composed into the two `.vscode` files, and the
narrowing was **reverted on 2026-10-01**: no pack ships editor settings, init
asks no editor question and composes nothing, and the editor setup task is gone.
Since 2026-10-05 one **universal** `.vscode/settings.json` ships instead, as a
`stackgen:tool-config` asset every repo gets — whole-owned, so a hand edit is a
row you answer `keep-existing` to keep. No pack adds to it. The lines that keep
it passing the gates stay — dprint reads it as JSONC with trailing commas,
pre-commit's `check-json` hook skips `.vscode/`, and the ignore file
deliberately leaves `.vscode/` tracked.

One root file is a **shim** rather than a config: `dprint.json`, whose entire
content is `{ "extends": ".config/dprint.json" }`. That formatter's config
discovery is root-only and `--config` is its only override, so the choice was a
two-line root file or a flag every caller has to remember — the same exception
`eslint.config.mjs`, `wrangler.jsonc`, `.npmrc` and `.graphifyignore` already
are. On an existing repo `/vwf:init` **moves** a real root `dprint.json` into
`.config/` and leaves the shim in its place, telling the two apart by content
rather than by name, and says in the plan that the settings survive the move. So
a pack whose correctness depends on a repo-wide edit it genuinely does not own —
a scanner allowlist, a `.gitignore` block, a mining exclude — carries that edit
as a literal block in the reference that owns it, and ships a gate that fails
the first commit naming whichever block is missing. No pack needs one today.
`capability-provider/fnox` did until 2026-10-07, when the secrets contract
retired its encrypted mode: fnox now serves the development environment alone,
from the OS keychain or a cloud store it references, and no repo carries an
encrypted secret. Its guard hook went with the mode; a copy an earlier
materialization landed in `.claude/hooks/` is inert and may be deleted by hand.

The **lockfile** is the ownership boundary: `.claude/` also holds your own
hand-written skills, so sync diffs only what the lockfile lists — anything else
is invisible to every stackgen write path. Each entry carries the component and
source it came from (`pack/<type>/<slug>@<version>` or `generated`), which is
the grain sync acts at — one framework's bump never churns the language
component beside it. A file a pack's `templates/` rendered through
`tool-config pack` is recorded too, with `rendered: true` and **no hash**: it is
judged against a fresh render (`preview pack`), never against recorded bytes, so
sync refreshes it by re-running `pack` and removal runs `pack-remove` before
deleting it. **CLAUDE.md is vwf's domain**: stackgen never edits it, and ends a
materialization by recommending `/vwf:setup`.

`templates/<slug>.md` is what makes later fetches pure reads: frontmatter
carries every payload field (kind, axis, the `components:` refs this bundle
composes — `<type>/<slug>@<version>` or `@generated` — languages **with the
facts `/vwf:doctor` verifies** — LSP provision, mise tool, manifest, and the
optional `binaries` list of executables the stack needs that mise does not
manage, each a bare name looked up on `PATH` or a name with a `probe` command
doctor runs instead, such as Xcode's `xcodebuild` — plus the package manager's
`lockfile` paths, harness tasks and mechanisms, with `frameworks`/`capabilities`
derived from the composition), and the body is the `conventions:` prose `plan`
sizes against and `execute` writes to. That emitted-facts block is the
**materialized escape** in vwf's stack vocabulary: a language no shipped bundle
covers is still *known* when its pin carries these facts.

In a multi-repo product the target repo defaults to the current one; the caller
names a member repo to materialize there instead, as one optional `repo: <path>`
line beside the principles-catalog paths — the member's path relative to the
base repo root. vwf is what resolves it, and under `topology: multi-repo` every
vwf caller passes it. Each repo gets independent copies and its own lockfile, so
two members pinning the same slug hold two independent materializations.

## The repo baseline — mise, the gates and the hygiene files

[`/vwf:init`](./vwf.md#vwfinit) lays the baseline in two steps, and neither
fetches a bundle. It calls `/stackgen:tool-config all` with the repo's values —
the repo name, the members, the landing pair, the commit gate's scopes, whether
the repo is built with node, its forge and its secrets provider — which renders
the mise config, the gates, the hygiene config files, the editor settings and
the statusline config, then runs `MISE_ENV=dev mise run setup:all` itself and
formats and validates what it wrote. Trusting the repo's mise config is your
prerequisite, never a step either runs: `init` checks it in its survey and names
the remedy. Then it writes its own **hygiene assets** — the prose files below —
from its own tree. Nothing is recorded in `.config/vwf.yaml` for any of it —
nothing was chosen, so there is no choice to record — and tool-config writes no
lockfile record either: the values it rendered from sit in
`.config/stackgen.yaml`, and whether the repo still matches them is what a
`preview all` shows. On a multi-repo product `init` lands the baseline in every
repo it resolved, each from its own values.

It lands on every repo because a repo that has picked no stack yet still needs a
formatter, a secret scanner, a vulnerability scanner, an ignore set, and a way
to run them by name. Left to the menu, "no stack chosen" and "this repo has no
gates" would be the same state and nothing would tell them apart. None of it
needs a project axis or any stack knowledge, so all of it lands on a blank repo.

**The gates are `stackgen:tool-config`'s**, the way mise is: **dprint** the
single formatter, with **taplo** behind it for TOML, **gitleaks** the secret
scanner, **grype** the dependency vulnerability scanner, the **house linter**
(`@askviraj/linter`, eslint included), **shellcheck**, **shfmt** and
**actionlint** for the task library and the workflows, and **pre-commit** the
local gate that runs them. Until 2026-09-26 they were four packs and a
`repo-gates` bundle; their files now sit in the skill's assets, and no tool's
skill is copied into a repo. Nothing there is language-specific: a stack's own
formatter or linter is a **subtask** its pack ships, never a second gate. Each
tool lands **its own config file** under `.config/`. The hook config carries
four tool-neutral gate hooks — `format`, `lint`, `check`, `sec` — that call
`code:format:all --fix`, `code:lint:all --fix`, `code:check:all` and
`code:sec --staged`, and each `…:all` task calls every subtask beside it, so
each tool is configured once, inside its subtask. Ahead of them a
`no-dash-names` hook refuses a commit that stages any path with a file or folder
name starting with `-`, and asks you to rename it — every tool those tasks call
would read such a name as an option — and `git-config` holds the local identity
to the forge's. It also installs at `post-commit` and `post-merge`, where a
`graphify-refresh` hook — always run — calls `code:graph` to rebuild the
knowledge graph in place of graphify's own raw git hooks. Both scanners document
the same **baseline step for an existing repo**: run the scan, fix what can be
fixed — rotate a real secret, upgrade a dependency — and record what remains, a
gitleaks finding by fingerprint in the allowlist, a grype vulnerability id under
`ignore:` in `.config/grype.yaml`, written by hand with a one-line reason and an
expiry, then re-run until green. The thresholds stay where they are: a
time-boxed ignore is the temporary silence, a lowered threshold the permanent
one. The formatter also lands the root `dprint.json` shim described above, and
the hook gate lands `.config/linter.yaml`, the house linter's one config, read
by `code:lint:house`.

**Every list ships as a universal superset.** Each list a pack once appended to
carries every stack's entries, whether or not your repo uses that stack — a
pattern for a tree your repo never produces matches nothing — and a pack adds no
line to any of them:

- **dprint plugins.** markdown, YAML, JSON, the `exec` plugin that routes
  `.toml` to taplo, and every plugin a stack once asked for — `typescript`,
  `malva` (stylesheets, Astro, HTML), `markup_fmt` (Astro, HTML) and
  `dockerfile`. A plugin whose extensions your repo does not hold formats
  nothing and costs one download. Plugins are pinned by version in the URL and
  moved by hand, in dev, with `dprint config update`.
- **Excludes.** The trees a gate skips are **one exclusion set**, spelled in
  three syntaxes: the formatter's `dprint.json` and `taplo.toml` and the hook
  config's global `exclude` — `.claude`, `.git`, `graphify-out`, `build`,
  `dist`, `*.lock`, `node_modules`, `.turbo`, the `*-lock.json` and
  `*-lock.yaml` globs, `.venv`, `.build`, `.swiftpm`, `Derived`, `DerivedData`,
  `*.xcassets/`, `.gradle`, `.kotlin`, `.cxx`, `.externalNativeBuild` and
  `captures`. dprint resolves its patterns from the config's directory, so each
  entry is written twice, `../X` and `**/X`, under one `"includes": ["../**"]`.
  The toolkit's checker holds the three lists equal after normalising the syntax
  away. The secret scanner's `[allowlist] paths` is held to a **subset** of it,
  never the reverse — only generated trees, never a lockfile or authored source.
  gitleaks extends upstream's default config, which already skips `.git`,
  `node_modules` and the named lockfiles, and `.claude/` is authored source a
  scanner must scan even though no formatter touches it in a shaped repo, where
  it is machine-owned. Its entries are anchored `(^|/)`, so `\.turbo/` never
  matches a `foo.turbo.ts`.
- **Linter ignores.** The linter does not read `.gitignore`, so `linter.yaml`'s
  `ignores:` carries the generated trees — `.build`, `.cxx`, `.dart_tool`,
  `.externalNativeBuild`, `.gradle`, `.kotlin`, `.swiftpm`, `.venv`, `Derived`,
  `DerivedData`, `build`, `graphify-out` — each `**/`-prefixed.
- **Ignore lines and attributes.** `.gitignore` is a curated set in banner
  sections — macOS, editors, AI tooling, mise, secrets and env, build output,
  Node, Python, Dart and Flutter, Swift and Xcode, Gradle and Kotlin, Android,
  vwf's working notes and scratch (`docs/memory/handoff/`,
  `docs/memory/doctor/`, `docs/memory/runs/`, `docs/scratchpad/`), reports —
  never an upstream template fetched over the network. `fnox.local.toml` is in
  the secrets section, so the base names the one secrets manager that writes a
  local file. `.gitattributes` marks `*.lock`, `pnpm-lock.yaml` and
  `Package.resolved` `linguist-generated`.

**Six files carry one marker pair**, `# >>> tool-config` / `# <<< tool-config`
(`//` in dprint's JSONC): `.gitignore`, `.graphifyignore`, dprint's `excludes`,
`linter.yaml`'s `ignores`, the gitleaks allowlist and the hook config's global
`exclude`. Only the lines between the markers are rendered; **every line outside
them is yours** and survives every render — the place a repo adds an exclude, an
ignore or an allowlist entry of its own. Every other file is owned whole.

The `lint` hook is `require_serial`, so one run goes at a time — a staged list
too long for one command line still splits into sequential runs. One hook
narrows further: `trailing-whitespace` skips `.md`, because two trailing spaces
are a Markdown hard break.

**The hygiene config files are the skill's too**, since 2026-09-27:

- **`.gitignore`** keeps **written order**, never sorted, so a negation stays
  after the pattern it re-includes — `!.env.example` after `.env.*`. No lock
  file is ignored but `mise.local.lock`, which `**/mise.local.lock` covers at
  any depth: a lockfile is what makes an install reproducible. The mise lines
  cover every path mise loads a local override from, at any depth, so a
  machine-local pin never ends up in a review.
- **`.gitattributes`** is `* text=auto eol=lf`, the lockfiles, and the binaries
  as `-text -diff`; there is no graphify merge driver. It carries no marker: an
  attribute line of your own is a `write` row you answer `keep-existing` to
  keep.
- **`.graphifyignore`** holds `graphify-out/` between its markers, with vwf's
  committed trees that are not code intelligence — `docs/memory/`,
  `docs/plans/archived/`, `docs/prompts/` and `archived/` — and the AI tooling
  section of `.gitignore` ignores `graphify-out/` whole: the graph is rebuilt
  per checkout. No merge driver and no raw git hook: the commit gate's
  `graphify-refresh` hook rebuilds the graph, and `setup:precommit` strips any
  raw hook, `merge=graphify` line and `merge.graphify.*` git config an earlier
  install left.
- **`.config/git-conventional-commits.yaml`**, the commit convention, is a
  template: its scopes are your repo's `scopes`, and its changelog links render
  only when the repo has an `origin`.

Renovate is gone since 2026-10-05: no `renovate.json` lands, and no update-bot
answer reaches tool-config. `.editorconfig` lands nowhere.

**Two single files** ship to every repo beside them: `.vscode/settings.json`,
one asset every repo shares, and `.config/claude-status.json`, the statusline's
config, a template naming the project from the repo's `origin`.

**The prose files are `/vwf:init`'s own assets**: `SECURITY.md`,
`CONTRIBUTING.md`, three `.github/ISSUE_TEMPLATE/` files, the chosen `LICENSE`
on a repo init was told is public. They carry no lock record. Init lands the
issue forms only on a GitHub forge — a skipped one is listed in the plan, never
reported missing. The answers those conditions read — the forge and the secrets
provider — are **recorded** in each repo's `.config/stackgen.yaml` by the `all`
call, so the later callers judge the same conditions the same way.

**A gate scans, while hygiene declares what is not there to scan.** Ignoring a
file and allowlisting it in a scanner are two different decisions, and a secret
that is ignored is still a secret nothing ever scanned — writing them as one act
is how that gets missed. The licence texts are a set init picks one from: a repo
gets the one licence it chose, not a directory of them — and a repo init was
told is **private** gets none, since a grant to the public has no reader there.
`SECURITY.md`'s one contact slot takes the security contact as init was given it
— an advisories URL for a public repo, an email or an internal URL for a private
one — and the issue chooser's *Report a vulnerability* link takes a URL contact
or is removed for an email or a decline. `CONTRIBUTING.md` records that the
forge's default branch and the protection on `develop` and `main` are set by
`/vwf:setup`'s forge pass on GitHub and GitLab, and keeps the **by-hand** form
of both for any other forge.

**`mise`** is the toolchain manager, and the rest of this section is its
subject: how the toolchain is pinned, where env values live, and the task
library everything else runs through. It is no pack and no bundle any more: the
`stackgen:tool-config` skill writes it, below.

### `/stackgen:tool-config`

One skill owns the configuration of the tools every repo runs, whatever its
stack — mise, dprint, taplo, pre-commit, gitleaks, grype, the house linter, git,
graphify, the editor settings and the statusline config. It renders them from
two trees it ships — **`assets/`**, static files laid out as they land, copied
as they are, and **`templates/`**, files holding `@@` names, rendered from your
repo's values — and its doctrine sits in `references/<tool>.md`.

**The values file.** `.config/stackgen.yaml` holds every value a template reads,
and **the script is its only writer**: `all` writes the values its flags carry,
`pack` a pack's `--set` values, `pack-remove` drops them. A value is changed by
re-running the call that sets it, never by editing the file.

| Key                            | Written by                                        | Read as                                       |
| ------------------------------ | ------------------------------------------------- | --------------------------------------------- |
| `repo_name`                    | `all --repo-name`                                 | `REPO_NAME`                                   |
| `merge_model.develop`, `.main` | `all --merge-model-develop`, `--merge-model-main` | `MERGE_MODEL_DEVELOP`, `MERGE_MODEL_MAIN`     |
| `members`                      | `all --members`                                   | `MEMBERS`, `MEMBERS_SPACED`, `MEMBER_ENTRIES` |
| `scopes`                       | `all --scopes`                                    | `SCOPES`                                      |
| `node`, `external`             | `all --node`, `--external`                        | `NODE`, `EXTERNAL`                            |
| `forge`, `secrets`             | `all --forge`, `--secrets`                        | `FORGE`, `SECRETS`                            |
| `packs.<slug>.<key>`           | `pack --slug <slug> --set <key>=<value>`          | `<KEY>`, seen by that pack's templates alone  |

`REPO_URL` and `PROJECT_NAME` are never stored: they come from your repo's
`origin` on every render, so they cannot go stale when the remote moves. The
`…:all` tasks' subtask lists and the mise skill's task table are derived from
the rendered tree. A key left out of a call keeps what the file holds;
`--scopes` and `--members` replace the stored list whole, so pass every entry, a
retired scope included.

**The script.** The skill ships a node script, `scripts/tool-config.mjs`, with
no dependencies, run as `MISE_ENV=dev mise x -- node` on the repo's own node pin
— only the very first `all` on a repo with no mise config falls through to the
`node` on your `PATH`. It shows every change as a numbered row before it writes,
so the same call makes the same files on every run and a new repo's config needs
no model judgement. It needs `mise` on `PATH` for `all` and `upgrade`, and
refuses without it. Its output is JSON, and it never reaches outside the repo:
an absolute path, a `..` climb or a symlink leading out refuses the call.

**Two things are yours, never the script's.** The repo's mise config is
**trusted** before the call — typically its path in `trusted_config_paths` in
your global mise config, or `mise trust --all` in a repo that already has its
config; the script reads trust and never grants it, and any call on an untrusted
config is refused naming that remedy. And **every tool runs only as
`mise x -- <tool>`**, the version the repo pins, once it is installed; a tool
the call needs and the repo has not installed refuses the call before anything
is written, naming `MISE_ENV=dev mise run setup:all`.

**A call that writes** lands its files, then — on `all` alone — runs
`MISE_ENV=dev mise run setup:all`, then formats every file it wrote with the
shipped dprint config and validates the hook config with
`pre-commit validate-config` when it wrote it. How a landed line is folded is
the shipped formatter's call, and a difference in layout alone is never a row. A
formatter or validate failure puts every file back byte for byte; an untrusted
config or a failed `setup:all` on `all` leaves the files written, and re-running
the same `all` after the fix finishes the job. A successful `all` returns the
tail of `setup:all`'s output as `setup`, which the caller relays to you — a
passing `setup:all` can still warn, as it does for a hook manager you kept.

```text
/stackgen:tool-config [preview] all [--repo-name <n>] [--merge-model-develop direct|pr] [--merge-model-main direct|pr]
                      [--members <a,b>] [--scopes <a,b>] [--node true|false] [--external true|false]
                      [--forge <f>] [--secrets <s>] [--answers <id>:<answer>,…]
/stackgen:tool-config [preview] pack --slug <s> --dir <pack dir> [--set <key>=<value>]… [--answers …]
/stackgen:tool-config [preview] pack-remove --slug <s> [--answers …]
/stackgen:tool-config [preview] upgrade [--answers …]
```

- **`all`** writes the values its flags carry into `.config/stackgen.yaml`, then
  copies every asset and renders every template, then runs `setup:all` and
  formats and validates what it wrote, ending in a set-up repo. A list is
  comma-separated, no spaces. It needs a repo name, given or already stored. It
  is idempotent — a second run over an unchanged repo writes nothing and shows
  no row. [`/vwf:init`](./vwf.md#vwfinit) calls it with its answers. It also
  renders a **repo-local mise skill**, `.claude/skills/mise/SKILL.md`, which
  tells any session how to run the repo's tasks and where each config file
  lives, with a table of every task the repo defines.
- **`pack`** renders one pack's `templates/` tree into the same relative paths,
  writing its `--set` values under `packs.<slug>`, then re-renders the `…:all`
  tasks and the mise skill's table, so a subtask the pack's payload added is
  called. The materializer calls it for a pack that ships templates or a
  subtask.
- **`pack-remove`** deletes `conf.d/<slug>/` and every subtask file named for
  the pack, drops `packs.<slug>`, and re-renders the `…:all` tasks. It never
  deletes a path the skill ships itself.
- **`upgrade`** moves each exact pin a CI-loaded mise file holds forward, one
  row per pin whose latest has moved on.
- **`preview`** builds the rows the same call would show and returns them,
  writing nothing. A caller that gathers one consent for a whole plan previews
  each call, shows the rows inside its own question, then makes the real call
  with the answers.

A slug is lowercase letters, digits and `-`; `all`, `ai` and `_base` are
reserved, since each names a folder or a task the skill renders itself.

**Rows and answers.** Nothing is recorded anywhere: every call compares a fresh
render with your repo as it stands, and each file that would change is one row —
`create` (answered `ok`), `write` (the added and removed lines shown, answered
`ok` or `keep-existing`), `delete` (a file a render no longer produces, or a
pack's file on `pack-remove`) or `pin` (an exact pin `upgrade` would move). `ok`
takes the render; `keep-existing` leaves the file as it stands **for this run**
— nothing records it, so the next run that finds the same difference shows the
row again. A call that would show rows and carries no `--answers` is refused
with the rows, standing in for the preview; the answering call carries
`--answers <id>:<answer>,…`, exactly the ids the rebuilt rows carry, and
anything else — a missing id, a row changed since — refuses the whole call. A
call carrying matching answers asks nothing. A file whose `#PLACEHOLDER` slot a
pack or you filled is never overwritten or offered for deletion.

**Drift is yours to judge**, and there is no drift test in the script: a repo
has drifted when `preview all` (and `preview pack` for each pack it carries)
shows rows. None means the repo is as stackgen would shape it; each row is one
file that differs — a hand edit, a newer release, a changed value. Lines outside
a marker pair are never drift.

**Pins.** A dev-only mise file (`mise.dev.toml`) keeps `version = "latest"`: a
laptop takes what is current, under `minimum_release_age`. **A mise file CI
loads** — `.config/mise.toml`, or a `mise.toml`, `mise.ci.toml` or
`mise.test.toml` in any `conf.d/` folder — is written with every `latest`
resolved to an exact version by `mise latest <tool>` at render, save `node` and
`pnpm`, which stay `latest`: node keeps good backward compatibility. **There is
no mise lockfile**: what CI loads names every version, a pipeline installs
exactly those, and moving one forward is a diff `upgrade` offers. A pin your
file already holds exactly is kept, which is what makes a second `all` show no
row. **A tool is never added with a bare `mise use`**: it is entered into the
file of the `conf.d/` folder that owns it first, then installed with
`mise install`.

**A pack asks for nothing.** It reaches the universal files two ways, neither a
list of requests:

- **Subtasks**, in its `config/` payload, copied by the materializer:
  `.config/mise/tasks/code/{check,format,lint}/<slug>`,
  `.config/mise/tasks/setup/ai/<slug>` and
  `.config/mise/tasks/setup/deps/<verb>/<slug>`, the leaf always the pack's
  slug. Each runs its own tool's steps alone, and the `…:all` task the skill
  renders calls it — `code:lint:swiftlint`, `code:format:swift-format`,
  `code:check:uv`, `setup:deps:install:pnpm`, `setup:ai:claude-code`.
- **Templates**, in its `templates/` folder, rendered by `pack`: its own mise
  files in `.config/mise/conf.d/<slug>/` and nowhere else in `conf.d/`, plus any
  file that needs a value. A pack's own values — swiftui's `XCODE_VERSION` and
  its three simulator values — are `@@` names its templates read, stored under
  `packs.<slug>` and given with `--set`; a render missing one refuses, naming
  the `--set` it needs.
- **A `values:` list** in its `pack.yaml`, one entry per value: `name` (the
  tag's upper-snake name), `detect` (a shell command printing it, non-zero when
  it cannot tell) and `question` (asked when `detect` fails). The caller —
  `/vwf:setup`, as it lands the pack — runs `detect`, else asks, and passes each
  as `--set <name lowercased>=<value>`.

A pack never ships a file at a path the skill ships, save one replacing a
`#PLACEHOLDER` slot — fnox's `setup/secrets`. The toolkit's checker refuses a
`tool-config:` list or a `machine_env:` key in a pack's `pack.yaml`, a subtask
whose leaf is not the pack's slug, and a mise file in `config/`; it holds a
pack's `values:` list to its templates both ways — every declared name read as
an `@@` tag there, every pack-own tag declared — and refuses a malformed entry,
a repeated name, or one taking a name tool-config holds (`FORMAT` among them).
The script never commits; the caller does.

### The config split

mise config lives under `.config/`, in folders. `.config/mise.toml` holds
`min_version` and `[settings]` only; `.config/miserc.toml` holds
`env_conf_d = true`, which is what makes mise read a dotted file inside a
`conf.d/` folder for its environment alone — it must sit in a miserc file, since
`mise.toml` is read too late. Every tool, value, task and alias lives in a
folder under `.config/mise/conf.d/`. mise deep-merges the active `MISE_ENV`
files on top of the undotted ones, then the local files last of all — so each
environment file holds only deltas, never a copy.

| File                                   | Loads when             | Holds                                                             |
| -------------------------------------- | ---------------------- | ----------------------------------------------------------------- |
| `miserc.toml`                          | before the rest        | `env_conf_d = true` and nothing else                              |
| `mise.toml`                            | always                 | `min_version` and `[settings]` only                               |
| `mise/conf.d/<folder>/mise.toml`       | always                 | a folder's tools, env values, tasks and aliases                   |
| `mise/conf.d/<folder>/mise.<env>.toml` | `MISE_ENV` has `<env>` | the same, for one environment — `dev`, `ci` or `test`             |
| `mise.local.toml`, `*.local.toml`      | always, last           | this machine's overrides — **never committed**, and never shipped |

There is no root `mise.<env>.toml`. **Each folder has one owner:**

| Folder          | Owner                    | Holds                                                                |
| --------------- | ------------------------ | -------------------------------------------------------------------- |
| `_base/`        | tool-config, every repo  | the repo's values, the gate tools, the shell aliases, `tasks.init`   |
| `ai/`           | tool-config, every repo  | the agent tooling — jq, yq, mempalace, graphify — dev only           |
| `<pack slug>/`  | that pack's `templates/` | the pack's own pins, values and aliases                              |
| `<project id>/` | you                      | what one project of this repo pins — written by hand, never rendered |

mise loads folders after single files, alphabetically by name. Which of two
folders wins when both pin one tool is not documented, so **a tool is pinned in
exactly one folder**.

- **`_base/mise.toml`** — loaded everywhere, CI included. `[env]` holds
  `REPO_NAME`, `MERGE_MODEL_DEVELOP`, `MERGE_MODEL_MAIN` and `MEMBERS` (the
  member paths, space-separated). `[tasks.init]` sits here, because file-based
  tasks must be executable under `MISE_ENV=ci` too. On a **node repo** it also
  pins `node` and `pnpm`, sets `node.compile = false` and
  `npm.package_manager = "pnpm"`, and puts `node_modules/.bin` on the path.
- **`_base/mise.dev.toml`** — the laptop's: the python, pipx and uv settings and
  their three `UV_*` values, `PRE_COMMIT_HOME`, and the tools a developer needs
  and a runner does not — python, uv, pre-commit, osv-scanner, grype, gitleaks,
  dprint, taplo, shellcheck, shfmt, actionlint and the house linter. On a repo
  that is not node, `node` and `pnpm` sit here instead: the tool-config script
  runs on them. The shell aliases sit here too — `precommit`, `setup`,
  `worktrees`, and one `setup-<slug>` per member.
- **`_base/mise.ci.toml`** — on a node repo, the node-gpg workaround below.
- **`ai/mise.dev.toml`** — jq, yq, `pipx:mempalace` and `pipx:graphifyy`, the
  `MEMPALACE_*` values and `MEMPALACE_PALACE_PATH`, the one per repo. Dev only:
  a pipeline never builds the graph or the palace.

`REPO_NAME` is a literal, never derived at load time: the basename of the config
root is the **branch** name inside a linked worktree.

Selecting the environment:

- **Developers** export `MISE_ENV=dev` in their shell, so the dev toolchain and
  local env values load automatically.
- **CI/CD pipelines and production runtimes** set `MISE_ENV=ci`, so the CI/prod
  overrides apply. CI runs the tests; the gates run locally, in the hooks.
- `MISE_ENV` is a **comma list and the last entry wins**, which is what makes
  `MISE_ENV=dev,test` a delta on dev rather than a fourth full config.
- With `MISE_ENV` unset, only the undotted files load. `setup:all` refuses to
  run then, naming `MISE_ENV=dev mise run setup:all`.

**The base `[settings]` are policy**, each answering a failure people hit rather
than a preference: `all_compile = false` never builds a tool from source;
`lockfile = false`, since the pins themselves are exact where CI reads them;
`minimum_release_age = "10h"`, so a release nobody has run is not what `latest`
resolves to; `task.run_auto_install = true`, so a task's tools install before
its body; `task.timings = true` prints elapsed time after each task; and
`task.disable_spec_from_run_scripts = true` makes a task's flags come from its
`#USAGE` header alone.

**Names are shared across environments; values are split by them.** dev and CI
override the *same* keys rather than each inventing their own: a value the tasks
read in the pipeline goes in an undotted `mise.toml`, a laptop's in
`mise.dev.toml`. Never commit a secret to any of them. A value of your own
belongs in a folder of your own, which no render touches.

### CI node-gpg workaround

For a **node** repo, `_base/mise.ci.toml` sets:

```toml
[settings]
node.gpg_verify = false
```

CI runs on Linux, where mise's bundled Node release-key gpg import can fail with
"no valid OpenPGP data found". This disables **only** Node's signature check —
the tarball is still SHA256-verified — and `gpg_verify = true` stays everywhere
else.

### The task library

Once tasks grow past one-liners, drive everything through executable task files
under `.config/mise/tasks/`. mise turns nested directories into colon-separated
names: `.config/mise/tasks/code/format/all` becomes `mise run code:format:all`.
List them with `mise tasks`. Reserve `[tasks.*]` toml entries for trivial
run-strings.

**Three groups, and every task is in exactly one.** `setup:*` is bootstrap and
re-sync — what a machine runs to be able to work here at all. `code:*` is what a
*change* runs through: the quality gates and the git operations. `p:<id>:*` is
one project's own commands. The first two are a **contract** whose names are
identical on every repo, because those names are what the rest of the toolkit
invokes; `p:*` is the opposite, and every name in it is the repo's own.

**A gate or a setup step that differs by stack is an `…:all` task calling every
subtask beside it**, never one file a pack overwrites:

| `…:all` task            | Calls every                | Universal subtasks                                                         |
| ----------------------- | -------------------------- | -------------------------------------------------------------------------- |
| `code:check:all`        | `code:check:<name>`        | none                                                                       |
| `code:format:all`       | `code:format:<name>`       | `dprint`, `shell` (shfmt)                                                  |
| `code:lint:all`         | `code:lint:<name>`         | `house` (the house linter), `shell` (shellcheck), `workflows` (actionlint) |
| `setup:ai:all`          | `setup:ai:<name>`          | `base` — the workflow plugin and every upgrade                             |
| `setup:deps:<verb>:all` | `setup:deps:<verb>:<name>` | none                                                                       |

`<verb>` is `install`, `upgrade`, `outdated`, `audit` or `cleanup`. Each `…:all`
is a template listing the executable files in its folder and is **re-rendered
whenever a pack adds or removes one**. With no subtask it prints that there is
nothing to run and passes. Each passes its flags — `--fix`, `--debug`, the file
list — to every subtask, so a subtask takes the same surface. You add a step of
your own the same way, as a subtask file of your own, never by editing an
`…:all` task, which the next render rewrites.

- **`code/*` — what a change runs through.** `code:check:all`,
  `code:format:all`, `code:lint:all`, `code:sec`, `code:precommit`,
  `code:git-config`, `code:graph`, `code:worktrees`, `code:count`,
  `code:merge:develop`, `code:merge:main`, and the `code:all` aggregator
  (`check` → `format` → `lint` → `sec`). `code:all` is the one-command gate;
  `precommit`, `git-config`, `graph`, the merges and `count` are wired into the
  hooks or run by hand. The format and lint gates take an **optional file list**
  — empty meaning the whole tree — and the hooks call **them** rather than the
  tools they wrap: `format` and `lint` pass the staged filenames, `check` takes
  none, `sec` passes `--staged` and lets gitleaks read the index. `code:sec`
  needs the scanners from `_base/mise.dev.toml` — run it under the dev toolchain
  (`MISE_ENV=dev`). Its full scan skips a `.env` file through a throwaway
  overlay of the gitleaks config, for the `dir` scan alone — the shipped
  `gitleaks.toml` stays strict, so a `.env` someone stages is still caught — and
  a grype failure prints the remedy: the finding's vulnerability id under
  `ignore:` in `.config/grype.yaml` with a one-line reason. **`code:git-config`
  requires the forge identity, per repo**: the local git-config must carry
  `user.name`, `user.email` and `user.signingkey` equal to `GITHUB_USER_NAME`,
  `GITHUB_EMAIL` and `GITHUB_SIGNING_KEY` when the origin host is `github.com`
  or a subdomain of it, the `GITLAB_` twins for `gitlab.com`, and the `GIT_`
  twins for any other host or no remote — with ssh-signed commits and tags and
  no `gpg.program` or `gpg.ssh.program`. `--fix`, which the hook runs, writes
  those keys from the variables, refuses before writing anything when one is
  unset, and exits 1 after a change (*identity corrected — re-run the commit*),
  because git reads its identity before a hook runs. Export the three variables
  where the hook can see them — the global mise `[env]` block is the one place a
  GUI git client that never sources your shell profile still picks up, since the
  hook runs under `mise x`. `code:graph` rebuilds one graph at a time: a run
  finding the lock held leaves a re-run marker, and the holder rebuilds once
  more. `code:count` is a size reading rather than a metric: lines of
  **tracked** text grouped by extension.
- **`code/merge/*` — landing, with the predicates first.**
  `code:merge:develop <branch>` refuses a source that is `main` or `develop`,
  refuses a **destination branch that does not exist locally**, refuses an
  unclean tree, and runs the pre-commit safety net, **failing if it changed
  anything**. `code:merge:main` is the same sequence with one extra predicate:
  the source must be `develop`. A conflict leaves the tree mid-merge on purpose.
- **`MERGE_MODEL_DEVELOP` and `MERGE_MODEL_MAIN` — what "land it" means on each
  branch.** Two values in `_base/mise.toml`, rendered from your repo's
  `merge_model`: `MERGE_MODEL_DEVELOP`, which `code:merge:develop` reads and
  which defaults to `direct`, and `MERGE_MODEL_MAIN`, which `code:merge:main`
  reads and which defaults to `pr`. A file shaped before the pair existed still
  carries the single legacy `MERGE_MODEL`, which the merge reads in place of an
  unset value, with one warning naming it legacy. Under **`direct`** the task
  hops to the main worktree, checks out the destination, `git merge --no-ff` and
  `git push --follow-tags` — the one mode that also refuses unpushed commits on
  the source. Under **`pr`** nothing merges locally: the task pushes the branch
  with `--follow-tags` and opens a pull request through whichever forge CLI is
  on PATH (`gh` first, then `glab`), printing the branch where neither is. One
  per branch rather than one per repo, because `develop` and `main` carry
  different review policies more often than the same one.
- **`setup/*` — bootstrap & upgrade.** `setup:all` is the entrypoint — run it on
  clone and to re-sync, as `MISE_ENV=dev mise run setup:all`; it exits 1 when
  `MISE_ENV` is unset. It calls `setup:mise`, `setup:secrets`,
  `setup:external:start` (on a repo with `external: true`), `setup:deps:all`,
  `setup:precommit`, `setup:ai:all` and `setup:precommit` again in order — the
  second pass strips the raw graphify hooks and the `merge=graphify` attribute
  an installer run inside `setup:ai:all` can let back in — and stays idempotent.
  **It never upgrades or overwrites anything it did not create**: a task that
  would have to stops, names what it found and prints the by-hand command, and
  every destructive step sits behind a flag. `setup:mise` runs `mise install`,
  `mise reshim` and `mise doctor` every time and never moves a pin; a pin moves
  only through `/stackgen:tool-config upgrade`, whose rows you answer.
  `setup:precommit --update` is what runs `pre-commit autoupdate`, moving the
  hook `rev:` lines; and `setup:precommit --force` is what takes the hooks over
  from a **local** `core.hooksPath`, a `.husky/` directory or a lefthook config,
  installing with `--overwrite`. Without it `setup:precommit` warns that the
  gate config is landed but not wired, prints the unset and the install to run
  by hand plus the cleanup, installs nothing and exits 0 — so `setup:all`, and
  the `/stackgen:tool-config all` that runs it, completes on a brownfield clone
  that keeps its hook manager. A `core.hooksPath` set outside the repo's local
  git-config is named by scope with the by-hand unset; without `--force` that is
  a warning and exit 0, and under `--force` it still exits 1, since `--force`
  never edits a config outside the repo. It also strips graphify's raw git hooks
  from the repo's hooks directory before anything else. `setup:ai:all` keeps the
  machine's agent plugins current. Its universal subtask, `setup:ai:base`, first
  checks that the workflow plugin, `vwf@virajp-plugins`, is installed at
  **user** scope, or at **project** or **local** scope whose `projectPath`
  resolves to this repo's root — any of those serves the repo. Only when it is
  at none of them does it run the installer,
  `pnpx @virajp.dev/claude-plugins@latest --all`, which registers the
  marketplace and installs vwf and its dependency at **user** scope. Whether or
  not it installed anything, it then runs `claude plugin marketplace update`,
  `claude plugin update --scope <its scope> <id>` for every plugin installed at
  a scope that serves the repo, and
  `claude plugin autoremove --scope project --yes`. It **never installs at
  project scope** and never aborts on a `claude` or `pnpx` failure — each warns
  and the task goes on. A pack that needs a plugin of its own ships a
  `setup:ai:<slug>` subtask calling `ensure_plugin`, which installs it at user
  scope only when absent. The official marketplace is never added: it ships with
  Claude Code. `--all` sets up every **member**, and a member's own `--<slug>`
  sets up that one alone — each run as `setup:all` from inside the member, in a
  subshell, so the member's own mise config is the one read. The members are
  what `_scripts/helpers`' `members()` answers — the repo's submodules where
  `.gitmodules` exists, else the paths in the `MEMBERS` value — and one
  `--<slug>` flag per **member repo** is rendered from that same list, named for
  the member and never for a project id. Alias it as `setup`.
- **Nothing in the set edits a remote's settings.** The forge's default branch
  and the protection on `develop` and `main` are set by `/vwf:init`'s **forge
  pass** on GitHub and GitLab, on its own consent, through the forge CLI rather
  than a task; `CONTRIBUTING.md` keeps the by-hand form for any other forge. It
  is orthogonal to the merge tasks either way: work flows feature → `develop` →
  `main` whichever branch the forge calls default.
- **`setup/deps/*` — the package manager, and only that.** Five verbs:
  `cleanup`, `install` (which honours `--frozen`, the lockfile-strict mode CI
  uses), `upgrade`, `outdated`, `audit`, each an `…:all` calling every package
  manager pack's subtask — `setup:deps:install:pnpm`, `setup:deps:install:uv`, …
  `setup:deps:all` runs them in that order. A manager with no such verb ships a
  subtask that says so and exits 0. **The task path carries no tool name above
  the subtask**, so the contract reads the same on every stack.
- **`setup/external/*` — services, and optional.** Emulators, containers, local
  queues, under `pull` / `start` / `stop` — rendered only on a repo with
  `external: true`, each a slot until you fill it.
- **`setup/worktree`.** The lighter sibling of `setup:all` for a fresh worktree
  — submodules, `mise install` of the pinned versions, `setup:secrets`,
  `setup:deps:install:all --frozen`. Like `setup:all` it refuses an unset
  `MISE_ENV`. vwf's git-workflow probes for it by name before falling back to
  `setup:all`.
- **Slots.** `setup/secrets` and the `setup/external/*` trio carry a
  `#PLACEHOLDER` marker: the task name is the contract, the mechanism comes from
  whichever stack the repo pins. Running one prints every unfilled slot in the
  repo and **exits 0**, so `setup:all` works end to end before any stack is
  chosen. A slot stops being one by being **replaced** — a pack ships its own
  file at the same path, marker gone, as fnox does for `setup/secrets`, or you
  write your own — and no render overwrites a filled slot.
- **`_scripts/helpers`, plus siblings.** The `_scripts/` directory is
  underscore-prefixed, so mise treats it as **not a task**. `helpers` is the
  shared shell library (colors plus `print_header` / `print_subheader` /
  `print_warn` / `print_error` / `line_sep`, `members()`) that every task
  sources as its first real line. Beside it: `checks` (the merge predicates),
  `merge` (their shared body), `placeholder` (what a slot prints), `plugins`
  (`claude_available`, `plugin_installed`, `ensure_plugin`) and `helpers.mjs`,
  which mirrors the print API for a Node task.
- **`[tasks.init]`.** A toml task in `_base/mise.toml` that chmods every file
  under `.config/mise/tasks/` executable. It loads in every env, CI included;
  `setup:all` and others declare `#MISE depends=["init"]`.

**Who adds the subtasks.** `/stackgen:tool-config` lands the common contract and
the universal subtasks, and every pack with a `config/` tree adds its own beside
them: `package-manager/pnpm`, `package-manager/uv`, `language/swift`,
`language/kotlin`, `app-framework/flutter` and `app-framework/swiftui` supply
`setup:deps:<verb>:<slug>`; `toolchain-gate/ruff` supplies `code:format:ruff`
and `code:lint:ruff`, `app-framework/flutter` `code:format:flutter` and
`code:lint:flutter`, `toolchain-gate/swift-format` `code:format:swift-format`
and `code:lint:swift-format`, `toolchain-gate/swiftlint` `code:lint:swiftlint`,
`toolchain-gate/ktlint` `code:format:ktlint` and `code:lint:ktlint`,
`toolchain-gate/detekt` `code:lint:detekt`, `package-manager/pnpm`
`code:format:pnpm` (sorting `package.json`), `package-manager/uv`
`code:check:uv` (the lockfile freshness check), `design-tool/claude-code`
`setup:ai:claude-code`; `app-framework/swiftui` adds `test/golden`, each task
that builds checking `xcodebuild -version` against its `XCODE_VERSION`;
`framework/android` supplies `setup:deps:install:android` alone of the verbs,
`code:lint:android` and `test/e2e`, and `app-framework/compose` `test/golden`;
and `capability-provider/fnox` fills the `setup/secrets` slot. A pack's subtask
carries only its own tool's steps — no language pack owns another tool's. The
pnpm pack also ships a root `.npmrc` setting `ignore-scripts=true` and
`fund=false` — an install never runs a dependency's install-time code, and a
package that genuinely has to build is allowed by name in the workspace file —
plus, in its `templates/`, an `npx = "pnpm dlx"` alias, which keeps one store,
one lockfile-aware resolver and one set of registry settings. The mise base
lands first, from `/stackgen:tool-config`; composition then runs
`toolchain-gate`, then `package-manager`/`language`, then `app-framework`, then
`capability-provider`, then `cloud-provider`, then `cloud-service`, and the
lockfile records per file which component supplied it. The **deploy target goes
last** because it is the most specific thing a repo pins — a `cloud-service`
pack's root config and the `p:<id>:deploy` overlay beside it are the answer to
how this repo actually ships.

**What no pack can know comes from your values** — in the base repo and in every
member repo `/vwf:init` resolved, each from that repo's own:

- the bootstrap aggregator's **member flags** and the `setup-<slug>` **shell
  aliases** beside them, one per **member repo**, rendered from `members` and
  named for the member, never from a project id;
- the **per-project `p:<id>:*` groups**, scaffolded as a `_default` placeholder
  per project — the one file init authors rather than renders, because no pack
  can know a project's name;
- **`REPO_NAME`**, the repo's **folder name, slugified** — the basename of that
  repo's main checkout, never a project id — written **literally, never
  derived** at read time. A member repo names its own folder, never the base's;
- **`MERGE_MODEL_DEVELOP`** and **`MERGE_MODEL_MAIN`**, `direct` or `pr` each,
  asked inside init's git pass one row per repo per branch;
- **`MEMBERS`**, the product's other repositories as space-separated paths
  relative to the repo root, where the linkage is **siblings**. A submodule
  product leaves it empty — `.gitmodules` answers instead;
- **`node`**, from init's **stack read**: whether node and pnpm sit in
  `_base/mise.toml` for every environment or in `_base/mise.dev.toml` for the
  laptop alone;
- the commit gate's **scope list**, one scope per project id — `scopes`, filled
  on *any* run, the first included;
- the commit gate's **forge links**, from the origin remote on every render.

Every name above is **slugged** first, by a rule the adapter's `assets/ids.md`
owns: lowercased, runs outside the slug alphabet collapsed to a single `-`, ends
trimmed. That asset carries one rule with two independent applications — a
project's **id**, which names the `p:<id>:*` group and fills the scope list, and
a repo's **name**, which fills `REPO_NAME` from the main checkout's folder — and
a member's name takes the same spelling rule on its way into a flag or an alias.
The reason is measured rather than stylistic — the task runner reads a
per-project group's directory name as the task's *last* segment once the
`_default` slot collapses into it, and strips what looks like an extension from
that segment, so an id carrying a dot silently loses everything after it.

A pack can still contribute **one task** to a project's group without knowing
its name: a `config/` tree's `.config/mise/tasks/p/_project/` directory is
itself a marked position, and the materializer renames it to the pinned
project's slugged id as it copies — which is how all three Cloudflare deploy
packs land `p:<id>:deploy`.

**Legacy names.** The contract replaced these, and `stackgen:tool-config`'s mise
reference carries the table so `/vwf:init` can rename them on an existing repo —
and, for the `print_*` rows, rewrite the calls to them.

| Was                                         | Is now                             |
| ------------------------------------------- | ---------------------------------- |
| `worktree:init`                             | `setup:worktree`                   |
| `merge:develop`, `merge:main`               | `code:merge:*`                     |
| `setup:pnpm:*`, `setup:uv:*`, `setup:app:*` | `setup:deps:*`                     |
| `setup:doppler`                             | `setup:secrets`                    |
| `setup:deps:{start,stop,pull}`              | `setup:external:*`                 |
| `setup:deps:update`                         | `setup:deps:upgrade`               |
| `setup:deps:<verb>`                         | `setup:deps:<verb>:all`            |
| `code:format`, `code:lint`                  | `code:format:all`, `code:lint:all` |
| `setup:ai`                                  | `setup:ai:all`                     |
| `_scripts/_helpers`                         | `_scripts/helpers`                 |
| `_scripts/_checks`                          | `_scripts/checks`                  |
| `print_normal`                              | `print_yellow`                     |
| `print_normal_wait`                         | `print_wait`                       |
| `print_green`                               | `print_success`                    |
| `print_green_wait`                          | `print_wait`                       |
| `print_yellow_wait`                         | `print_wait`                       |
| `print_red`                                 | `print_error`                      |
| `print_red_wait`                            | `print_wait`                       |
| `print_header_wait`                         | `print_header`                     |
| `print_subheader_wait`                      | `print_subheader`                  |

The last nine rows are read for a second job. A repo whose shared helper file
has drifted from the skill's is carrying a diverged copy of it, not a library of
its own, so `/vwf:init` replaces that file and rewrites every call to a
left-hand name into its right-hand one — one token per call site, nothing else
on the line. A function the table has no row for is never rewritten either: it
is one the repo wrote for itself, so `/vwf:init` moves it verbatim into a
repo-owned `_scripts/local` sidecar the skill neither ships nor declares, and
points the calling tasks at it. One of the nine is more than a rename: the red
line became the error line, and an error line goes to stderr.

A repo still carrying a left-hand name is not broken, but nothing else in the
toolkit will find it: vwf probes `setup:worktree`, the aggregators call the
`…:all` tasks, and the hooks call the `…:all` gates.

## Skills and the agent

| Name                      | Kind                   | Does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stackgen-stack-menu`     | adapter, skill-invoked | The packs + the one open `generate` entry, as a vwf menu payload. Answers the same in every product                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `stackgen-stack-template` | adapter, skill-invoked | The dispatch: materialized entry → pure read; a first pin — which arrives from `/vwf:setup`'s materialize pass — resolves the bundle's composition and dispatches **per component**, packs copied and uncovered components generated, landing once behind one consent gate in the repo the optional `repo:` line names. Unknown slug → error, never a guess                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `stackgen-sync`           | user-only              | The explicit re-sync, **per component**: lockfile-anchored diff against current component packs, regeneration offered per generated component, the delta presented for consent. Repo edits never overwritten by default. What `stackgen:tool-config` renders for itself carries no lockfile record and is never diffed here; a record whose path its component no longer ships and whose file is gone is dropped with no delta row and named in the report; a pack whose `templates/` changed is refreshed by re-running `/stackgen:tool-config pack --slug <slug> --dir <pack dir>` — its rendered files are recorded `rendered: true` with no hash and never byte-diffed, and a value a newer version adds is found by its `detect`, else its `question`. Conditional paths are evaluated first, against the repo's `.config/stackgen.yaml` `forge` and `secrets` with the forge re-read live — a false path with no record is `skipped (condition)` and never offered, a never-landed path whose condition now holds is offered as a create, and a landed path whose condition turned false is kept and reported once. Removing a pack drops its `skipped:` rows with its entries. Closes by **re-checking the repo shape** — `/vwf:setup`'s Step 0 check, in-session, over the base and every member against the lockfile just updated — and on drift offers `/vwf:setup reshape` and invokes it on a yes; clean says nothing. A fragment that moved is folded into the merged config there, by the reshape, never by the sync |
| `tool-config`             | user **and** model     | Owns every universal file a repo runs — mise, the gates, git, graphify, the editor settings and the statusline config — copied from its `assets/` and rendered from its `templates/` by a shipped node script, from the values in `.config/stackgen.yaml`, in four calls: `all` lands them and runs `setup:all`, `pack` renders one pack's templates and values, `pack-remove` takes a dropped pack's files out, `upgrade` moves the exact pins CI loads. Every change is a numbered row; `preview` returns them without writing and `--answers` hands their answers back. Drift is judged from `preview all`. Called by `/vwf:init`, by the materializer for a pack's templates and by `/vwf:setup` for a pack's values; yours to run as well                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `stackgen-reputation`     | user **and** model     | A verdict on every name it is given — `/stackgen:stackgen-reputation <ecosystem>:<name> …`, the prefix one of eight: `npm:`, `pypi:`, `pub:`, `action:` (owner/repo), `image:` (registry/repo), `spm:` (host/owner/repo), `maven:` (group:artifact, a Gradle plugin as its marker coordinate) or `mise:` (backend:path, the full backend form only), an optional version or ref (`npm:left-pad@1.3.0`, `action:actions/checkout@v4`, `image:docker.io/library/nginx:1.27`, `spm:github.com/apple/swift-argument-parser@1.5.0`, `mise:aqua:realm/SwiftLint@0.57.0`) pinning what the advisory check runs against. Go, Cargo, Ruby and .NET tools have no prefix of their own and are reached as `mise:go:…`, `mise:cargo:…`, `mise:gem:…` or `mise:dotnet:…`; the mise backend decides which checks run, and a backend with no registry to ask warns at most — one row per name reading `pass`, `warn` or `block`, with the signals that decided it, from public read APIs. The generator calls it over every concrete name a generated component emits; you call it on a name before typing it anywhere                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `stackgen-skill-reviewer` | subagent               | The stateless trust gate on generation: catalog fidelity, the **when-not-to-apply** checks, citations that resolve and support, honest emitted facts, **kind conformance**, **topic-bar coverage** against the composition, and every emitted name carrying a verdict-table row that does not read `block` — read off the table it is handed, never looked up                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

**"skill-invoked" is two frontmatter keys, not one.** The two adapter skills
carry `disable-model-invocation: false`, so vwf can reach them by their
constructed names, *and* `user-invocable: false`, so neither takes a slot in
your `/` menu: an adapter answers in a payload shape only vwf reads, and there
is nothing for a user to do with it. Both keys are part of the adapter contract,
not a preference: `disable-model-invocation: true` would make vwf's call a
silent no-op rather than an error, and leaving the skills user-invocable spends
two menu slots on skills that answer only a program. `stackgen-reputation` is
the third shape: the first key and **no** `user-invocable` line, so the
generator reaches it programmatically and it still appears in your `/` menu —
one of the two stackgen skills invocable both ways; `tool-config` is the other,
carrying `user-invocable: true` explicitly.

## Trust: how a generated skill earns its place

A generated artifact is only as good as its checks, so every one passes five
before it lands:

1. **The catalog.** Each judgment instantiates a principles-catalog entry (vwf's
   `assets/principles/`) and cites it — including the entry's *when not to apply
   it* section, so the skill yields where the stack's own idiom already covers
   the ground. The catalog is passed in by vwf; stackgen never reaches into
   another plugin's files.
2. **The citations.** Each technology claim cites current documentation fetched
   through Context7 during the run — the primary research channel, one pass per
   bar topic minimum — recorded durably under `.claude/stackgen/citations/`, one
   file per component keyed per topic. Supplementary sources are allowed only
   where that topic's Context7 coverage is thin, and both the supplement and the
   thinness are disclosed.
3. **Artifact validity.** Separately from what it covers, every artifact has to
   *work*: strict-YAML frontmatter (a rejected skill is dropped with no error),
   the invocation state its kind rules — an adapter carries both
   `disable-model-invocation: false` and `user-invocable: false`, since a
   user-only skill is invisible to a delegating caller, silently, and a
   user-visible one offers a menu entry nobody can use — a **fixed** skill name
   rather than one assembled from configuration, and the hook verdict shape its
   event requires. These are host rules rather than stack rules, they live in
   `assets/artifact-doctrine.md`, and every one of them fails **silently at run
   time** — which is why they are gated here and nowhere downstream. The
   frontmatter bar is not the generator's alone: stackgen's own repo gate parses
   every **shipped** pack skill and pack agent under a strict parser too, so a
   curated pack is held to what a generated one is.
4. **The names.** Every concrete third-party name the component emits — a
   `mise_tool` entry, written `mise:<backend>:<path>` as its toml key once a
   short name is expanded with `mise registry`, a package a runner-invoked task
   names, a command an MCP server entry spawns, a GitHub Action, a container
   image, a `Package.swift` dependency, a Maven dependency or Gradle plugin in a
   build file — gets a verdict from `stackgen-reputation` before the dry-run
   gate shows it: `pass`, `warn` or `block`, decided by thresholds written in
   the skill's `references/signals.md` rather than judged on the spot — among
   them: absent from its registry, first published under 30 days ago, an
   unpatched critical or high advisory on the version to be pinned, a near-name
   of a far more downloaded package, deprecated or archived → `block`; one
   maintainer, bottom-tier downloads, no provenance, a low Scorecard → `warn`. A
   `block` halts the component with the table; you name the replacement, and it
   is checked in turn — never a silent swap. A source the skill cannot reach is
   `UNRESOLVED`, never an inferred verdict, and halts like an unreachable
   Context7. Shipped packs are outside the check: their names were curated by
   hand.
5. **The reviewer + you.** The `stackgen-skill-reviewer` agent returns `NO GAPS`
   or a numbered list — checking the kind's **topic-bar coverage**, artifact
   validity, the content, and that every emitted name has a row in the verdict
   table it is handed with none reading `block` (it looks nothing up itself) —
   and generation loops under a convergence guard of **four rounds**, after
   which residuals are reported rather than looped forever or landed quietly;
   then the materializer shows the full landing set as a dry-run plan, the
   verdict table whole beside the reviewer's verdict with each `warn` row called
   out on its own line, and writes nothing without your approval.

## Caveats

- **Generation needs Context7, the catalog, and the reputation sources.**
  Missing any is a halt with its name, not a degraded run — a name whose
  registry or advisory source could not be reached is never landed on a guessed
  verdict.
- **Drift is a feature with a viewport.** Your repo's copies may diverge from an
  upgraded pack by design; `/stackgen:stackgen-sync` is where the divergence
  becomes a diff you decide about. A record whose path its component no longer
  ships and whose file is already gone is dropped without a row in that diff,
  and the sync report names it. The lockfile's per-file `hash:` — carried by
  every copied file, never a `rendered: true` one — has three writers, and a
  differing hash is drift only when none of them ran: the materializer at
  landing, `/vwf:init`'s replace-or-keep offer on either answer, and `/vwf:init`
  again after every fill it writes — so a file it filled or you chose to keep
  reads as current, not as drift.
- **Repo config is a fenced target, not a free one.** A pack writes only the
  config files its own component owns — its gate's config included, since
  2026-09-05; since 2026-10-01 it ships no editor settings. The language
  manifest and its lockfile, CI workflows, a pack's own editor settings (the one
  universal `.vscode/settings.json` is tool-config's) and `CLAUDE.md` are named
  as prerequisites and left to you, deliberately: each file the tier absorbs
  makes the argument for the next one easier, and those four are where the line
  holds.
