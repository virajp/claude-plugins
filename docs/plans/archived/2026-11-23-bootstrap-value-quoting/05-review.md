# U5 — Review: U1 to U4 and U8

## Scope

U1 to U4 and U8, the branch delta since the branch base. The plan lands
runnable code (D7, D24): the remedies of doctor's `stack.mjs`. The units are
`edit` units, so this review runs the security half only: `/security-review`
and the security reviewer.

Focus:

- every bootstrap write in `plugins/vwf/skills`, `plugins/stackgen/skills` and
  `plugins/vwf/assets` that carries a value or a name follows
  `## Passing values` (D3, D4, D5), with no write missed and no rule that a
  model could read two ways;
- the forms that show only placeholders cite the rule (D20);
- the escape `'\''` is correct for a POSIX shell and for fish, and a value
  with a backslash or a control character is refused (D30);
- the key-name check rejects `.` and every shell metacharacter;
- a bad name stops only its own write (D4), skips one release key (D22), or
  stops one repo's migration step before any write (D23), and never loses a
  value;
- the `stack.mjs` remedies print no command for a bad project or tool name
  (D6, D13), and the script stays dependency-free.
