GAP 2026-10-07 ★2 | vwf capability tokens | a capability token for secrets is
parked and open | the split by environment makes the case stronger

**Source plan** `2026-10-07-fnox-dev-only-doctrine`.

The plan parked a vwf capability token for secrets. The plan
`2026-09-06-cloudflare-media-messaging-secrets` parked it first. fnox is now
development-only, CI takes secrets from the forge, and staging and production
take them from the cloud provider. The split by environment is the argument for
a token. It is vwf's change to make, not a pack's. No taxonomy entry for it
exists in `plugins/stackgen/assets/taxonomy.md` at the time of this record.
