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
   the **kind** and its topic bar → detect the real stack (its manifests) → one
   Context7 research pass per bar topic, which needs a Context7 server from some
   source → instantiate
   vwf's principles catalog with citations → vet every concrete third-party name
   the component emits — packages, runner-invoked tools, a generated server's
   command and runner chain and the hosts in its `args` and `env`, GitHub
   Actions,
   container images, SwiftPM packages, Maven artifacts and Gradle plugins, and
   mise tools on any backend — through `stackgen-reputation`, one verdict per
   name (`pass`, `warn`, `block`); a **`block` halts that component** with the
   verdict table and you name the replacement, which is checked in turn — the
   generator never swaps a name silently → the `stackgen-skill-reviewer` gate
   (capped at **four rounds**, after which residuals are reported rather than
   looped forever) → the same materialized tree, the verdict table shown whole
   beside the reviewer's verdict at the dry-run consent gate. No Context7 server
   reachable from any source, or a reputation source unreachable → **halt, never
   guess**; the Context7 halt names its remedy,
   [the `context7` tool](#optional-tools--the-addon-kind).
   When the bundle root
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
to `mise run setup` rather than `swift package resolve`; no pack lands
`Package.swift`, which `swift package init` creates.
`toolchain-gate/swift-format` and `toolchain-gate/swiftlint` carry the two
gates' doctrine and land no file. The pins, the format and lint tasks and the
gate configs come from bootstrap, which the materializer asks for them. No Swift
pack ships a task: `mise run setup` resolves the packages, and
`mise run code:format` and `mise run code:lint` run the gates.

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
the moment it runs. Bootstrap's tasks find the selected Xcode and export it as
`XCODE_VERSION`. A repo that must build with one Xcode sets `XCODE_VERSION` in
the `[env]` of `.config/mise/conf.d/zz-repo/mise.<env>.toml` and commits it, and
every task that builds checks `xcodebuild -version` against it and fails fast.
The tasks read the values from the environment mise exports, never from a file.
A value set in the environment or in a gitignored `mise.local.toml` is a
machine's deliberate override and is left alone. The app's dependencies are
added through Xcode and locked in the
`Package.resolved` the project keeps — a path the swiftpm pack's `lockfile` fact
names, so doctor finds it — and the swiftpm component governs only a local
package the app splits out. Goldens run through swift-snapshot-testing in a
`SnapshotTests` target under `test:golden`, on the simulator named by
`SIMULATOR_DEVICE`, `SIMULATOR_OS` and `SIMULATOR_PLATFORM`. Without a value,
bootstrap's tasks pick the newest iOS runtime and its newest plain iPhone; that
choice moves when a machine installs a newer runtime, so a repo that commits
goldens sets all three in the same `zz-repo` `[env]`. The pack's `ux-gate` skill
runs them for the pinned platform,
audits accessibility on that platform and on `desktop` — a native macOS target;
Mac Catalyst is not supported — and reports every other changed platform as a
finding that it was not run; it returns only vwf's three keys — no `renders:`
list, so its renders are not kept yet — and reports `rendered: ok` only when
some goldens were compared. It judges each platform at its Apple OS frame — the
`ios` frame on `mobile` is 393×852 points, where it was 390×844 — or at the size
`design.viewports` sets for that OS. Its doctrine covers the whole app-framework
bar. Beside topics 1–11 its router carries one reference per Apple platform,
keyed by the vwf token it realises — iOS and iPadOS for `mobile` and `tablet`,
macOS for `desktop`, CarPlay for `auto`, watchOS for `watch`, tvOS for `tv`,
visionOS for `spatial` — and topic 12, sixteen integration references: Apple's
core integrations — widgets and complications, App Intents, push notifications,
StoreKit and Sign in with Apple — and, since 2026-10-10, the third-party set a
Flutter product reaches for: Firebase Analytics, App Check, Authentication (with
Google Sign-In), Crashlytics, Cloud Messaging and Storage, RevenueCat, remote
images and cropping (Nuke, TOCropViewController), WebRTC (a community
distribution of the official, unmodified WebRTC framework, then LiveKit), maps
and location (MapKit, Core Location) and web views (WebKit). Its topic files
answer the rest natively — localization with String Catalogs, `ShareLink`, the
launch screen, keep-screen-on, `PhotosPicker`, usage strings, `@AppStorage` and
an app version gate. Its iOS reference builds a flow's declared OS-specific
feature (a `features:` entry with `scope: ios`, the Dynamic Island its worked
case) behind an `#available` guard at the smallest scope, showing the entry's
declared `fallback` wherever the guard fails and never inventing one, where it
once left device and OS features to a prose deviation. Like Flutter's, those
integration references are wiring only — setup order, platform configuration,
anti-patterns — with the API surface left to Context7 at use time.

**Kotlin** arrived on 2026-10-09 as the fifth language a language-bundle is
rooted at: `kotlin-library`, a Kotlin/JVM library published as a JAR on the
`packages` platform, pins four new packs. `language/kotlin` is the root — the
12-topic doctrine, with tests on `kotlin.test` and JUnit 5,
`kotlinx-coroutines-test` and Kover. The JDK the Gradle wrapper and the Kotlin
Gradle plugin run on — Temurin, on the LTS line — and **kotlin-lsp**,
JetBrains' language server, come from bootstrap, which the materializer asks
for them. The compiler is the Kotlin Gradle plugin's and Gradle is the committed
wrapper's, so mise pins neither. `package-manager/gradle` carries the wrapper,
Kotlin DSL and version-catalog doctrine (`gradle/libs.versions.toml`), lands no
file and no task, and declares its lockfiles — `gradle.lockfile` at the root and
beside each module, and `settings-gradle.lockfile` — as a `lockfile` fact. No
Kotlin pack ships a task: `mise run setup` resolves every project against its
lockfile and fails when the graph disagrees with one, and
`mise run setup --upgrade` writes new lockfiles. `toolchain-gate/ktlint` and
`toolchain-gate/detekt` carry the formatting, style-lint and static-analysis
doctrine, detekt leaving every layout rule to ktlint, and land no file: the
pins, the tasks and the gate configs are bootstrap's, and `mise run code` runs
the gates. The bundle carries no Android and no Kotlin Multiplatform.

**Android** followed the same day on those four packs, as two bundles:
`kotlin-compose`, the third `app-framework` bundle and the second under
`native-ui`, serving `mobile`, `tablet`, `watch`, `tv` and `auto` from one
Gradle project, and `android-library`, a language-bundle publishing an **AAR**
on `packages`. Both pin `framework/android` — the Android Gradle plugin, the
Android SDK, Android Lint and the emulator — and `kotlin-compose` adds
`app-framework/compose`. The SDK levels live in the build files alone — each
module's `android {}` block, or a `build-logic/` convention plugin. Bootstrap
pins the SDK's **cmdline-tools** and sets `ANDROID_HOME`, and `mise run setup`
installs `platform-tools`, the compile platform, the emulator and one system
image with this host's ABI appended. It finds the compile level (`COMPILE_SDK`)
and the image (`EMULATOR_IMAGE`) in the build files; a repo that needs another
value sets it in the `[env]` of `.config/mise/conf.d/zz-repo/mise.<env>.toml`.
`mise run code:lint` runs Android Lint. The pack ships one task: `test:e2e` runs
the
instrumented Compose UI tests on a **Gradle Managed Device**, an emulator AGP
creates, boots headless and tears down: by default
`./gradlew e2eDebugAndroidTest` on the managed device `e2e`, with `--device` and
`--variant` naming another, while `mise run test:e2e -- --connected` runs
`connected<Variant>AndroidTest` on an emulator or device already attached. The
compose pack
teaches Jetpack Compose with **Material 3** as the only UI toolkit — no
Views/XML — and the app doctrine of a ViewModel exposing StateFlow, **Hilt**,
**Navigation Compose** and **Room**, with twenty integration references, wiring
only like Flutter's and SwiftUI's: the Jetpack set — Hilt, Navigation Compose,
Room, DataStore, Paging, WorkManager and CameraX — and, since 2026-10-10,
Firebase Analytics, App Check (Play Integrity), Authentication (with the Apple
provider), Crashlytics, Cloud Messaging and Storage, RevenueCat (with Google
Play Billing), image loading and cropping (Coil 3, CanHub
Android-Image-Cropper), WebRTC (`io.github.webrtc-sdk:android`, then LiveKit),
maps and location (Maps Compose, the fused location provider), WebView,
Credential Manager and Play In-App Updates. Its topic files add localization
with string resources, the share sheet, the SplashScreen API and keep-screen-on.
Its goldens are [Roborazzi](https://github.com/takahirom/roborazzi) captures
rendered on the JVM under Robolectric, committed under `src/test/screenshots/`:
`test:golden` verifies them, `mise run test:golden -- --record` re-records them.
Its `ux-gate` runs them on a Pixel 7 qualifier for `mobile`, a medium tablet for
`tablet`, a large round Wear OS watch for `watch` and a 1080p television for
`tv`, reads the Accessibility Test Framework's checks off the same run, and
returns the `renders:` list. It resolves each platform's viewport at the Android
OS frame (`android` on `mobile` and `tablet`, `wearos`, `androidtv`,
`androidauto`) or at the size `design.viewports` sets for that OS, and raises a
finding only when a configured size is one its qualifiers do not render.

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
On 2026-09-26 the mise pack and its kind retired, into a skill,
`stackgen:tool-config`. The four gate packs, the `repo-gates` bundle and the
`repo-gate` kind followed the same day, into the same skill. On 2026-09-27 the
hygiene kind, its pack and its bundle retired too: the ignore and attribute
files
became the skill's, and the prose files `/vwf:init`'s own assets. On 2026-10-23
a
pack's toolchain left stackgen: its tool pins, gates, gate configs and generic
tasks became bootstrap's, and a pack ships no `templates/` and no `values:` any
more. On 2026-11-03 the skill itself was removed, and every universal file
became
bootstrap's.

The newest category is **`workspace`**, minted on 2026-09-14 under
`capability-provider` and under the `addon` kind since 2026-11-02 — and the
first
minted for something no blueprint chooses. The
workspace is where a team's docs, specs and tickets live, and it is the
**agent's** knowledge source rather than anything the product runs against, so
it realizes no vwf capability token and none is pending. Its neutral contract
(`assets/contracts/workspace.md`) states a permission shape rather than an
availability one: the person authenticates and not the repository, the agent's
reach stops where that person's does, and a write needs the person to ask for it
in the session. One pack realizes it — `addon/notion`, an optional tool — and
what it lands is **wiring and nothing else**: its skills, and a
`user_mcp_servers:` entry the materializer writes into `vwf-tools` behind its
own
consent line. User scope means the authorised server is reachable from every
repo
on the machine, not only the one that picked it, and the gate says so.

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

The newest **type** and the newest **kind** are both
[`addon`](#optional-tools--the-addon-kind). Before them came `stylesheet`,
minted
on 2026-09-14 for an axis vwf had not had before — with three categories of
their own
(`utility`, `compile-time`, `plain`, the three ways the token mapping can be
paid for) and three packs filling them at once. It is the first kind whose
single required artifact is named by the kind itself: every pack in it ships a
`tokens.md`.

The newest **design tool** is the terminal itself — `claude-code`, the fourth
`design-tool` pack beside `claude-design`, `lovable` and `stitch`, and the first
with a **file canvas**: there is no hosted server and no key. The design system,
the logo and a flow's screens are authored
in session, through the `taste-skill` plugin's design skills, into a committed
`docs/design/<project>/` — `design-system.md` in the shape that plugin authors,
`brand/logo.svg` and its variants, `screens/<flow>--<platform>/<CODE>.html` one
per pinned screen code with a stitched `index--<platform>.html`, and
`comments/<flow>--<platform>.yaml` — which the three fixed import skills read as
files. The pack ships a fourth, **user-invocable** skill beside them,
`design-session`, which runs those sessions; vwf never calls it. It does not
install the `taste-skill` plugin, which is an
[optional tool](#optional-tools--the-addon-kind): `design-session` halts with
one
plain sentence naming the tools menu when the plugin is absent, and the three
import skills do not need it and keep working.

The review loop is four lines. `/design-session screens <flow>` authors the
pages from the brief `/vwf:screens prompt <flow>` wrote.
`/design-session review <flow>` serves them from the repo — a single-file Node
script with no dependencies, bound to `127.0.0.1` on an ephemeral port, no auth
and no TLS, a surface for one person on one machine — prints
`URL:
http://127.0.0.1:<port>/screens/<flow>--<platform>/index--<platform>.html`,
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

## Optional tools — the `addon` kind

Some tools serve the agent rather than the product, and installing them for
everyone is a decision nobody made. Each is a pack and a bundle of type, kind
and
axis `addon`, none flagged `default: true`, and generation never produces one:
the round has no `generate` entry and no deferral. `/vwf:architecture` offers
them
in a tools menu with nothing preselected, `.config/vwf.yaml`'s `addons:` records
the pick, and `/vwf:setup` materializes each slug in the base repo alone, on
every
run, and removes a dropped one.

| Tool          | Lands                                                                    | Who needs it                                                                                      |
| ------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `context7`    | one server in `vwf-tools`                                                | the generator, which halts when no Context7 server is reachable from any source, and you, at will |
| `notion`      | its skills, and one server in `vwf-tools`                                | nothing in the workflow; it is the agent's door into your team's workspace                        |
| `taste-skill` | a Claude plugin at user scope, which the materializer asks bootstrap for | the `claude-code` design tool's `design-session`, which halts without it; its imports do not      |

**The two halts say the same thing:** add the tool in `/vwf:architecture`'s
tools
menu, run `/vwf:setup`, restart the session. A Context7 server from a user-level
MCP or another plugin answers the generator too; a duplicate registration is
your
choice. Nothing else blocks on a missing tool, and `/vwf:doctor` reports a
picked
tool that is not installed, or an installed one that is not picked, as drift.

**`context7`'s runner is yours.** It runs over stdio through `sh -c`, as
`${CONTEXT7_RUNNER:-pnpm dlx} @upstash/context7-mcp`. `pnpm dlx` is the default;
export `CONTEXT7_RUNNER` to run it with `bunx`, `npx -y` or an absolute path.
Nothing checks the runner, so a wrong one surfaces as a dead MCP server.
`CONTEXT7_API_KEY` is optional and reaches the server only as a process
environment variable.

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
| `addon`               | addon                  | one component, standing alone — an optional tool, picked and never defaulted, whose pack declares `user_mcp_servers:` or a `## Claude plugins` section. See [Optional tools](#optional-tools--the-addon-kind)                                                                                                                                                                                                                                                                                        |

Every kind in that table is defined; no reservations are outstanding. Three of
the eight axes — `design`, `cicd` and `stylesheet` — are **tool axes**, where
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

## The output — `.claude/` first, and two targets beside it

The output vocabulary is **closed**: skills, agents, hooks (config + scripts),
and rules, all landing in the repo's own `.claude/` tree. Two things cannot be
`.claude/` files, and each is a separate target with its own consent line rather
than something that rides the landing:

- **A server** goes into `vwf-tools`, a small local plugin stackgen writes at
  the
  fixed path `~/.claude/plugins/local/vwf-tools/`. A language server cannot be
  expressed by any project file at all — `lspServers` is a plugin-manifest
  feature — so the one way to provide one is to *be* a plugin, and an MCP server
  travels the same way, from a pack's `user_mcp_servers:`: the pick is what a
  product commits, and each person's machine gets the server when they run
  `/vwf:setup`. It holds the union of what every repo you have materialized from
  contributed, and stackgen **prints the two registration commands rather than
  running them**. A repo's `.mcp.json` is no longer a path a server can take.
- **A repo's own config files** belong to the repo, not to `.claude/`. A pack
  declares the repo-specific ones in a `config/` tree mirroring the repo root,
  and they land there. The tier is an allowlist: a `test:*` task, a
  `p/_project/` task the materializer renames to the project's id, and a root
  file on the allowlist — which is how `cloud-service/workers-static-assets`,
  `cloud-service/workers-ssr` and `cloud-service/containers` each ship a
  `wrangler.jsonc` and the `p:<id>:deploy` task beside it. **A pack ships no
  toolchain**: the tool pins, the gates, their configs, the generic tasks
  (`setup:deps`, `code:format`, `code:lint`), the pre-commit hooks and the
  ignore and editor files are
  [bootstrap](https://github.com/virajp/bootstrap)'s.
  The repo selects bootstrap's tools in `.config/bootstrap.toml`, and
  `mise run setup:configs` syncs their files. The materializer reads a fresh
  clone of bootstrap to choose the tools a composition needs, and sends
  `add tools` and `add user plugins` instructions through bootstrap's
  `docs/sync/vwf.md`, behind their own consent line; it never edits
  `.config/bootstrap.toml` itself, and it records what it asked for in the
  lockfile's `bootstrap:` block. A pack names its own Claude plugin in a
  `## Claude plugins` section of its `conventions.md`. A repo that has not
  adopted bootstrap gets nothing landed: the tasks a pack ships source
  bootstrap's helpers. Everything else goes under `.config/`: a `config/`
  tree landing a root path outside the **landable** tier of the fixed allowlist
  is a pack authoring error the materializer refuses — that list also names the
  root file vwf itself writes, `CLAUDE.md`, which may sit at a shaped root and
  which no pack may land. Two **directories** are
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
`extensionToLanguage` map every generated language server declaration must
carry:
a repo with no matching files never starts the server, and a declaration without
a map is forbidden outright. **An MCP server has no such map.** Once it lands,
it
and any account grant it holds are reachable from every repo on your machine,
not
only the one that picked it, so its consent line shows the full declaration and
says that reach.

**A machine with the older `stackgen-lsp` plugin is offered one migration.** The
first materialization or sync that finds its directory offers, in order: write
`vwf-tools` with the union of both manifests' servers, register it, uninstall
`stackgen-lsp`, remove its marketplace, delete the old directory. Each step
checks
its own result and is skipped when already done, a failed or declined step stops
and reports, and the next run continues from the first incomplete one. Decline
the whole offer and nothing is written: `stackgen-lsp` stays as it is, a newly
picked tool's server lands nowhere, the repo's `.mcp.json` entries are kept, and
the offer returns on each later setup or sync.

**A declaration is never copied out of a repo.** A recorded `.mcp.json` key
moves
to `vwf-tools` only when a shipped pack declares it, and takes that pack's
declaration; any other key stays in `.mcp.json` and is reported, since a
committed
file earns no process in every session on your machine. In the same way the
migration seeds this repo's claim only for a key whose old-manifest declaration
matches the shipped pack's, or one this run generated; any other key stays
unclaimed and kept. `.claude-plugin/claims.json` beside the manifest records
which
repos claim each key, so a removal drops a key only when no repo still claims
it.

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
2. **`.claude/settings.json` and a pack's `config/` tree are never written
   without your explicit, separate consent**, each as its own line in the gate.
   A
   hook script can land while its wiring is declined (it stays inert, and the
   plan says so); a declined config write leaves the skills landed and says the
   tasks will be absent.
3. **The local plugin gets a larger gate still** — writing outside the repo and
   registering with a user-scoped tool is a bigger act than editing a project
   file — split into two separately declinable items: the manifest write, and
   the registration. Declining the registration leaves a valid plugin directory
   nobody has installed, and prints the two commands for later; a declined MCP
   server leaves the skills landed and says the tool will be unreachable.

Every target **merges, never owns**: the keys stackgen added are recorded in the
lockfile, so sync and removal touch only those, and removal of the local plugin
is **by subtraction** — another repo's contributions to the union stay, and the
directory and its registration go only when the last key does. Hook *scripts*
come only from curated packs; generation never emits an executable.

**A pack may still need repo files the materializer will not write.** The
`config/` tree is what a pack *owns*, and the fence around it is still real,
just drawn further out. Gate and provider configs came inside it on 2026-09-05,
and so did a deploy target's own config and its `p:<id>:deploy` task, the same
day. The gate and provider configs left again on 2026-10-23, when bootstrap took
the toolchain; the deploy config and the project and test tasks stay. **Four
things stay out, enumerated rather than left to judgment** — a
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
The editor settings a repo gets are bootstrap's `vscode` tool, and no pack adds
to
them.

So a pack whose correctness depends on a repo-wide edit it genuinely does not
own —
a scanner allowlist or a `.gitignore` block — carries that edit
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
component beside it. A file bootstrap's sync writes has no entry: it is
bootstrap's. **CLAUDE.md is vwf's domain**: stackgen never edits it, and ends a
materialization by recommending `/vwf:setup`.

`templates/<slug>.md` is what makes later fetches pure reads: frontmatter
carries every payload field (kind, axis, the `components:` refs this bundle
composes — `<type>/<slug>@<version>` or `@generated` — languages **with the
facts `/vwf:doctor` verifies** — LSP provision, mise tool, manifest, and the
optional `binaries` list of executables the stack needs that mise does not
manage, each a bare name looked up on `PATH` or a name with a `probe` command
doctor runs instead, such as Xcode's `xcodebuild` — plus the package manager's
`lockfile` paths, harness tasks and mechanisms, with `frameworks`/`capabilities`
derived from the composition, and on the project axis the bundle's optional
`os:` map copied as it stands), and the body is the `conventions:` prose `plan`
sizes against and `execute` writes to. The `os:` map names, for each platform in
the bundle's `platforms:` list, the OS tokens it ships on there in the order the
design canvas shows them — `swift-swiftui` is `ios` on `mobile` and `watchos` on
`watch`, `kotlin-compose` is `android` on `mobile` and `wearos` on `watch`,
`dart-flutter` is `ios` then `android` on `mobile` and `tablet` — so
`/vwf:setup` can record it as `projects.<name>.stack.os` and the canvas draws
each platform's OS frames. A bundle carries no size or chrome; vwf keeps the one
(platform, OS) frame table, and a bundle with no `os:`, or a platform missing
from it, gets the generic frame. That emitted-facts block is the **materialized
escape** in vwf's stack vocabulary: a language no shipped bundle covers is still
*known* when its pin carries these facts.

In a multi-repo product the target repo defaults to the current one; the caller
names a member repo to materialize there instead, as one optional `repo: <path>`
line beside the principles-catalog paths — the member's path relative to the
base repo root. vwf is what resolves it, and under `topology: multi-repo` every
vwf caller passes it. Each repo gets independent copies and its own lockfile, so
two members pinning the same slug hold two independent materializations.

## The repo baseline — bootstrap

Every universal file a repo runs is
[bootstrap](https://github.com/virajp/bootstrap)'s, and stackgen ships none of
them: the mise config and its task library, the gates and their configs, the
hooks, the branch model, the secrets tools, the ignore and attribute files, the
editor settings, the issue forms and the Claude plugins, recorded in each repo's
values file, `.config/bootstrap.toml`. The `setup:*` and `code:*` tasks are
bootstrap's too, and their reference is bootstrap's own `docs/sync`, so this
page
does not restate them. On 2026-11-03 the `stackgen:tool-config` skill that once
rendered all of this was removed.

[`/vwf:init`](./vwf.md#vwfinit) reaches bootstrap by giving the session
bootstrap's readme prompt, once for the base repository; the prompt covers the
submodules and the siblings, and bootstrap's `docs/sync` asks its own questions,
every value in the values file among them. It first adopts a repo, and on a
later
`/vwf:setup reshape` brings an adopted repo up to date. A repo is shaped when it
carries `.config/bootstrap.toml`, and it has drifted when
`mise run setup:configs --dry-run` shows a change. Only bootstrap edits that
file:
a pack that needs a tool asks for it through bootstrap's `docs/sync/vwf.md`, and
the materializer never writes the file itself.

**The prose files are `/vwf:init`'s own assets**: `CONTRIBUTING.md`,
`SECURITY.md` and the chosen `LICENSE` on a repo init was told is public. They
carry no lock record. A repo init was told is **private** gets no licence, since
a grant to the public has no reader there. `SECURITY.md`'s one contact slot
takes
the security contact as init was given it — an advisories URL for a public repo,
an email or an internal URL for a private one. `CONTRIBUTING.md` records that
the
forge's default branch and the protection on `develop` and `main` are set by
`/vwf:init`'s forge pass on GitHub and GitLab, and keeps the **by-hand** form of
both for any other forge.

### What a pack adds

A pack adds no subtask to bootstrap's library: a stack's own dependency, format
and lint tasks are bootstrap's. What a pack's `config/` tree adds is a test task
or a project task: `app-framework/swiftui` and `app-framework/compose` add
`test/golden`, `framework/android` adds `test/e2e`, `framework/astro` and
`framework/html` add `p:<id>:icons`, and the three Cloudflare deploy packs add
`p:<id>:deploy`. The pnpm pack ships no `.npmrc` any more: it names the two
settings the file should hold (`ignore-scripts=true` and `fund=false`), and the
repo sets them itself. bootstrap's sync lands first; composition then runs
`toolchain-gate`, then `package-manager`/`language`, then `app-framework`, then
`capability-provider`, then `cloud-provider`, then `cloud-service`, and the
lockfile records per file which component supplied it. The **deploy target goes
last** because it is the most specific thing a repo pins — a `cloud-service`
pack's root config and the `p:<id>:deploy` overlay beside it are the answer to
how this repo actually ships.

A value only a machine can answer — swiftui's `XCODE_VERSION` and its simulator
values, android's `COMPILE_SDK` and `EMULATOR_IMAGE` — is found by bootstrap's
tasks, or set by the repo in the `[env]` of
`.config/mise/conf.d/zz-repo/mise.<env>.toml`. A pack ships no `templates/` tree
and no `values:` list, and the toolkit's checker refuses a `templates/` folder,
a
`tool-config:`, `machine_env:`, `values:` or `conditional:` key, and any
`config/`
path off the pack allowlist.

A pack can still contribute **one task** to a project's group without knowing
its name: a `config/` tree's `.config/mise/tasks/p/_project/` directory is
itself
a marked position, and the materializer renames it to the pinned project's
slugged id as it copies, which is how all three Cloudflare deploy packs land
`p:<id>:deploy`. That id is slugged by a rule the adapter's `assets/ids.md`
owns:
lowercased, runs outside the slug alphabet collapsed to a single `-`, ends
trimmed. The reason is measured rather than stylistic — the task runner reads a
per-project group's directory name as the task's *last* segment once the
`_default` slot collapses into it, and strips what looks like an extension from
that segment, so an id carrying a dot silently loses everything after it.

## Skills and the agent

| Name                      | Kind                   | Does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stackgen-stack-menu`     | adapter, skill-invoked | The packs + the one open `generate` entry, as a vwf menu payload. Answers the same in every product                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `stackgen-stack-template` | adapter, skill-invoked | The dispatch: materialized entry → pure read; a first pin — which arrives from `/vwf:setup`'s materialize pass — resolves the bundle's composition and dispatches **per component**, packs copied and uncovered components generated, landing once behind one consent gate in the repo the optional `repo:` line names. The payload passes the bundle's `os:` map through as it stands. Unknown slug → error, never a guess                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `stackgen-sync`           | user-only              | The explicit re-sync, **per component**: lockfile-anchored diff against current component packs, regeneration offered per generated component, the delta presented for consent. Repo edits never overwritten by default. What bootstrap syncs carries no lockfile record and are never diffed here; a record whose path its component no longer ships and whose file is gone is dropped with no delta row and named in the report. The lockfile's `bootstrap:` block is diffed against the tools and plugins the current composition needs, read from a fresh bootstrap clone: an `add` or `remove` instruction for bootstrap's `docs/sync/vwf.md` is its own consent line. Closes by **re-checking the repo shape** — `/vwf:setup`'s Step 0 check, in-session, over the base and every member against the lockfile just updated — and on drift offers `/vwf:setup reshape` and invokes it on a yes; clean says nothing. A fragment that moved is folded into the merged config there, by the reshape, never by the sync                                                                                |
| `stackgen-reputation`     | user **and** model     | A verdict on every name it is given — `/stackgen:stackgen-reputation <ecosystem>:<name> …`, the prefix one of eight: `npm:`, `pypi:`, `pub:`, `action:` (owner/repo), `image:` (registry/repo), `spm:` (host/owner/repo), `maven:` (group:artifact, a Gradle plugin as its marker coordinate) or `mise:` (backend:path, the full backend form only), an optional version or ref (`npm:left-pad@1.3.0`, `action:actions/checkout@v4`, `image:docker.io/library/nginx:1.27`, `spm:github.com/apple/swift-argument-parser@1.5.0`, `mise:aqua:realm/SwiftLint@0.57.0`) pinning what the advisory check runs against. Go, Cargo, Ruby and .NET tools have no prefix of their own and are reached as `mise:go:…`, `mise:cargo:…`, `mise:gem:…` or `mise:dotnet:…`; the mise backend decides which checks run, and a backend with no registry to ask warns at most — one row per name reading `pass`, `warn` or `block`, with the signals that decided it, from public read APIs. The generator calls it over every concrete name a generated component emits; you call it on a name before typing it anywhere |
| `stackgen-skill-reviewer` | subagent               | The stateless trust gate on generation: catalog fidelity, the **when-not-to-apply** checks, citations that resolve and support, honest emitted facts, **kind conformance**, **topic-bar coverage** against the composition, and every emitted name carrying a verdict-table row that does not read `block` — read off the table it is handed, never looked up                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

**"skill-invoked" is two frontmatter keys, not one.** The two adapter skills
carry `disable-model-invocation: false`, so vwf can reach them by their
constructed names, *and* `user-invocable: false`, so neither takes a slot in
your `/` menu: an adapter answers in a payload shape only vwf reads, and there
is nothing for a user to do with it. Both keys are part of the adapter contract,
not a preference: `disable-model-invocation: true` would make vwf's call a
silent no-op rather than an error, and leaving the skills user-invocable spends
two menu slots on skills that answer only a program. `stackgen-reputation` is
the third shape: the first key and **no** `user-invocable` line, so the
generator reaches it programmatically and it still appears in your `/` menu.

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
   `mise_tool` entry, written `mise:<backend>:<path>@<version>` — its toml key
   and the version it pins — once a short name is expanded with `mise registry`,
   a package a runner-invoked task names, an MCP or language server entry's
   command and every package its runner chain fetches, the host of a server's
   `url` and of any URL or bare host in its `args` or `env` values, a GitHub
   Action, a container image, a `Package.swift` dependency, a Maven
   dependency or Gradle plugin in a build file — gets a verdict from
   `stackgen-reputation` before the dry-run gate shows it: `pass`, `warn` or
   `block`, decided by thresholds written in the skill's `references/signals.md`
   rather than judged on the spot — among them: absent from its registry, first
   published under 30 days ago, an unpatched critical or high advisory on the
   version to be pinned, a near-name of a far more downloaded package,
   deprecated or archived → `block`; one maintainer, bottom-tier downloads, no
   provenance, a low Scorecard, a Maven artifact with no linked source project →
   `warn`. A name with no version is vetted at its newest stable version, never
   a prerelease the registry marks default. A `block` halts the component with
   the table; you name the replacement, and it is checked in turn — never a
   silent swap. A source the skill cannot reach is `UNRESOLVED`, never an
   inferred verdict, and halts like an unreachable Context7. **A remote host
   always blocks**: no source vets one and a server there can change what it
   serves, so a generated server with a `host:` name does not land. A chain's
   packages are read through `--package`, `-p`, `--from`, `--spec` and `--with`,
   `pipx run --spec` among them. A shell or an interpreter's inline code
   anywhere
   in a chain, `env sh -c` included, a `data:` or `file:` value, and a
   code-loading variable such as `NODE_OPTIONS` each stop generation as
   `UNRESOLVED`, as does a chain that cannot be read. **The vetting ends at what
   it can read from the declared command.** The consent gate shows the full
   command and its env values, and you are the control for any form the vetting
   does not parse. Shipped packs are outside the check: their names were curated
   by hand.
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
  verdict. Context7 may come from any source, and the halt names the `context7`
  tool as the remedy.
- **Drift is a feature with a viewport.** Your repo's copies may diverge from an
  upgraded pack by design; `/stackgen:stackgen-sync` is where the divergence
  becomes a diff you decide about. A record whose path its component no longer
  ships and whose file is already gone is dropped without a row in that diff,
  and the sync report names it. The lockfile's per-file `hash:` — carried by
  every copied file — has one writer, the materializer at landing and sync after
  it. `/vwf:init` touches no file a pack landed, so a differing hash is what
  `/vwf:doctor`'s Content drift predicate judges, and a file you recorded under
  `enforcement.kept_files` is skipped.
- **Repo config is a fenced target, not a free one.** A pack writes only the
  config files its own component owns — its test and project tasks and a
  deploy target's root config. Since 2026-10-23 a gate's config is bootstrap's,
  and since 2026-10-01 a pack ships no editor settings. The language
  manifest and its lockfile, CI workflows, a pack's own editor settings (the
  `.vscode/settings.json` a repo gets is bootstrap's) and `CLAUDE.md` are named
  as prerequisites and left to you, deliberately: each file the tier absorbs
  makes the argument for the next one easier, and those four are where the line
  holds.
