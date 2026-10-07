# fnox — integration & access shape

## Where the boundary sits

**Entirely outside the process.** fnox resolves secrets, sets them as
environment variables, and executes the task; the application never links a
client, never opens a config file, and never learns which provider backed a
given value. That is the outranking rule of stackgen's secrets contract, and
it is the whole integration.

The seam is one line in the task runner:

```sh
fnox exec -- mise run dev
```

Everything the product does downstream reads `process.env` — including its
tests, which therefore need no secrets manager at all. A test that shells out
to fnox has moved the boundary into the product.

## Which environment, which source

fnox serves the **development** environment alone. CI reads the forge's own
secret variables (GitHub or GitLab) and runs the same task without fnox;
staging and production read the cloud provider's store and run neither mise
nor fnox. So there is no deploy-time `fnox exec`, no production profile and
no fnox credential on a runner.

## The credentials fnox itself uses

**The keychain** needs none beyond the developer's own login session: values
sit in the OS keychain under the shipped provider's `service` and `prefix`,
and `fnox.toml` holds only the entry names.

**A cloud reference** authenticates the way that store's own CLI does — the
developer's cloud login, an SSO session, a vault token in their shell. fnox
carries no credential of its own, and none is ever written into the repo.
Revoking that login is how a developer's cloud-referenced access ends.

## What `environment.md` records

Names and issuers, never values — the contract is explicit that this stays
true whichever tool is picked, and `fnox list` makes it cheap
([contract satisfaction](contract-satisfaction.md), clause 4).

The **issuer** is the one place a real product name belongs, because it is a
fact about the world rather than a stack decision. So a development entry
reads `fnox (keychain)` or `fnox → <cloud store>` — for example
`fnox → AWS Secrets Manager` — and the CI and deployed entries name the forge
and the cloud provider's store respectively.

Blueprint prose still says **the secrets manager** and names nothing.

## Local and throwaway credentials

Development values are throwaways pointing at the local stack, and they are
**still declared by name only** — `fnox.toml` admits no value, throwaway or
not. Non-secret configuration that merely varies by environment (a base URL,
a log level, a port) is not a secret and does not belong in `fnox.toml`; it
goes in the mise env.

That split is worth holding: a secrets file containing things that are not
secrets is a file people stop treating carefully.
