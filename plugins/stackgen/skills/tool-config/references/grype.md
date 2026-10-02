# grype — the vulnerability scanner

grype scans dependencies for known vulnerabilities, at two moments that catch
different things. The **source tree**, on every commit, sees what the manifests
and lockfile declare — a transitive dependency a routine update picked up. The
**built artifact**, before release, sees what actually shipped — the base
image's system packages, anything a build step pulled in, everything the
lockfile never mentioned. A repo that scans only source ships the base layer's
advisories and reports green.

This reference is the `grype` row of the skill's tool table. The contract every
tool shares — the argument shapes, the block markers, drift, removal and the
lock record — is [the skill's](../SKILL.md); what follows is grype's own. The
file it lands is under `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/grype/`,
laid out as it lands under the repo root.

**grype is scripted.** `tool-config.mjs` — [run as the skill
says](../SKILL.md#running-the-script) — lands the file, writes and removes
each ignore entry, and raises the drift and migration rows. Your part is
relaying its rows, helping the person word an ignore's `--reason` — the one
part of an entry the script cannot judge
([the bar](#an-entry-clears-a-bar)) — and the one change it hands back, an
`ignore:` list it cannot read, a `needs-edit` row: make it a block sequence
of `- vulnerability:` entries, or `ignore: []`, then re-run the same call's
`preview` and finish with `check`.

## 1. What `all` lands

| Landed               | As                                                  |
| -------------------- | --------------------------------------------------- |
| `.config/grype.yaml` | the frame, the base unmarked, blocks in `ignore:`   |

`fail-on-severity: medium`, and `ignore: []` with the bar an entry has to clear
written above it. It reads none of `all`'s keys. The base holds no entry in
`ignore:`, so it carries no block; a requester's block, and a person's own
entries, go in that list ([the skill's](../SKILL.md#blocks) per-position
rule). grype finds neither
`.grype.yaml` nor `GRYPE_CONFIG` here, so `code:sec` passes `--config`.

**The threshold is a position, not a default.** Medium and above fails; low and
negligible are reported. `low` on a typical tree is a wall of findings, and a
gate nobody can clear gets bypassed rather than fixed — strictly worse than a
higher threshold honestly enforced. `code:sec` also spells `--fail-on medium`
at the call site, so the threshold is readable where the gate is invoked; the
file is the home of the decision, and the two move together or not at all.

## 2. The verbs

| Call                                                                                     | Writes to                         |
| ---------------------------------------------------------------------------------------- | --------------------------------- |
| `grype add-ignore --id <id> --package <name@version> --reason <text> --expires <date>`   | `.config/grype.yaml` — `ignore:`  |
| `grype remove-ignore --id <id>`                                                          | `.config/grype.yaml` — `ignore:`  |
| `grype remove --for <requester>`                                                         | its block in `.config/grype.yaml` |

**`add-ignore`** takes all four flags, each required — the call is refused
without one:

- **`--id`** — the advisory id, `CVE-…`, `GHSA-…`: letters, digits and `-`;
- **`--package`** — the package and version it matches, `<name>@<version>`
  (`@scope/name@1.2.3` for a scoped npm package);
- **`--reason`** — why it does not apply here, one line;
- **`--expires`** — the re-check date, `YYYY-MM-DD`, a real calendar day.

It writes the four as `#` comment lines directly above
`- vulnerability: <id>`, so they are one entry:

```yaml
ignore:
  # id: GHSA-xxxx-xxxx-xxxx
  # package: example@1.2.3
  # reason: only the CLI entry point imports it, and the CLI is not shipped
  # expires: 2026-12-31
  - vulnerability: GHSA-xxxx-xxxx-xxxx
```

`ignore: []` becomes a block sequence on the first entry and returns to `[]`
when the last goes. With a `--for` it lands in the requester's block; with
none it is the user's line — the common case, since an ignore is a person's
judgement about one finding. The same id already ignored anywhere in the
list writes nothing and says where.

**`remove-ignore --id <id>`** deletes that entry and its comment lines,
whichever block or user line holds it, on the row's approval. An id the list
does not hold is refused. A requester is not named: the id is enough.

### An entry clears a bar

The four flags are the bar, and the script holds the shape of three: the id,
the `<name>@<version>` and the date. **The reason is yours to help word**,
since no pattern can judge it: why the finding does not apply here — a
reachability argument, not a severity opinion ("not reachable: only the dev
server imports it", never "low risk"). And the expiry is what makes it a
queue rather than a silence — the date the person will re-check, or the day
after the upstream release that fixes it is due. An ignore with no expiry is
a permanent silence nobody re-reads, still covering a fix that shipped a
year ago. Ask the person for any of the four they did not give; never
invent one.

**Scope an ignore to the finding, never to the package.** Ignoring the package
means the next, unrelated advisory against it arrives silently. Prefer
upgrading; ignore only when there is genuinely nothing to upgrade to.

## 3. Running it

```sh
mise run code:sec     # grype dir:. --config .config/grype.yaml --fail-on medium, plus gitleaks
mise x -- grype <image>:<tag> --config .config/grype.yaml   # the built artifact, before release
```

**There is no hook for grype.** It reaches the commit gate only through
`code:sec` — and `--staged`, the hook's mode, skips it — so it gates the full
scan and CI; remove the task and nothing runs it.

**A baseline on an existing repo.** A never-scanned tree rarely clears
`medium` on its first run. Run `mise run code:sec`; for each finding, upgrade
the dependency where an upgrade exists, and where none does, `add-ignore`
with its four flags; re-run until green. The threshold stays `medium` —
lowering it to clear the first scan is the permanent silence the ignore list
exists to avoid.

**SBOM-first is the recommended CI shape, and no file here writes it.**
Generating an SBOM from the built artifact and scanning that catches the base
image's system packages — the larger share of a real image's findings. The
workflow that does it is the CI system's; the recommendation is here so the gap
is deliberate rather than unnoticed. Which dependencies a project takes on, and
their supply-chain settings, are the language pack's.

## 4. The migration

`all` on a repo the retired grype gate pack shaped keeps every ignore entry as
the user's own, whatever its comment says — an older entry without the four
lines stays as it is until a person removes it and adds it again — re-records
the lockfile entry as `tool-config/grype@<version>`,
and deletes the repo-local grype skill under `.claude/skills/grype/` where it
still matches its record, keeping and reporting it where it does not.
