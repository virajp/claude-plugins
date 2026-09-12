# gitleaks — secret scanning

**Two different scans, at two different moments.** The staged change is scanned
on every commit, which is what stops a credential entering history. History
itself is scanned **once**, deliberately, because it answers a different
question: what is already in there. Running the history scan on every commit
buys nothing and costs the gate its speed.

**A hit is a credential to rotate, not a line to delete.** This is the rule the
whole gate stands on. Once a secret has been committed it is disclosed — to
anyone with the clone, and to every backup of it. Removing the line makes the
scanner quiet and changes nothing about the exposure. Rotate first; clean the
tree second, if at all.

**Allowlist by fingerprint, never by rule.** A fingerprint silences one known
finding at one location. Disabling the rule that found it blinds the scanner
across the entire repository, including the file someone adds next week. The
narrower silence is the one that survives contact with a growing repo.

**Every allowlist entry carries why.** An unexplained fingerprint is
indistinguishable from a real secret somebody got tired of looking at.

**Wired as one task name**, and CI runs that same task. See the hook-runner
component for the parity rule this depends on.

## What this pack writes

`.config/gitleaks.toml` — the scanner's config: `[extend] useDefault = true`,
the commented rule template, and the allowlist of generated trees.

The fence in `output-tree.md` was opened for gate config files on 2026-09-05;
`package.json` and CI workflows remain outside it.

**Shipping the config is what makes `useDefault` safe to rely on.** A
`--config` file replaces the built-in ruleset rather than adding to it, so the
dangerous state is not "no config" — it is a config somebody wrote by hand to
add one rule, which silently becomes the entire scan. The pack ships the file
with `[extend]` already in it so the first custom rule is an addition by
construction.

**Three invocations, one task.** `code:sec` is the only thing that calls
gitleaks. With no flag it runs `gitleaks dir .` over the working tree with
`--config .config/gitleaks.toml --redact=50`; with `--staged` it runs
`gitleaks git --staged` over the index instead and skips the vulnerability
scanner; the history scan is `gitleaks git . --log-opts="--all"`, run once and
deliberately, not on every commit. The pre-commit gate carries **no gitleaks
hook of its own** — its `sec` hook is `mise run code:sec --staged`, so the
commit gate and the task are the same configuration, and the binary is the one
the toolchain manager pins rather than one built into pre-commit's environment.
`pass_filenames: false` on that hook, because the index is a thing only git can
enumerate.

**Establishing a baseline on an existing repo.** Scan the history once, rotate
everything real that it finds, then allowlist what remains **by fingerprint**,
each entry carrying why. A baseline that allowlists by rule, or that is adopted
before the rotation, converts a backlog into a permanent blind spot.
