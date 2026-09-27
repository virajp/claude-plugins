# renovate — the dependency-update policy

`renovate.json` is a policy, not an installation: nothing here adds a bot to
the repository, and the file is inert until one is enabled on it. So it lands
only where the repo runs Renovate.

This reference is the `renovate` row of the skill's tool table. The contract
every tool shares — the argument shapes, the block markers, drift, removal and
the lock record — is [the skill's](../SKILL.md); what follows is Renovate's
own. The file it lands is under
`${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/renovate/`, laid out as it
lands under the repo root.

## 1. What `all` lands

| Landed          | As                                                           |
| --------------- | ------------------------------------------------------------ |
| `renovate.json` | the base, whole — only when `update_bot=renovate`            |

**The key it reads**: `update_bot` (default `none`). On `renovate` the file
lands; on `dependabot` or `none` it is listed under **Skipped**, and a later
run whose answer turned to `renovate` lands it. A repo that stops running
Renovate deletes the file by hand, as any base.

**Plain JSON carries no markers.** The base owns every key it writes, and the
lock entry records them under `keys:`
([the skill's](../SKILL.md#the-lock-record) rule for a file with no comments);
a key the entry does not name is the user's.

**What the policy encodes**: the recommended baseline, minor and patch grouped
into one pull request, weekly lockfile maintenance, and a **ten-hour minimum
release age** — the same number mise pins its fuzzy resolution to. The two are
one decision — a version too new to have been withdrawn yet is not a version
this repo installs — so they move together. Two managers are enabled by name:
mise's, which reads every mise config file including `.config/mise/conf.d/`,
and pre-commit's, which is **off** by default and without it the hook revisions
are the one pinned set nothing updates.

## 2. Why the root

Renovate's config discovery reads `renovate.json` first, then `.github/`,
`.gitlab/` and `.renovaterc`, and **never `.config/`** — a policy there is a
file the bot never opens. So this is the one policy that sits at the root
rather than under `.config/`.

**A repo's own policy wins, whatever its spelling.** Where the repo already
carries one under any name Renovate discovers — `renovate.json5`,
`.github/renovate.json`, `.gitlab/renovate.json`, `.renovaterc`,
`.renovaterc.json` — the base is not landed, nothing is merged into the
repo's file, and the call's output says so. That is the yield rule: two
policies would leave the bot reading whichever it found first.

## 3. The verbs

None beyond `remove <requester>`, which every tool takes. No pack asks
Renovate for a line today; the base is the whole policy.

## 4. The migration

`all` on a repo the retired hygiene pack shaped re-records the lockfile entry
for `renovate.json` as `tool-config/renovate@<version>`, its base keys under
`keys:`. A key the retired payload never carried is the user's; a base key
whose value was edited is drift, shown as the skill says.
