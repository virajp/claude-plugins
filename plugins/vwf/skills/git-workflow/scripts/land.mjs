#!/usr/bin/env node
// Land a change on a protected branch (develop or main) the one way vwf
// allows: its own worktree and local branch, a commit there, a merge into the
// branch, a push, then the worktree and branch removed. When pre-commit
// refuses the merge, a pull request instead. See lib/land.mjs.
//
//   node land.mjs open <repo dir> --into <branch> --name <branch name>
//   node land.mjs close <worktree> --into <branch> --message <message>
//   node land.mjs abandon <worktree>
//   node land.mjs finish <repo dir> --branch <branch name> --into <branch>
//
// open makes the worktree and prints {worktree, branch, into, base}; the caller
// then edits files in it. close commits every change in the worktree, merges
// and pushes, and prints {landed: true, commit[, warning]}, or {landed: false,
// kind: pr|conflict|failed, ...}. On kind pr the worktree is removed and the
// branch kept: wait for the pull request to merge, then run finish. On
// conflict or failed the worktree and branch stay: fix and close again, or
// abandon. finish deletes the branch, local and remote, after its pull request
// merged.
//
// Exit 0 when open, close (landed), abandon or finish succeed; 1 when close
// does not land; 2 on a usage error or a git failure, with nothing on stdout.

import { abandon, close, finish, LandError, open } from "./lib/land.mjs";

const USAGE = `usage:
  land.mjs open <repo dir> --into <branch> --name <branch name>
  land.mjs close <worktree> --into <branch> --message <message>
  land.mjs abandon <worktree>
  land.mjs finish <repo dir> --branch <branch name> --into <branch>
`;

const FLAGS = {
  open: ["--into", "--name"],
  close: ["--into", "--message"],
  abandon: [],
  finish: ["--branch", "--into"],
};

function usage(message) {
  process.stderr.write(`land.mjs: ${message}\n${USAGE}`);
  process.exit(2);
}

const [verb, dir, ...rest] = process.argv.slice(2);
if (!(verb in FLAGS)) {
  usage(verb === undefined ? "no verb" : `unknown verb ${verb}`);
}
if (dir === undefined || dir.startsWith("--")) {
  usage(`${verb} needs a directory`);
}
const flags = {};
for (let i = 0; i < rest.length; i += 2) {
  const [name, value] = [rest[i], rest[i + 1]];
  if (!FLAGS[verb].includes(name) || name in flags) {
    usage(`${verb} takes no ${name}`);
  }
  if (value === undefined || value === "" || value.startsWith("--")) {
    usage(`${name} needs a value`);
  }
  flags[name] = value;
}
for (const name of FLAGS[verb]) {
  if (!(name in flags)) {
    usage(`${verb} needs ${name}`);
  }
}

try {
  const result = verb === "open"
    ? open({ repo: dir, into: flags["--into"], name: flags["--name"] })
    : verb === "close"
    ? close({ worktree: dir, into: flags["--into"], message: flags["--message"] })
    : verb === "abandon"
    ? abandon({ worktree: dir })
    : finish({ repo: dir, branch: flags["--branch"], into: flags["--into"] });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(verb === "close" && !result.landed ? 1 : 0);
} catch (e) {
  if (e instanceof LandError) {
    process.stderr.write(`land.mjs ${verb}: ${e.message}\n`);
    process.exit(2);
  }
  throw e;
}
