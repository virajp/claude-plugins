Compare one ledger file with a rewritten skill. You know nothing of the rewrite.

Inputs: `<ledger-file>` and `<new-skill-dir>`.

Read the ledger file, then each file of the new skill. For each entry with
status `pending`, set one status:

- `kept`: the new text holds the same rule, fact, step, condition or example.
  Set `where` to the path from the skill root. Set `quote` to at least 3 words
  of the exact new text that holds it.
- `no-rule`: the block holds no rule, fact, step, condition or example. A
  heading or a transition sentence can qualify. Set `reason`.
- `missing`: the new text has no match, or the match is weaker.

Rules:

- A rule with a changed condition, order, severity or actor is `missing`.
- A script can hold a rule. Then `where` is the script, and `quote` is the code
  that enforces it.
- A link to another skill can hold a rule. Read the target first. If the target
  holds the rule, quote the link line.
- Entries with the kind `file` hold a whole old file. Compare each rule in it.
- Doubt means `missing`.
- Set no other status. The user decides each drop.
- Change only the ledger file, and keep each `id` and `text` as they are.

Return the count per status, and one line for each `missing` entry.
