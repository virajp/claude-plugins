GAP 2026-09-05 ★2 | website follow-ups, parked and open | four site points were
parked at launch and none was done — each is optional | PR previews, site
dogfooding, a render task and site unit tests

**Source plan** `2026-09-05-website`.

`.github/workflows/site.yml` has a build job and a tag-only deploy job. The
`p:site:*` tasks are `build`, `check`, `dev`, `icons`, `release` and `version`.
`site/CLAUDE.md` says the site is outside `vitest.config.mts`. So these stay
open:

- **Pull request previews.** Use `wrangler versions upload` on pull requests.
  Wait until the first deploy exists and the API token scope is known.
- **Dogfood the packs.** Build `site/` through the stackgen
  `typescript-astro-react` bundle instead of hand-written config. Check the
  bundle against Astro 6 first.
- **Render `social-preview.png` by a task** from `social-preview.html`. A person
  renders it by hand today. The readme header image depends on it.
- **Unit tests for `site/`.** `remark-docs-links.ts` and `check-links.ts` are
  covered only by the build and the link checker.

Facts for the first deploy that the plan recorded: the repository needs
`CLOUDFLARE_API_TOKEN` (Workers Scripts edit, plus DNS edit for the custom
domain) and `CLOUDFLARE_ACCOUNT_ID` as secrets, and `virajp.dev` must be a zone
on that account. The design source is the Claude Design project
`bb1f0a69-4c72-4f0e-91fd-186a963b568b`; fetch its three `.dc.html` files with
`DesignSync get_file` when the local copy is gone.
