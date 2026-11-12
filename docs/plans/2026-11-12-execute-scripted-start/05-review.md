# U5 — Review: the three scripts and the skill prose

## Scope

> D11: "The plan lands three runnable scripts. One review unit after the last
> script unit and before the docs unit covers every earlier unit."

> D14: "the review unit over edit units runs the security half only
> (/security-review and the security reviewer)".

U1, U2, U3 and U4: the queue verbs and the YAML reader, the skill and asset
prose, the checks script, and the start script. The branch delta since the
branch base. All covered units are `edit` units (D14), so this review runs the
security half: `/security-review` and the security reviewer. Pay attention to
every child process (argument arrays, no shell string except the documented
probe), the git procedure (no force, no `--no-verify`, every exit restores the
checkout), and paths read from config files.
