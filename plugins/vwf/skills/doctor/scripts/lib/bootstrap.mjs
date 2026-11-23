// The repo facts bootstrap keeps, read through its CLI (assets/bootstrap-
// contract.md): `bootstrap config get <key> --json` and
// `bootstrap describe --json`, run bare from PATH in the repo they read, each
// envelope's data parsed. A failed call throws BootstrapError with the
// envelope's errors text; an absent binary throws it with the contract's
// install hint. Each caller turns it into its own refusal.

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { isWorkTree } from "./util.mjs";

export const INSTALL_HINT = "bootstrap 4.1.0 or newer is required: install it as bootstrap's README says "
  + "(https://github.com/virajp/bootstrap)";

/**
 * A failed bootstrap call; `message` is the text to refuse with, `code` its
 * exit code (2: no .config/bootstrap/ here), or null when none was read.
 */
export class BootstrapError extends Error {
  constructor(message, code = null) {
    super(message);
    this.name = "BootstrapError";
    this.code = code;
  }
}

/** The data of the envelope `bootstrap <args> --json` prints in `cwd`. */
function call(cwd, args) {
  const what = `bootstrap ${args.join(" ")}`;
  const r = spawnSync("bootstrap", [...args, "--json"], { cwd, encoding: "utf8" });
  if (r.error?.code === "ENOENT") {
    throw new BootstrapError(INSTALL_HINT);
  }
  let envelope = null;
  try {
    envelope = JSON.parse(r.stdout ?? "");
  } catch {
    // no envelope: the stderr text below
  }
  if (envelope === null || typeof envelope !== "object") {
    const why = ((r.stderr ?? "") || (r.error?.message ?? "")).trim();
    throw new BootstrapError(
      `${what} failed in ${cwd}${why ? `: ${why}` : ""}`,
      r.status,
    );
  }
  if (envelope.ok !== true || r.status !== 0) {
    const errors = Array.isArray(envelope.errors) ? envelope.errors : [];
    const text = errors.map((e) => e?.message).filter((m) => typeof m === "string" && m !== "").join("; ");
    throw new BootstrapError(
      `${what} failed in ${cwd}: ${text || `exit ${envelope.code ?? r.status}`}`,
      r.status,
    );
  }
  return envelope.data ?? null;
}

/** The value of `key` in the repo at `cwd`: data.value of the envelope. */
export function configGet(cwd, key) {
  return call(cwd, ["config", "get", key])?.value ?? null;
}

/**
 * The data of `bootstrap describe --json` in the repo at `cwd`: {repo, tools,
 * members, ports, lsp}; a tool is {name, category, values}, its linked
 * projects values.projects, and a port is {name, present}.
 */
export function describe(cwd) {
  const data = call(cwd, ["describe"]);
  return data !== null && typeof data === "object" ? data : {};
}

/**
 * The names of the tools of `category` (languages, package-managers) whose
 * values.projects list names the project, in a describe's data (D9).
 */
export function linkedTools(data, category, project) {
  return (Array.isArray(data.tools) ? data.tools : [])
    .filter((t) => t !== null && typeof t === "object" && t.category === category)
    .filter((t) => Array.isArray(t.values?.projects) && t.values.projects.includes(project))
    .map((t) => t.name);
}

/**
 * A project's folder, relative to the repo that holds it: its
 * repo.projects.<name>.folder there (D11), or null when bootstrap has no entry
 * for it (D26).
 */
export function projectFolder(cwd, name) {
  const folder = configGet(cwd, `repo.projects.${name}.folder`);
  return typeof folder === "string" && folder !== "" ? folder : null;
}

/**
 * The members the base lists in repo.members, as [{name, folder, type, url}];
 * folder defaults to the name, as bootstrap's schema says.
 */
export function readMembers(base) {
  const table = configGet(base, "repo.members");
  if (table === null || typeof table !== "object" || Array.isArray(table)) {
    return [];
  }
  return Object
    .entries(table)
    .filter(([, m]) => m !== null && typeof m === "object" && !Array.isArray(m))
    .map(([name, m]) => ({
      name,
      folder: typeof m.folder === "string" && m.folder !== "" ? m.folder : name,
      type: m.type,
      url: typeof m.url === "string" && m.url !== "" ? m.url : null,
    }));
}

/** The repo.home back-link of the repo at `dir`, or null when it acts as a base. */
export function readHome(dir) {
  const home = configGet(dir, "repo.home");
  return home !== null && typeof home === "object" && typeof home.folder === "string" && home.folder !== ""
    ? home
    : null;
}

/**
 * The repo dir a member's work lives in: a folder member is part of the base
 * repo's tree, so its repo is the base; a submodule or sibling is its own.
 */
export function memberRepo(base, member) {
  return member.type === "folder" ? base : resolve(base, member.folder);
}

/**
 * The repo a project lives in: the member its projects.<p>.repo in vwf.yaml
 * names, else the base. A folder member is part of the base's tree (D17).
 * `present` is false for a member repo absent on this machine.
 */
export function projectRepo(base, config, members, name) {
  const entry = config?.projects?.[name];
  const repo = entry !== null && typeof entry === "object" ? entry.repo : undefined;
  const member = typeof repo === "string" ? members.find((m) => m.name === repo) : undefined;
  if (member === undefined) {
    return { dir: base, present: true };
  }
  const dir = memberRepo(base, member);
  return { dir, present: dir === base || isWorkTree(dir) };
}
