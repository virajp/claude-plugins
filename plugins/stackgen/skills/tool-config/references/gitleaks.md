# gitleaks — the secret scanner

gitleaks keeps credentials out of the repo, in two scans at two moments. The
**staged change** is scanned on every commit, which is what stops a credential
entering history. **History** is scanned once, deliberately, because it
answers a different question — what is already in there — and running it on
every commit buys nothing and costs the gate its speed.

This reference is the `gitleaks` row of the skill's tool table. The contract
every tool shares — the argument shapes, the block markers, drift, removal and
the lock record — is [the skill's](../SKILL.md); what follows is gitleaks' own.
The file it lands is under
`${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/gitleaks/`, laid out as it
lands under the repo root.

## 1. What `all` lands

| Landed                  | As                                                   |
| ----------------------- | ---------------------------------------------------- |
| `.config/gitleaks.toml` | the frame, the base unmarked, a `gitleaks` block in `paths` |

`[extend] useDefault = true`, the commented template for a custom rule, and
`[allowlist] paths`. It reads none of `all`'s keys. By
[the skill's](../SKILL.md#blocks) per-position rule the base's allowlist
entries are the `gitleaks` block inside `paths`, a requester's block follows
it there, and the rest below the frame is the base's, unmarked.

**`useDefault` is load-bearing, and its absence is a silent hole.** A
`--config` file **replaces** gitleaks' built-in ruleset rather than adding to
it, so without `[extend]` the rules in the file become the entire scan — a repo
that added one vendor key pattern would stop detecting the ~170 credential
shapes gitleaks knows, and both gates would keep reporting green. The dangerous
state is not "no config"; it is a config somebody wrote by hand to add one rule.
Landing the file with `[extend]` already in it makes the first custom rule an
addition by construction. Precedence, highest first: `--config`, then
`GITLEAKS_CONFIG`, then `<target>/.gitleaks.toml`.

**A custom rule** is one per credential shape this repo can leak that the
defaults do not know — in practice a vendor's own key format — with an `id`, a
`description` and a `regex` anchored tightly enough not to fire on a UUID. It
is the user's, written by hand outside every block.

## 2. The allowlist

`[allowlist] paths` lists the **generated trees** `gitleaks dir` would walk
anyway: `dir` mode reads the filesystem and does not honour `.gitignore`, and
the default ruleset's `generic-api-key` fires on any long high-entropy string —
a cache index full of hashes fails the gate for a hash, not a credential. The
base's `gitleaks` block holds `graphify-out`, `build` and `dist`; every other
entry arrives through
[`all add exclude generated`](../SKILL.md#the-one-cross-tool-verb) and
nothing else, so the list is a subset of the formatters' set by construction:

```toml
[allowlist]
paths = [
  # >>> gitleaks
  '''(^|/)build/''',
  '''(^|/)dist/''',
  '''(^|/)graphify-out/''',
  # <<< gitleaks
  # >>> uv
  '''(^|/)\.venv/''',
  # <<< uv
]
```

A directory `<d>` is `'''(^|/)<d>/'''` and a file glob is spelled as
[the hook config's](pre-commit.md#3-the-global-exclude) regex is, each a TOML
literal string. The list is **narrower** than the formatters' on purpose: the
scanner already skips `.git`, `node_modules` and the named lockfiles through
upstream's defaults, and `.claude/` is authored source a scanner must scan. An
exclude added without `generated` never reaches it. Widening it to tracked
source is how a scanner quietly stops scanning.

**A gitignored `.env` is not on the list.** `code:sec`'s full scan skips one
through a run-time overlay that extends this file for `dir` mode alone; an
entry here would be mode-wide and blind the staged gate to a `.env` someone did
stage. The flip side: the full scan is not history coverage for `.env` files.
Only the staged gate reads them, and one already committed — a tracked
`.env.example`, or one that got past the hook — is found by a by-hand
`gitleaks git` run over history.

**Allowlist a finding by fingerprint or by path, never by rule.** A fingerprint
silences one known finding at one location; disabling the rule that found it
blinds the scanner across the whole repo, including the file someone adds next
week, and nothing reports that it happened. A test fixture, an example value,
the committed ciphertext of an encrypt-into-git secret — each is the user's
line, by hand, and **every entry carries why**: an unexplained fingerprint is
indistinguishable from a real secret somebody got tired of looking at.

## 3. The verbs

| Instruction          | Writes to                                     |
| -------------------- | --------------------------------------------- |
| `remove <requester>` | `.config/gitleaks.toml` — its allowlist block |

Nothing else. The allowlist is written only through
[`all add exclude generated`](../SKILL.md#the-one-cross-tool-verb);
`gitleaks add allowlist` or `gitleaks add exclude` is refused, naming it.

## 4. Running it

`code:sec` is the only thing that calls gitleaks:

```sh
mise run code:sec            # gitleaks dir . --config .config/gitleaks.toml --redact=50, plus grype
mise run code:sec --staged   # gitleaks git --staged over the index; what the `sec` hook runs
gitleaks git . --log-opts="--all"   # the whole history, once, by hand
```

`--redact` truncates the matched value: a scanner that prints the secret it
found has published it a second time, into CI logs usually more widely read
than the repo. **The hook runner carries no gitleaks hook of its own** — its
`sec` hook is `mise x -- mise run code:sec --staged`, so the commit gate and
the task are one configuration, and the binary is the one mise pins. Where the
binary is absent the task warns and continues.

## 5. A hit is a credential to rotate

1. **Rotate it first.** It is compromised from the moment it was committed —
   pushed or not, a local clone is a copy.
2. **Then** remove it from the code and route it through the secrets manager:
   secrets reach a process as environment variables, injected at the process
   boundary.
3. Rewriting history is optional and usually not worth it: it does not
   un-compromise a rotated credential, and it breaks every existing clone.

Deleting the line is **not** a fix — the value is still in history and still
valid. **A baseline on an existing repo**: scan history once, rotate everything
real it finds, then allowlist what remains by fingerprint, each entry carrying
why. A baseline that allowlists by rule, or is adopted before the rotation,
turns a backlog into a permanent blind spot.

## 6. The migration

`all` on a repo the retired gitleaks gate pack shaped: its allowlist entries
become the `gitleaks` block where the base holds them, and stay user lines
until a pack's `all add exclude generated` claims them — `target`, which no
pack produces, offered for removal; its lockfile entry is re-recorded as
`tool-config/gitleaks@<version>`; and the repo-local gitleaks skill under
`.claude/skills/gitleaks/` is deleted where it still matches its record, kept
and reported where it does not.
