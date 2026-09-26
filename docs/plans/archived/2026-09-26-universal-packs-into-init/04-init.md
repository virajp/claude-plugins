# U4 — init lands its own packs, keeps its own lock, gates on versions

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `init/SKILL.md` whole; `references/new-repo.md` :70–200,
  :400–460, :600–720; `references/existing-repo.md` :1–120, :400–620,
  :1050–1150; `references/fragments-and-sections.md` :90–215, :320–340;
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`
  :50–260 (read only — the copy rules init takes over); index.md's Facts.

## Ruling

> - Decision 3: init lands its own packs itself: the materializer's copy rules
>   (skip `_<name>`, `p/_project` rename, root allowlist, fragments) and the
>   `answers:` conditional evaluation that apply to them move into init's
>   references.
> - Decision 4: init records what it lands in `.claude/vwf/init.lock.yaml`, the
>   stackgen entry shape, `source: init/<pack>@<vwf version>`. The stackgen lock
>   keeps only stackgen packs.
> - Decision 5: `.config/vwf.yaml` gains `min_versions` (keys `vwf` and
>   `stackgen`) — the plugin versions that shaped the repo, raised by each init
>   or setup run to the versions it ran with. setup, init and doctor check it
>   first: an installed version older than recorded stops the run and offers,
>   with consent, `claude plugin marketplace update virajp-plugins` then
>   `claude plugin update <name>`, then asks for a session restart. The user:
>   *"The config file must contain the minimum version of vwf & stackgen
>   required to run the setup or init. If the version mismatches, ask user for
>   upgrade and do it with user's consent"*.
> - Decision 6: A path whose recorded owner no longer ships it, while another
>   owner now does: unedited → the new owner's content lands and the record
>   moves to the new owner's lock; edited → a replace-or-keep row labelled
>   `owner changed: <old> → <new>`. The old owner's record is always removed.
> - Decision 11: Any sentence a unit adds is short.

## Edits

1. **The charter** (`SKILL.md:5-9`, :40–89) — init owns and lands the six packs
   under `packs/`; the "names no tool" wording becomes: init's own packs name
   their tools; everything else init does stays technology-free.
2. **Landing** — replace the three adapter calls (`new-repo.md:80-110`,
   `SKILL.md:745-771`) with init landing `packs/{mise}`, then
   `{dprint,gitleaks,grype,pre-commit}`, then `{repo-hygiene}`, applying the
   copy rules and `answers:` conditionals now written in a new
   `references/landing.md` (moved from the materializer, init-scoped). The
   secrets provider is still fetched from stackgen. The no-adapter halt
   (`SKILL.md:290-310`) applies only to that fetch.
3. **Lock** — every mention of the adapter's lockfile for these files
   (`SKILL.md:214-215`, :763–767; `existing-repo.md:436-443`, :520–528,
   :1130–1145; `fragments-and-sections.md:102`) reads and writes
   `.claude/vwf/init.lock.yaml`; `shaped` mode is detected from that lock (or,
   on a repo shaped before, the stackgen lock recording the old slugs).
4. **Version gate** — first step of the run; and init writes `min_versions`
   alongside its three config keys (`SKILL.md:33-37`, :73–89; the stub
   `new-repo.md:181-196`).
5. **Transfer** — `existing-repo.md`: the reshape's plan rows include decision 6
   for every stackgen-lock record whose path init now ships.
6. **Every other adapter/materializer mention** the Facts list — reworded to the
   new split: init's packs are init's; other stacks still come through the
   adapter.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green
- `grep -n "stack-template" plugins/vwf/skills/init -r` shows only the secrets
  provider fetch and non-universal stacks

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line.
- Touch nothing outside the owned paths (not `init/packs/**`, U1/U6's).
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: vwf init lands its own packs, keeps its own lock and checks versions` —
written by the orchestrator after the wave gate.
