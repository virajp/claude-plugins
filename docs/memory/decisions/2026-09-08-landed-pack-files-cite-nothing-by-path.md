# Decision — a landed pack file cites nothing by plugin path, and a bundle pin resolves

**Date** 2026-09-08 · **Branch** `2026-09-08-checker-landed-citations` ·
**Plan**
[`docs/plans/2026-09-08-checker-landed-citations/`](../../plans/2026-09-08-checker-landed-citations/index.md)
· **Gives an owner** to two rules that existed only as doctrine —
`assets/output-tree.md`'s "the output works with no plugin installed", and a
bundle-pin criterion that had lived as an acceptance line in an archived plan

## The problem

`plugins:check` covered the **plugin** tier well and the **pack** tier thinly,
and the pack tier is now the larger surface: 69 pack skills against 33 plugin
skills, 62 packs, 58 bundles. Two failure classes rode entirely on author care.

The first is a citation. A pack is **materialized, never referenced in place**:
`skills/`, `agents/`, `rules/`, `hooks/` and `config/` are copied byte-for-byte
into a target repo, a pack's `conventions.md` — like a bundle's body — lands as
the body of `.claude/stackgen/templates/<slug>.md`, and the materializer's only
mutation is the `p/_project/` → `p/<id>/` rename. Inside the plugin every path
those files spell resolves, which is precisely why rule 6 was silent about all
of them. After landing not one resolves, and **nothing reports it** — the reader
is sent to a path that is not there. 119 landed files carried 163 such hits.

The second is a pin. A bundle's `<type>/<slug>@<version>` component is a claim
about what the materializer will copy, and nothing checked the claim.

## What was decided

**Rule 13 — a landed file cites nothing by plugin path.** Four forms, refused in
the landed tiers (`skills/`, `agents/`, `rules/`, `hooks/`, `config/`, a pack's
`conventions.md`, and `bundles/*.md`), matched separately because they fail and
are fixed differently:

| Form                                                 | Why it is refused                                                                            |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| the literal `${CLAUDE_PLUGIN_ROOT}`                  | outside a plugin the host expands it to nothing — pathless occurrences included              |
| a bare `assets/…md`                                  | reads as repo-relative in the target and finds nothing                                       |
| a `../` chain that leaves the tree the file lands in | only a `skills/` file has a tree to climb within; every other landed `.md` lands as one file |
| `<type>/<slug>/<segment…>`                           | a sibling pack lands only if the composition picked it, and then under its own template name |

**A bare `<type>/<slug>`, and `<type>/<slug>@<version>`, are never refused.**
They are the lockfile's and a bundle's identifier vocabulary — 266 occurrences
in the corpus, all legitimate. Only a trailing segment makes a reference a path.

**The token is checked in every landed file; the other three in `.md` only, with
fenced blocks blanked to their own line count.** A shell task or a config
fragment legitimately points at files that land beside it, and a fence is a
worked example — the `tsconfig` pack's `extends` samples show a real relative
path the *target* repo will hold. Blanking rather than deleting keeps the
reported line number true, which is the finding's whole value.

**A skill's `../` chain may reach a sibling skill of the same pack.** A pack's
skills land as sibling directories under `.claude/skills/`, so those links still
resolve; the boundary is the pack's whole `skills/` tree, not one skill's own
directory. The narrower wording the plan first carried would have refused eight
`flutter-ios` → `flutter` links the plan itself calls valid. **Only `skills/`
has that latitude** — an agent, a rule, a `conventions.md` and a bundle body
each land as a single file with nothing above them, so any climb is refused.

**Rule 6 stands aside in the same files**, so one bad reference is one finding,
from the rule that knows what the file is for. **Rule 4 widens** to every
`stacks/*/*/skills/*/SKILL.md` and `stacks/*/*/agents/*.md`; `rules/*.md` is out
because frontmatter is optional there.

**The fix is never another path.** Name the asset by **role** ("stackgen's
secrets contract"), or state the rule it carries **inline** where the passage
depends on the content. A sibling component's conventions are "the
`<type>/<slug>` component's conventions, in this composition's template". No
sentence is deleted to satisfy the rule.

**Bundle pins resolve, and generation fails when they do not.**
`plugins:inventory` throws on a component ref that is not
`<type>/<slug>@<version>`, that names no `stacks/<type>/<slug>/pack.yaml`, or
that pins a version differing from that pack's `version`. `@generated` names no
pack by design and is skipped. Bumping a pack therefore means re-pinning every
bundle that names it — the bundle is the recorded composition, and
`stackgen-sync` diffs on that version. The ruling is written into
`assets/pack-format.md`'s Rules section, beside "a pack is copied, never
referenced in place".

**The mise pack's two `ids.md` citations reduce to the invariant**, not to a
restatement of the slug rule: `REPO_NAME`, the `p:<id>:*` task group, the member
flag and the `setup-<id>` alias all carry **one identical token** — the one
`/vwf:init` showed and the user confirmed. How that token is derived stays
single-sourced in the asset, which is not landed and can be read by whoever
needs it.

## The alternatives rejected

- **Refusing the token alone**, or the token plus the bare `assets/…` path. Both
  leave the two forms that were *already* broken in the corpus — the `../` climb
  out of a pack and the path into a sibling pack — and both of those fail
  exactly as silently.
- **An exemption list** for citations judged too useful to lose. An exemption is
  a path that still does not resolve after landing; the reader gains nothing
  from a documented dead link. Rewriting is the fix, including for the one
  argument that was *about* the token (`bundles/npm-package.md`), which is
  restated as "no path from this plugin spells vwf's root".
- **Warning rather than failing on a stale bundle pin.** A warning in a
  generator that also runs in pre-commit and CI is a line nobody reads. The user
  chose fail.
- **The inverse check** — a pack no bundle references. It would surface
  `package-manager/uv` and `toolchain-gate/ruff` on day one, which are a
  [recorded gap](../gaps/2026-09-01-python-packs-authored-but-unreachable.md),
  so it needs an exemption mechanism from the start. Parked.
- **Restating the slug rule inline in the mise pack.** The derivation is one
  rule with one owner; copying it into a landed file is how the counts in four
  prose files drifted before the inventory was generated.
