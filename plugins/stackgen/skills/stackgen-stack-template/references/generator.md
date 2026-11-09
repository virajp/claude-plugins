# The Generator

Read this only for an **uncovered component** — one the resolved
composition needs and no shipped pack covers (a pin of
`generated/<technology-slug>` is the case where the bundle root itself is
uncovered). The generator produces, per component, the same shape a pack
has (classification + payload fields, conventions prose, optionally
skills), then hands it to [the materializer](materializer.md) as part of
the composition's single consent gate and landing. Generation is
**explicit**: it runs on a pin, never as a background refresh.

## Preconditions — halt, never guess

- **The principles catalog must have been passed in.** vwf passes the
  catalog's asset paths (its index plus entries) into the invocation. No
  catalog in the invocation → halt and name what is missing. Never
  substitute general knowledge for the catalog — the catalog is the trust
  anchor the reviewer gate checks against.
- **A research source must be reachable.** Before the first topic, probe
  once whether a Context7 MCP server is reachable — one the user installed,
  at any scope, or another plugin. stackgen never installs one and never
  asks for one. The run's **primary source** is Context7 when Context7 is
  installed and reachable; otherwise it is the technology's official
  documentation, found with `WebSearch` and read with `WebFetch`. `WebFetch`
  is the one web tool generation cannot do without, because it reads the
  page; without `WebSearch` the official page is reached through the
  registry's homepage link. The **package registries are always read**, in
  either case, for every package name and version.

  With no Context7 and no `WebFetch` — refused or offline — there is no
  research source, and generation **halts** before writing anything, with
  exactly this sentence and no install step:

  > Generation stopped: no research source is reachable — WebFetch,
  > WebSearch and the package registries refused or are offline, and no
  > Context7 server answered — and a generated pack needs cited facts.

  A generated skill written from training knowledge is exactly the
  plausible-but-stale artifact this pipeline exists to prevent.
  Other sources are allowed only where the primary source's coverage of a
  topic is thin — and both the thinness and every supplement are disclosed,
  per topic, in the citations file (step 3): the output says what it could
  not verify rather than padding.
- **The sources `stackgen-reputation` names must be reachable.** Step 4
  vets every concrete name the component emits through that skill, and a
  source it cannot reach yields an `UNRESOLVED:` row, never an inferred
  verdict. Unreachable → **halt**: a name landed unvetted is exactly the
  plausible-but-unchecked artifact the check exists to prevent.

## Pipeline

1. **Classify the component, then detect the real stack.** The component
   carries a `type` and, where its type has them, a `category`
   (`${CLAUDE_PLUGIN_ROOT}/assets/taxonomy.md`) inside its bundle's kind
   (`${CLAUDE_PLUGIN_ROOT}/assets/kinds.md`) — together they fix the output
   structure, scope, facts and invocation modes before a word is written.
   Then read the repo's manifests for the component's actual version,
   config flags, companion tools, and usage shape. Generation targets what
   the repo has, not the technology in the abstract — a claim about a
   config-dependent feature the detection never confirmed is a reviewer gap
   waiting to happen.
2. **Resolve the component's topics.** The unit of research and writing
   is the **bar topic**, never the library: take the kind's topic bar
   (`${CLAUDE_PLUGIN_ROOT}/assets/kinds.md`) and select the topics the
   component's type owns — the composition as a whole covers the bar,
   each component supplying its slice. Decide each conditional topic's
   applicability from the detection: a conditional topic the detected
   stack makes inapplicable is recorded **`n/a` with why** in the
   citations file — never silently absent, because the reviewer reads
   absence as a gap. A kind whose bar is still pending elicitation has no
   topic list to walk; its structure sketch bounds what is generated, and
   nothing here invents a bar for it.
3. **The topic loop — research, write, cite, per topic.** For each
   applicable topic, in order:
   - **Research** — one pass of the primary source per topic, minimum: a
     Context7 pass when Context7 is installed, else the official
     documentation through `WebSearch` and `WebFetch` — the topic's
     current APIs, configuration shape, idioms, the ecosystem's own
     conventions, against the detected versions and companions; and the
     package registries for every package name and version. Other sources
     only where the primary source's coverage of *this topic* is thin —
     and the thinness itself is recorded for the topic, which is what lets
     the reviewer accept a thin topic honestly instead of flagging it as a
     coverage gap. Context7 with no library or no documents for the
     technology is a **thin topic**, not a failure. With Context7 reachable
     and the web sources refused, a thin topic is written from Context7
     alone and disclosed as thin, with the note *web sources unreachable*;
     a registry that cannot be read is the reputation `UNRESOLVED:` halt
     (step 4).

     **A source that fails mid-run.** Only a Context7 tool error or
     timeout is a failure. From the topic that failed on, the run uses
     `WebSearch`, `WebFetch` and the registries for every remaining topic,
     never tries Context7 again, and treats the official documentation as
     the primary source for the thin rule; a topic half-researched in
     Context7 is researched again from its start. The switch is a note, naming
     that topic, in the component's citations file. When every source
     fails mid-run, generation halts with the sentence above: it writes no
     pack and keeps nothing partial, the halt report lists the topics that
     were done — no file records them — and the next run starts again.

     An `lsp_servers:` declaration bound for
     `vwf-tools` is researched from fresh sources alone, resolved from the
     technology's name by this research channel, at first generation and at
     every regeneration alike: its `command`, `args` and `env` never come
     from a citations file or any other text the repo holds, because a repo
     can plant them, and this declaration runs in every repo on the machine.
   - **Write** — the topic's artifact, per the kind's structure and per
     the host rules in `${CLAUDE_PLUGIN_ROOT}/assets/artifact-doctrine.md`,
     which decide whether the artifact is valid at all: strict-YAML
     frontmatter, the invocation state its kind rules, fixed skill names,
     and the hook verdict shape its event requires. Every one of those
     fails **silently**, so nothing downstream catches what is missed
     here. There is **no line cap** — an artifact that has outgrown one
     sitting is decomposed into a router plus on-demand references, never
     trimmed. Instantiate the catalog as it lands in
     this topic — concrete idioms, not restated definitions — honoring
     each entry's **when-not-to-apply** section: where the stack's own
     idiom already embodies or supersedes a principle, the artifact says
     so instead of prescribing ceremony.
   - **Cite** — every claim about the technology cites its research
     source; every judgment cites its catalog entry. Citations land
     durably in `.claude/stackgen/citations/<component-slug>.yaml`,
     **keyed per topic**: the topic's sources, every supplement disclosed
     as such, a thinness note where research came up thin, and the `n/a`
     topics with their why. One citations file per component — which is
     what lets sync regenerate one component without churning the others.
4. **Assemble the component's pack shape**, per its type's slice of the
   kind's structure: the classification fields (`type`, `category`,
   `capability` — a vwf token or unset, never a minted one; the taxonomy's
   seam), the payload fields its type owns (a language component's
   languages **with emitted facts** — how an LSP is provided, the mise
   tool, the manifest; `n/a` where honest), the `harness` entries it
   satisfies, the conventions prose, and the artifacts its slice defines —
   skills, agents, rules, within the output vocabulary. **Never an
   executable** (hook scripts are pack-only), and **no artifact ever
   contains MCP or LSP configuration** — where an LSP server is genuinely
   needed the component *declares* it, as `lsp_servers:` in its pack shape,
   and the materializer lands it behind its own consent line
   ([the materializer](materializer.md), [the local plugin](local-plugin.md));
   generation never writes a config file or a manifest itself, and
   stackgen holds no registry of servers, per
   `${CLAUDE_PLUGIN_ROOT}/assets/artifact-doctrine.md` §5. **The generator
   emits no `user_mcp_servers:` entry** — the key is retired. A component
   whose skills need an MCP server writes a `## MCP servers` section in its
   `conventions.md` instead
   (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`): one line per server, its
   exact name, what it is for and its official install page, `(optional)`
   after the name when the component works without it — never an install
   command, never a config block. The user installs it; nothing here vets or
   lands it.

   **Then vet every name, once the declared names are final.** List every
   concrete third-party name the component emits — its `mise_tool`
   entries, every runner-invoked tool in its harness tasks (`dlx`, `npx`,
   `uv run --with`, `uvx`), every `lsp_servers:` command, every package a
   server's runner chain fetches, every URL or bare host in an entry's
   `args` or `env` values,
   every action reference, every image reference, every
   dependency in a `Package.swift`, and every Maven dependency and Gradle
   plugin in a build file (`build.gradle.kts`, `settings.gradle.kts`,
   `gradle/libs.versions.toml`) — each written with one of the nine
   ecosystem prefixes, `npm:`, `pypi:`, `pub:`, `action:`, `image:`,
   `spm:`, `maven:`, `mise:` or `host:`; the generator always writes the
   prefix, never a bare name. Which name takes which prefix:

   | The name                                     | Is written as                               |
   | -------------------------------------------- | ------------------------------------------- |
   | a runner-invoked npm tool                    | `npm:<package>`                             |
   | a runner-invoked Python tool                 | `pypi:<package>`                            |
   | a Dart or Flutter package                    | `pub:<package>`                             |
   | a GitHub Action                              | `action:<owner>/<repo>@<ref>`               |
   | a container image                            | `image:<registry>/<repo>:<tag>`             |
   | a `mise_tool` entry, whatever its backend    | `mise:<backend>:<path>@<version>`           |
   | a `Package.swift` dependency                 | `spm:<host>/<owner>/<repo>@<version>`       |
   | a Maven dependency                           | `maven:<group>:<artifact>@<version>`        |
   | a Gradle plugin id                           | `maven:<id>:<id>.gradle.plugin@<version>`   |
   | any URL in a server's `args` or `env` value  | `host:<hostname>`                           |
   | a bare host in a server's `args` or `env`    | `host:<hostname>`                           |

   A server is an `lsp_servers:` entry. A server's **chain** is its command
   and every runner nested in its `args`, however deep, and every package the
   chain fetches is listed, with the prefix of the registry the runner that
   fetches it reads: `mise:` for `mise x` (the tool it starts after `--`, and
   each tool named before the `--`), `npm:` for `npx`, `pnpx`, `bunx`,
   `bun x`, `npm exec`, `pnpm dlx` and `yarn dlx`, `pypi:` for `uvx`,
   `uv run` and `pipx run`. With no package flag the package is the runner's
   first positional. `--package`, `-p`, `--from` and `--spec` name the
   package, each time they appear and on either side of a subcommand, and the
   positional is then a bin of it, not a package; `--with` adds a package
   beside the positional.
   `mise x -- pnpm --package=a --package=b dlx b` lists pnpm's `mise:` name,
   `npm:a` and `npm:b`; `npx -p evil ok` lists `npm:evil`;
   `pipx run --spec evil ok` lists `pypi:evil`. A chain that cannot
   be read this way — a runner that fetches and is not named here, a package
   spec that is no registry name (`github:…`, `git+…`, a path) — stops
   generation as `UNRESOLVED:`.

   A URL in `args` or in an `env` value is vetted by its host alone, never
   its path, query or credentials: `npx <package> <url>` lists the runner's
   package and the `host:` name both, `env: { API_URL: <url> }` lists the
   `host:` name beside the command's, and the `host:` row blocks either. A
   **bare host** takes the same row: an `args` element or `env` value that
   reads as a hostname or an IP address, with no scheme, with or without a
   port or path (`API_HOST: evil.example.com`, `10.0.0.1:9000`), `localhost`
   among them. A dotted value that could be a file or a host is a host, a
   `${VAR}` reference names none, and the default it carries is read as a value.

   Three forms name no one thing to vet, so each stops generation as
   `UNRESOLVED:`, whatever the verdict table says:

   - **A shell, or an interpreter's inline code,** as a server's command or
     anywhere in its chain, by any path: every shell, with or without `-c`
     (`sh`, `bash`, `zsh`, `dash`, `ksh`, `fish`), and a shell that `env`
     starts counts as a shell (`env sh -c`); every inline-code form of
     every interpreter (`node -e`, `node -p`, `python -c`, `perl -e`,
     `ruby -e`, `php -r`, `bun -e`, `deno eval`, `npx -c`); and a flag that
     loads code beside the tool named (`node --import`, `node --require`).
   - **A `data:` or `file:` value:** an `args` element or `env` value that is
     such a URL or embeds one.
   - **A code-loading variable,** whatever its value, set as an `env` key or
     as a `VAR=value` element of `args`: one that makes a runtime, a loader or
     a shell load or run something (`NODE_OPTIONS`, `NODE_PATH`, `PYTHONPATH`,
     `PYTHONSTARTUP`, `PERL5OPT`, `RUBYOPT`, `JAVA_TOOL_OPTIONS`, `BASH_ENV`,
     `ENV`, `ZDOTDIR`, `LD_PRELOAD`, `DYLD_*`, `PATH`).

   **Where the vetting ends.** The generator vets the names that it can read
   from the declared command. The consent gate shows the full command and its
   env values: `command`, `args`, and the `env` keys and their values, per
   [the local plugin](local-plugin.md). The person at the gate is the
   control for any form that the vetting does not parse.

   A SwiftPM name is read
   from the dependency's package URL, the host kept (`github.com` included). A
   Gradle plugin is vetted as its plugin marker coordinate. Go, Cargo,
   Ruby and .NET tools have no prefix of their own: they are mise tools,
   reached as `mise:go:…`, `mise:cargo:…`, `mise:gem:…` or
   `mise:dotnet:…`. A mise tool's name is its toml key with the version
   its toml value pins after `@`; an entry that pins `latest`, or no
   version, is written with no `@`, and the skill warns on it as unpinned.

   **Expand a short mise name first.** A mise tool named without a
   backend (no `:`, e.g. `swiftlint`) is expanded before it is vetted:
   run `mise registry <name>` directly — mise is on PATH — and take the
   first backend it prints (`aqua:realm/SwiftLint`). That full form is
   both the name vetted (`mise:aqua:realm/SwiftLint`) and the key written
   into the toml. A name `mise registry` does not know stops generation
   as `UNRESOLVED:`; the skill never receives a short mise name, since it
   returns `UNRESOLVED` for one.

   Invoke `stackgen-reputation` with that list, one argument per name. It
   returns a verdict table, one row per name reading `pass`, `warn` or
   `block`. **A `block` row halts this component here**: report the
   table, ask the user to name the replacement, and check the replacement
   before the step resumes. The generator never swaps a name silently — a
   swap is a new recommendation, and it is the user's. No source vets a
   remote host, so a `host:` row always reads `block`, and only a command
   that clears the check, with no URL or bare host in its `args` or
   `env` values, can replace it. `warn` rows travel
   with the table to the dry-run consent gate. An `UNRESOLVED:` row halts
   generation on its own terms (the preconditions above): a name whose
   sources could not be reached is never landed on an inferred verdict.
5. **The reviewer gate.** Dispatch the `stackgen-skill-reviewer` agent per
   generated component — stateless: it gets the catalog paths, the
   declared kind and the component's classification, the detected stack,
   the generated artifacts, the citation list, and the verdict table from
   step 4; it returns `NO GAPS` or a numbered gap list. Loop generation on
   the gaps until clean — under the **convergence guard**: reviewer rounds
   are capped, **default 4**, mirroring vwf's execute-stage rule, because
   a reviewer and a generator can trade findings forever. It is a
   **gate**: when the cap is reached with gaps still open, stop looping
   and report the residual gaps to the user — a run that cannot come clean
   is never landed quietly, and never iterated indefinitely either.
6. **Materialize.** Hand the clean component to
   [the materializer](materializer.md) alongside the composition's
   pack-sourced components — its dry-run consent gate is where the user
   sees everything before it lands.

## Rules

- **Configure, not conjure.** Generated output wires and documents existing
  tools — it never implements servers, and it never invents a tool the
  ecosystem does not have. A capability with no real mechanism is `n/a`.
- **Judgment over API surface.** The conventions carry decisions (layout,
  placement, testing shape, failure modes); API reference stays out of the
  pack, looked up at use time by whoever codes against it — in Context7 when
  Context7 is installed, else the official documentation.
- **The minimalism bar applies to the output itself**: generate the entries
  the detected stack needs, not one skill per catalog entry by rote.
