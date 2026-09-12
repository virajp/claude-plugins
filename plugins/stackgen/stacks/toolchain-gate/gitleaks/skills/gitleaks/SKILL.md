---
name: gitleaks
version: 1.0.0
category: development
description: gitleaks as the repo's secret scanner — scan the working tree on
  every commit and the history once, allowlist by fingerprint rather than by
  rule, and treat a hit as a credential to rotate rather than a line to silence.
  Auto-applies when editing .config/gitleaks.toml.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/gitleaks.toml"
  - "**/.gitleaks.toml"
  - "**/.config/gitleaks.toml"
---

# gitleaks — the secret scanner

gitleaks is the gate that keeps credentials out of the repo, in two places. The
pre-commit hook scans the **staged change** on every commit; `code:sec` scans
the whole **working tree** alongside `grype`, by hand and in CI.

The config lives at **`.config/gitleaks.toml`** and ships with the repo, so
`code:sec` and the pre-commit hook both pass `--config`. The file exists to
allowlist and to add rules, never to enable scanning.

**`--config` REPLACES the built-in ruleset rather than extending it**, which is
why the shipped file opens with:

```toml
[extend]
useDefault = true
```

Delete that and the rules below it become the entire scan — a repo that added
one vendor key pattern would stop detecting the ~170 credential shapes gitleaks
knows, and both gates would keep reporting green. Precedence, highest first:
`--config`, then `GITLEAKS_CONFIG`, then `<target>/.gitleaks.toml`.

```sh
mise run code:sec                    # grype + gitleaks over the working tree
mise run code:sec --staged           # the index only; what the `sec` hook runs
gitleaks dir . --config .config/gitleaks.toml --redact=50  # working tree
gitleaks git . --log-opts="--all"    # the whole history, once
```

`--redact` truncates the matched value in the output. Keep it on: a scanner that
prints the secret it found has published it a second time, into CI logs that are
usually more widely readable than the repo.

**The pre-commit gate has no gitleaks hook.** It once carried upstream's
`gitleaks-system`; now its `sec` hook is `mise x -- mise run code:sec --staged`,
so the commit gate and `code:sec` are not merely the same build — they are the
same configuration, in one file. A tool named in a task and in a hook is a tool
configured twice, and the two copies drift where nobody is looking.

That hook declares **`pass_filenames: false`**: `--staged` scans the *index*,
which is a thing only git can enumerate, so there is nothing useful to pass. It
is also what stops pre-commit appending the staged filenames to an entry that
takes at most one positional argument, which is how every commit touching two
or more files used to fail with `accepts at most 1 arg(s)`.

`code:sec --staged` needs gitleaks on `PATH`; it warns and continues where the
binary is absent, exactly as the tree scan does.

## A hit is a credential to rotate

This is the part that gets handled backwards. When gitleaks finds a real secret:

1. **Rotate it first.** It is compromised from the moment it was committed —
   pushed or not, a local clone is a copy.
2. **Then** remove it from the code and route it through the injector
   (stackgen's secrets contract: secrets reach a process as environment
   variables, injected at the process boundary).
3. Rewriting history is optional and usually not worth it. It does not
   un-compromise a rotated credential, and it breaks every existing clone.

Deleting the line and committing the deletion is **not** a fix. The value is
still in the history and still valid.

## Allowlist by fingerprint, not by rule

Most findings that are not real are a test fixture, an example value, or a
public key. Allowlist those **narrowly**:

```toml
[allowlist]
paths = ['''^tests/fixtures/''']
regexes = ['''EXAMPLE_[A-Z_]+''']
```

Disabling a whole **rule** to clear one fixture turns off detection for every
future real instance of that credential type — and nothing reports that it
happened. Prefer a path or a fingerprint; reach for a rule-level exemption only
when the rule is genuinely wrong for this repo, and say why in a comment.

## Where this stops

Which secrets a product has and where they come from is stackgen's secrets
contract and whichever manager the backing axis names. This skill covers
detection only — including the scanner half of that contract's
encrypt-into-git allowance: allowlist the committed ciphertext by path, never
by rule, and never a decryption identity.
