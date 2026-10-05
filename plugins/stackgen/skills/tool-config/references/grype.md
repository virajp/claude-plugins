# grype — the vulnerability scanner

grype scans dependencies for known vulnerabilities, at two moments that catch
different things. The **source tree**, on every commit, sees what the manifests
and lockfile declare — a transitive dependency a routine update picked up. The
**built artifact**, before release, sees what actually shipped — the base
image's system packages, anything a build step pulled in, everything the
lockfile never mentioned. A repo that scans only source ships the base layer's
advisories and reports green.

This reference is grype's part of the universal files tool-config lands. What
every file shares — the values, the render, the rows and drift — is
[the skill's](../SKILL.md); what follows is grype's own.

## 1. What lands

| File                 | As                         |
| -------------------- | -------------------------- |
| `.config/grype.yaml` | an asset, owned whole      |

`fail-on-severity: medium`, and `ignore: []` with the bar an entry has to clear
written above it. grype finds neither `.grype.yaml` nor `GRYPE_CONFIG` here,
so `code:sec` passes `--config`.

**The file carries no marker.** Once a person adds an ignore entry, the file
differs from a fresh render, and every later `all` shows it as one row: answer
`keep-existing` to keep the entries ([rows](../SKILL.md#rows-and-answers)). A
repo that keeps its own entries therefore takes no later shipped change to
this file until a person folds one in by hand.

**The threshold is a position, not a default.** Medium and above fails; low
and negligible are reported. `low` on a typical tree is a wall of findings,
and a gate nobody can clear gets bypassed rather than fixed — strictly worse
than a higher threshold honestly enforced. `code:sec` also spells
`--fail-on medium` at the call site, so the threshold is readable where the
gate is invoked; the file is the home of the decision, and the two move
together or not at all.

## 2. An ignore entry

An ignore is a person's judgement about one finding, written by hand. Each
entry carries four comment lines directly above it:

```yaml
ignore:
  # id: GHSA-xxxx-xxxx-xxxx
  # package: example@1.2.3
  # reason: only the CLI entry point imports it, and the CLI is not shipped
  # expires: 2026-12-31
  - vulnerability: GHSA-xxxx-xxxx-xxxx
```

**The reason** is why the finding does not apply here — a reachability
argument, not a severity opinion ("not reachable: only the dev server imports
it", never "low risk"). **The expiry** is what makes the list a queue rather
than a silence — the date the person will re-check, or the day after the
upstream release that fixes it is due. An ignore with no expiry is a permanent
silence nobody re-reads, still covering a fix that shipped a year ago. Ask the
person for any of the four they did not give; never invent one.

**Scope an ignore to the finding, never to the package.** Ignoring the
package means the next, unrelated advisory against it arrives silently.
Prefer upgrading; ignore only when there is genuinely nothing to upgrade to.

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
the dependency where an upgrade exists, and where none does, add an entry as
above; re-run until green. The threshold stays `medium` — lowering it to clear
the first scan is the permanent silence the ignore list exists to avoid.

**SBOM-first is the recommended CI shape, and no file here writes it.**
Generating an SBOM from the built artifact and scanning that catches the base
image's system packages — the larger share of a real image's findings. The
workflow that does it is the CI system's; the recommendation is here so the
gap is deliberate rather than unnoticed.
