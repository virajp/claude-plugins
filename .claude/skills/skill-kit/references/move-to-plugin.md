# Move this skill into vwf

The skill starts repo-local, and moves to `plugins/vwf/skills/skill-kit/` when
mature.

## Built for the move

- The folder holds everything, and scripts find their files from their own
  location.
- `assets/config.json` is the one file with facts of this repo.
- Scripts use node built-ins only, so they obey checker rule 16.
- `<skill-kit>` in the workflows stands for the folder path.

## Steps

1. Run `git mv` on the folder.
2. Replace `<skill-kit>` with `${CLAUDE_PLUGIN_ROOT}/skills/skill-kit`.
3. Make `--root` and the config work for any repo, because an installed plugin
   must not hold repo facts.
4. Repoint the path constant in `scripts/src/skill-kit.test.ts`.
5. Run `mise run p:plugins:check`, and fix each finding.
6. Reconcile `readme.md`, `CLAUDE.md` and the manual, because this becomes
   plugin behavior.

## Limits after the move

- Checker rule 10 refuses a named technology in vwf prose. Move such examples to
  the config, or list alternatives.
- Checker rule 6 refuses a plugin-root path across plugins. The links to
  `artifact-doctrine.md` and `kinds.md` need a skill call or an own copy of the
  rules.
- vwf depends on stackgen, so stackgen's generator cannot call a vwf skill. The
  generator keeps `artifact-doctrine.md` as its source.
