// runChecks({cwd, projects}) → {base, projects, findings}: the blocking set
// of doctor (D16) and its degraded rows (R5b D8), with the degraded lsp-check
// rows of bootstrap's code:lsp:check, run once from the base root
// (lib/lsp.mjs). `projects` absent checks every registry project; [] runs the
// repo-level checks only (D37). No network read but the one of
// code:lsp:check, which runs `bootstrap lsp --json`.

import { loadProduct } from "./base.mjs";
import {
  BootstrapError,
  configGet,
  readMembers,
} from "./bootstrap.mjs";
import { lspCheckRows } from "./lsp.mjs";
import { membershipRows } from "./membership.mjs";
import {
  addonRows,
  miseRows,
  oldPackRows,
  projectRows,
  repoPinRows,
} from "./stack.mjs";
import {
  ChecksError,
  isDir,
  isObject,
} from "./util.mjs";

export { ChecksError } from "./util.mjs";

/** repo.topology and repo.members of the base, through bootstrap (D7). */
function repoFacts(base) {
  try {
    return { topology: configGet(base, "repo.topology"), members: readMembers(base) };
  } catch (error) {
    if (error instanceof BootstrapError) {
      throw new ChecksError(error.message);
    }
    throw error;
  }
}

export function runChecks({ cwd, projects } = {}) {
  const start = cwd ?? process.cwd();
  if (!isDir(start)) {
    throw new ChecksError(`not a directory: ${start}`);
  }
  const { base, config, registry, rows } = loadProduct(start);
  if (base === null) {
    return { base: null, projects: [], findings: rows };
  }
  const known = (Array.isArray(registry?.projects) ? registry.projects : [])
    .filter(isObject)
    .map((p) => p.name);
  let scope;
  if (projects === undefined || projects === null) {
    scope = known;
  } else {
    if (registry !== null) {
      const unknown = projects.filter((p) => !known.includes(p));
      if (unknown.length > 0) {
        throw new ChecksError(`not a registry project: ${unknown.join(", ")}`);
      }
    }
    scope = registry === null ? [] : [...projects];
  }

  const { topology, members } = repoFacts(base);
  const findings = [
    ...rows,
    ...membershipRows({ base, topology, members }),
    ...miseRows({ base, config }),
    ...lspCheckRows({ base }),
    ...repoPinRows({ config }),
    ...oldPackRows(base, Array.isArray(config.stacks) ? config.stacks.filter((s) => typeof s === "string") : []),
    ...addonRows({ base, config }),
  ];
  if (registry !== null) {
    findings.push(...projectRows({ base, config, members, registry, scope }));
  }
  return { base, projects: scope, findings };
}
