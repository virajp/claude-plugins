// Membership and the member url (doctor SKILL.md §1, assets/membership.md).
// The base lists its members in bootstrap's repo.members; each submodule or
// sibling member back-links through its own repo.home (D7, D25). A folder
// member is part of the base's tree: no url, no home to check (D17). Every
// row is repo-level.

import { existsSync } from "node:fs";
import {
  join,
  resolve,
} from "node:path";
import { homeOf } from "./base.mjs";
import {
  isWorkTree,
  row,
} from "./util.mjs";

const MEMBERSHIP = join(".config", "vwf-membership.yaml");

export function membershipRows({ base, topology, members }) {
  const rows = [];
  if (topology === "multi-repo" && members.length === 0) {
    rows.push(
      row(
        "membership",
        "blocking",
        null,
        base,
        "a multi-repo topology with no members in bootstrap's repo.members",
        "/vwf:setup",
      ),
    );
  }
  for (const member of members) {
    const name = member.name;
    if (member.type === "folder") {
      continue; // a folder of the base's tree
    }
    if (member.url === null) {
      rows.push(
        row(
          "member-url",
          "blocking",
          null,
          name,
          `member ${name} has no url in repo.members, so an absent member cannot be cloned`,
          "/vwf:setup",
        ),
      );
    }
    const dir = resolve(base, member.folder);
    if (!isWorkTree(dir)) {
      continue; // presence is not a finding
    }
    if (homeOf(dir) === null) {
      rows.push(
        row(
          "membership",
          "drift",
          null,
          name,
          `member ${name} has no repo.home back-link to the base`,
          `from the base repo, run setup:configs --${name}`,
        ),
      );
      continue;
    }
    if (existsSync(join(dir, MEMBERSHIP))) {
      rows.push(
        row(
          "membership",
          "drift",
          null,
          name,
          `member ${name} still carries .config/vwf-membership.yaml, which nothing reads since its repo.home resolves`,
          "on consent, doctor deletes it and commits the deletion in the member through /vwf:git-workflow",
        ),
      );
    }
  }
  return rows;
}
