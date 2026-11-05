# rewrite

Makes an existing skill compact, and proves that it keeps every rule.

`<skill>` is the folder of the target skill. A ledger is a folder with one
ledger file per old file. Put the old copy and the ledger in the session's
scratch directory, because neither belongs in the repo.

## Compress in this order

1. Move mechanical work to a script.
2. Remove repeated text, and link to the one owner.
3. Rewrite the prose by [style.md](../references/style.md).
4. Move rare paths to references, and mark them `sometimes`.

A move to a reference that each run loads saves nothing, so mark it `always`.

## Steps

1. Run `node <skill-kit>/scripts/lint.mjs --words <skill>`, and record the
   counts. A table with no `Loads` column adds no file to the always count.
   Say so in the report if the old skill has one.
2. Copy `<skill>` to `<scratch>/old`.
3. Run the extract:
   `node <skill-kit>/scripts/ledger.mjs extract <scratch>/old <scratch>/ledger`
4. Set `metadata.archetype`, and rewrite the skill in place. Follow the
   archetype's sections. Write an absent invocation key with its default value.
   The defaults are `user-invocable: true` and `disable-model-invocation:
   false`.
5. Run the check. A file with unchanged bytes settles by itself, so only changed
   files stay open.

   ```sh
   node <skill-kit>/scripts/ledger.mjs check <scratch>/ledger <skill>
   ```

6. Dispatch one fresh reviewer per open ledger file, with
   [the ledger prompt](../templates/ledger-reviewer-prompt.md). Fill in its two
   absolute paths, and pass nothing else.
7. Run the check again. Read each `no-rule` line that it prints, because the
   script cannot judge a reason.
8. For each `missing` entry, restore the rule in the new text, then set the
   entry to `pending`.
9. Dispatch a reviewer for the ledger files with `pending` entries, then run the
   check. Steps 8 and 9 are one round.
10. Stop after two rounds, and show the open entries to the user.
11. If an entry must go, ask the user. Record `dropped`, the reason and
    `approved: true` only after a yes.
12. Run lint on the skill. Fix each error, and each ST101 warning in a file that
    the rewrite changed.
13. Dispatch a fresh reviewer with
    [the judgment prompt](../templates/judgment-reviewer-prompt.md).
14. Run `--words` again, and report the words before and after, the ledger
    counts, and each dropped rule.

## Ledger entry

| Status    | Needs                                                   | Means                                    |
| --------- | ------------------------------------------------------- | ---------------------------------------- |
| `pending` | nothing                                                 | The reviewer has not read the entry      |
| `kept`    | `where`, a path in the skill; `quote`, at least 3 words | The rule or fact is in the new text      |
| `no-rule` | `reason`                                                | The block holds no rule, fact or example |
| `missing` | nothing                                                 | The new text has no match                |
| `dropped` | `reason`, and `approved: true`                          | The user approved the removal            |

A block of fewer than 3 words, such as a frontmatter line, needs a quote of all
its words.

`extract` refuses a folder that is not empty, so a settled ledger survives.
`check` refuses a ledger that differs from its manifest.

Done when the check exits 0, lint shows no error, and the reviewer returns no
open finding.
