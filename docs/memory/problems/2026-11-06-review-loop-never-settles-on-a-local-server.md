PROBLEM 2026-10-08 ★3 | execute review rows | the review loop raised a new
finding every round on the new loopback server script, so the convergence guard
paused the run — the user authorised up to 7 more security rounds with the guard
off | fix found, then clean

**Source plan** `2026-10-08-mockups-served-at-a-url`,
`2026-10-08-execute-renders-served-at-a-url`.

What happened:

- Both plans added a loopback HTTP server (`serve.mjs`) and a link checker.
  The code review and the security review each found something new in every
  round, and each fix held. The code review ended at the guard (round 3 raised
  5 findings against 4 in round 2) and left many low residuals as `contested`.
  A fix also made one finding reappear half fixed in the next round.
- Security findings are exempt from the cap and never take the `contested`
  exit. So the guard became a pause that needed a ruling.
- The findings were small and concrete: a click that followed `//host`; a JSON
  write and a `--url-file` write that followed a symlink; an href that is an
  HTML entity of a path outside the server; a YAML writer that left DEL and C1
  control characters raw.

Rulings:

- The user (relayed by the `/vwf:execute all` loop) authorised up to 7 more
  rounds, with the guard off for them, ending when SECURITY is clean or after
  the last round. Round 5 (mockups plan) and round 4 (renders plan) came back
  clean. Finding counts by round were 3, 1, 1, 2, 0 and 1, 1, 1, 0.
- The user later ruled all contested findings fixed, with `serve.mjs` and
  `links.mjs` sharing one parser, `lib/link.mjs`. A ruling to fix one
  regression alone was reversed the same day, once the finished work was found.

Lesson: a new script that parses input and serves files draws one low finding
per round for several rounds. When the guard pauses a run on a security finding,
ask for a round limit with the guard off, not a rule that the finding is out of
scope. The loop, not the contract, is the suspect when the count does not fall.
