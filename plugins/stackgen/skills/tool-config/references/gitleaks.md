# gitleaks — the secret scanner

gitleaks keeps credentials out of the repo, in two scans at two moments. The
**staged change** is scanned on every commit, which is what stops a credential
entering history. **History** is scanned once, deliberately, because it
answers a different question — what is already in there — and running it on
every commit buys nothing and costs the gate its speed.

This reference is gitleaks' part of the universal files tool-config lands.
What every file shares — the values, the render, the rows, the six marked
files and drift — is [the skill's](../SKILL.md); what follows is gitleaks'
own.

## 1. What lands

| File                    | As                                                       |
| ----------------------- | -------------------------------------------------------- |
| `.config/gitleaks.toml` | an asset, marked — the allowlist's `paths` between the pair |

`[extend] useDefault = true`, the commented template for a custom rule, and
`[allowlist] paths`, whose entries sit between `# >>> tool-config` and
`# <<< tool-config`. Once the file is in the repo only those lines are
rewritten ([the marked files](../SKILL.md#the-marked-files)): a custom
`[[rules]]` table, a fingerprint, a path of the repo's own below the closing
marker — every line outside the pair survives every render.

**`useDefault` is load-bearing, and its absence is a silent hole.** A
`--config` file **replaces** gitleaks' built-in ruleset rather than adding to
it, so without `[extend]` the rules in the file become the entire scan — a repo
that added one vendor key pattern would stop detecting the ~170 credential
shapes gitleaks knows, and both gates would keep reporting green. The
dangerous state is not "no config"; it is a config somebody wrote by hand to
add one rule. Landing the file with `[extend]` already in it makes the first
custom rule an addition by construction. Precedence, highest first:
`--config`, then `GITLEAKS_CONFIG`, then `<target>/.gitleaks.toml`.

**A custom rule** is one per credential shape this repo can leak that the
defaults do not know — in practice a vendor's own key format — with an `id`, a
`description` and a `regex` anchored tightly enough not to fire on a UUID. It
is the repo's own, written by hand outside the marker pair.

## 2. The allowlist

`[allowlist] paths` lists the **generated trees** `gitleaks dir` would walk
anyway: `dir` mode reads the filesystem and does not honour `.gitignore`, and
the default ruleset's `generic-api-key` fires on any long high-entropy string —
a cache index full of hashes fails the gate for a hash, not a credential. The
shipped block holds every stack's generated trees, whether or not the repo
uses that stack: `.build`, `.swiftpm`, `.turbo`, `.venv`, `Derived`,
`DerivedData`, `build`, `dist`, `graphify-out`, `node_modules`.

Each entry is [the hook config's](pre-commit.md#3-the-global-exclude) regex
for the path, as a TOML literal string — a directory `<d>` as
`'''(^|/)<d>/'''`. The list is a **subset** of
[the exclusion set](dprint.md#3-the-exclusion-set), and the toolkit's checker
holds it to that: no lockfile, no `.claude/`, no `.git/`. The scanner already
skips `.git` and the named lockfiles through upstream's defaults, and
`.claude/` is authored source a scanner must scan. Widening the list to
tracked source is how a scanner quietly stops scanning.

**A gitignored `.env` is not on the list.** `code:sec`'s full scan skips one
through a run-time overlay that extends this file for `dir` mode alone; an
entry here would be mode-wide and blind the staged gate to a `.env` someone did
stage. The flip side: the full scan is not history coverage for `.env` files.
Only the staged gate reads them, and one already committed — a tracked
`.env.example`, or one that got past the hook — is found by a by-hand
`gitleaks git` run over history.

**Allowlist a finding by fingerprint or by path, never by rule.** A
fingerprint silences one known finding at one location; disabling the rule
that found it blinds the scanner across the whole repo, including the file
someone adds next week, and nothing reports that it happened. A test fixture,
an example value, the committed ciphertext of an encrypt-into-git secret —
each is the repo's own line, by hand, outside the marker pair, and **every
entry carries why**: an unexplained fingerprint is indistinguishable from a
real secret somebody got tired of looking at.

## 3. Running it

`code:sec` is the only thing that calls gitleaks:

```sh
mise run code:sec            # gitleaks dir . --redact=50 (with the .env overlay), plus grype
mise run code:sec --staged   # gitleaks git --staged over the index; what the `sec` hook runs
mise x -- gitleaks git . --config .config/gitleaks.toml --log-opts="--all"   # the whole history, once, by hand
```

`--redact` truncates the matched value: a scanner that prints the secret it
found has published it a second time, into CI logs usually more widely read
than the repo. **The hook runner carries no gitleaks hook of its own** — its
`sec` hook is `mise x -- mise run code:sec --staged`, so the commit gate and
the task are one configuration, and the binary is the one mise pins. Where the
binary is absent the task warns and continues.

## 4. A hit is a credential to rotate

1. **Rotate it first.** It is compromised from the moment it was committed —
   pushed or not, a local clone is a copy.
2. **Then** remove it from the code and route it through the secrets manager:
   secrets reach a process as environment variables, injected at the process
   boundary.
3. Rewriting history is optional and usually not worth it: it does not
   un-compromise a rotated credential, and it breaks every existing clone.

Deleting the line is **not** a fix — the value is still in history and still
valid. **A baseline on an existing repo**: scan history once, rotate
everything real it finds, then allowlist what remains by fingerprint, each
entry carrying why. A baseline that allowlists by rule, or is adopted before
the rotation, turns a backlog into a permanent blind spot.
