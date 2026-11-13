// Membership both directions and the member url (doctor SKILL.md §1,
// assets/membership.md). Every row is blocking and repo-level. The
// file-not-listed half checks only the repo the run started in (D9 (c)).

import { dirname, join, resolve } from "node:path";
import { repoRoot } from "./base.mjs";
import { git, isObject, isWorkTree, readYaml, real, row } from "./util.mjs";

const MEMBERSHIP = join(".config", "vwf-membership.yaml");

/** The main checkout of a linked worktree, else the repo root itself. */
function mainCheckout(root) {
  const gitDir = git(root, ["rev-parse", "--path-format=absolute", "--git-dir"]);
  const common = git(root, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  return gitDir.ok && common.ok && gitDir.out !== common.out ? dirname(common.out) : root;
}

export function membershipRows({ base, config, start }) {
  const rows = [];
  const members = Array.isArray(config.members) ? config.members.filter(isObject) : [];
  const product = config.product?.name;

  if (config.topology === "multi-repo") {
    if (members.length === 0) {
      rows.push(
        row(
          "membership",
          "blocking",
          null,
          base,
          "a multi-repo topology with no members: list",
          "/vwf:setup",
        ),
      );
    }
    for (const member of members) {
      const name = member.name ?? member.path ?? "?";
      if (typeof member.url !== "string" || member.url === "") {
        rows.push(
          row(
            "member-url",
            "blocking",
            null,
            name,
            `member ${name} has no url:, so an absent member cannot be cloned`,
            "/vwf:setup",
          ),
        );
      }
      if (typeof member.path !== "string") {
        continue;
      }
      const dir = resolve(base, member.path);
      if (!isWorkTree(dir)) {
        continue; // presence is not a finding
      }
      const link = readYaml(join(dir, MEMBERSHIP));
      if (link === null) {
        rows.push(
          row(
            "membership",
            "blocking",
            null,
            name,
            `member ${name} carries no .config/vwf-membership.yaml`,
            "/vwf:setup",
          ),
        );
        continue;
      }
      const host = typeof link.host === "string" ? real(resolve(dir, link.host)) : null;
      if (link.product !== product || host !== real(base)) {
        rows.push(
          row(
            "membership",
            "blocking",
            null,
            name,
            `member ${name} back-links to product ${JSON.stringify(link.product ?? null)}`
              + ` at host ${JSON.stringify(link.host ?? null)}, not ${JSON.stringify(product ?? null)}`
              + ` at the base`,
            "/vwf:setup",
          ),
        );
      }
    }
  }

  const root = repoRoot(start);
  if (real(root) !== real(base) && readYaml(join(root, MEMBERSHIP)) !== null) {
    const own = new Set([real(root), real(mainCheckout(root))]);
    const listed = members.some(
      (m) => typeof m.path === "string" && own.has(real(resolve(base, m.path))),
    );
    if (!listed) {
      rows.push(
        row(
          "membership",
          "blocking",
          null,
          root,
          "this repo carries .config/vwf-membership.yaml and the base does not list it under members:",
          "/vwf:setup",
        ),
      );
    }
  }
  return rows;
}
