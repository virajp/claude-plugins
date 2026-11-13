// runChecks({cwd, projects}) → {base, projects, findings}: the blocking set
// of doctor (D16, LSP parked by D22). `projects` absent checks every registry
// project; [] runs the repo-level checks only (D37).

import { loadProduct } from "./base.mjs";
import { membershipRows } from "./membership.mjs";
import { miseRows, projectRows, repoPinRows } from "./stack.mjs";
import { ChecksError, isDir, isObject } from "./util.mjs";

export { ChecksError } from "./util.mjs";

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

  const findings = [
    ...rows,
    ...membershipRows({ base, config, start }),
    ...miseRows({ base, config }),
    ...repoPinRows({ config }),
  ];
  if (registry !== null) {
    findings.push(...projectRows({ base, config, registry, scope }));
  }
  return { base, projects: scope, findings };
}
