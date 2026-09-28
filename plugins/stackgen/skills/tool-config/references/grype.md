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

| Instruction                    | Writes to                        |
| ------------------------------ | -------------------------------- |
| `add ignore <id> [reason]`     | `.config/grype.yaml` — `ignore:` |
| `remove ignore <id>`           | `.config/grype.yaml` — `ignore:` |
| `remove <requester>`           | its block in `.config/grype.yaml` |

**`add ignore <id> [reason]`** writes `- vulnerability: <id>` with the reason
as a `#` comment directly above it, so the two are one entry. `<id>` is an
advisory id — `CVE-…`, `GHSA-…` — letters, digits and `-`; the reason is the
rest of the line, quoted when it holds a quote. `ignore: []` becomes a block
sequence on the first entry and returns to `[]` when the last goes. With a
`for` it lands in the requester's block; with none it is the user's line — the
common case, since an ignore is a person's judgement about one finding.
The same id already ignored anywhere in the list writes nothing and says where.

**`remove ignore <id>`** deletes that entry and its comment, whichever block or
user line holds it, on the row's approval. An id the list does not hold is
refused.

**An entry clears a bar, and the reason says how.** Four things, in the
comment: the vulnerability by id; the package and version it matches; why it
does not apply here — a reachability argument, not a severity opinion; and what
makes it expire — a re-check date or the upstream release that fixes it. An
ignore with no expiry is a permanent silence nobody re-reads, still covering a
fix that shipped a year ago; the expiry is what turns the list back into a
queue. A reason missing any of the four is shown in the row as such before it
is approved.

**Scope an ignore to the finding, never to the package.** Ignoring the package
means the next, unrelated advisory against it arrives silently. Prefer
upgrading; ignore only when there is genuinely nothing to upgrade to.

## 3. Running it

```sh
mise run code:sec     # grype dir:. --config .config/grype.yaml --fail-on medium, plus gitleaks
grype <image>:<tag>   # the built artifact, before release
```

**There is no hook for grype.** It reaches the commit gate only through
`code:sec` — and `--staged`, the hook's mode, skips it — so it gates the full
scan and CI; remove the task and nothing runs it.

**A baseline on an existing repo.** A never-scanned tree rarely clears
`medium` on its first run. Run `mise run code:sec`; for each finding, upgrade
the dependency where an upgrade exists, and where none does,
`add ignore <id> <reason>`; re-run until green. The threshold stays `medium` —
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
the user's own, re-records the lockfile entry as `tool-config/grype@<version>`,
and deletes the repo-local grype skill under `.claude/skills/grype/` where it
still matches its record, keeping and reporting it where it does not.
