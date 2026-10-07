# fnox — cost shape

Never dollar figures: they age badly and are wrong per region anyway. What
follows is where the cost accrues and what turns a small change into a large
one.

## The keychain has no bill

fnox is a binary and the storage is each developer's own OS keychain. There
is no per-seat charge, no per-secret charge and no API to be billed for.

**The cost is operational, and it is paid per person.** A joiner populates
their own keychain, one `fnox set` per declared name, from wherever the team
hands out development credentials. A leaver's development credentials are
revoked at their source. Neither touches the repo.

## A cloud reference inherits a bill

Pointing a secret at AWS Secrets Manager, Vault, 1Password or any other
backend means that backend's pricing applies, typically as a per-secret
standing charge plus a per-request charge. The trap is the **request** half:

- **`fnox exec` resolves on every invocation.** A task run in a loop, a test
  suite that spawns a process per case, or a watch mode that restarts on
  every file save turns one secret into thousands of API calls a day. The
  standing charge is predictable; this is the line that surprises people.

The mitigation is the boundary the contract already mandates: resolve once,
at the outermost task, and let everything downstream read the environment.
`fnox exec -- mise run test` pays once; a test harness that invokes
`fnox exec` per case pays per case for the same values.

## The cost of the mixed shape

Keeping most development secrets in the keychain and referencing only the
ones a team must share centrally is usually the cheapest correct answer: the
store's standing charge covers only the secrets that warrant it. It is a
per-secret field, so the split costs nothing to change.

CI and the deployed environments carry no fnox cost at all — their secrets
are the forge's and the cloud provider's, billed there.
