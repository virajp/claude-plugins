# U4 — vwf prose that names browser review

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/agents/mockup-generator.md`,
  `plugins/vwf/assets/templates/project-claude.md`,
  `plugins/vwf/skills/plan/references/delta-checks.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** each owned file, top to bottom.

## Ruling

> - Decision D4: One server per flow, all its platforms. `GET /` returns an
>   index page of every platform and screen.
> - Decision D6: The files on disk stay self-contained with no JS. The server
>   injects the overlay into HTML as it serves it; the index page is built in
>   memory, never written.
> - Decision D7: When `node` is not on the path, the skill says so with the
>   remedy and hands over the absolute file paths as today.

## Edits

1. **`plugins/vwf/agents/mockup-generator.md`** — line 15 ("in their own
   browser"): the user reviews the files through the local review server the
   calling skill starts. Line 54's rule (inline `<style>`, no external assets,
   no JS) stays, with one clause: the server adds the review overlay when it
   serves a page, so the generator never writes JS. Tools (line 8) are
   unchanged.
2. **`plugins/vwf/assets/templates/project-claude.md:20-21`** — the browser
   review wording says the mockups are reviewed at the local URL `/vwf:mockups`
   prints. This template lands in user repos: cite no plugin-relative path (rule
   13).
3. **`plugins/vwf/skills/plan/references/delta-checks.md:72`** — the same change
   of wording, where it names browser review.

## Verification

- `mise run p:plugins:check` — green (rule 13 over the template).
- `grep -n 'own browser' plugins/vwf/agents/mockup-generator.md` — no hit.

## Guardrails

- Change only the review wording; no other edit in these files.
- `plugins/**/*.md` is not formatted — match the fold width by hand.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`docs: vwf prose — mockups are reviewed at the local URL`
