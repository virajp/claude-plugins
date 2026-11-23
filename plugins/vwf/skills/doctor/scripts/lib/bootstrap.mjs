// The repo facts bootstrap keeps, read through its CLI (assets/bootstrap-
// contract.md): `bootstrap config get <key> --json`, run bare from PATH in the
// repo it reads, its envelope's data.value parsed. A failed call throws
// BootstrapError with the envelope's errors text; an absent binary throws it
// with the contract's install hint. Each caller turns it into its own refusal.

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

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

/** The value of `key` in the repo at `cwd`: data.value of the envelope. */
export function configGet(cwd, key) {
  const r = spawnSync("bootstrap", ["config", "get", key, "--json"], { cwd, encoding: "utf8" });
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
      `bootstrap config get ${key} failed in ${cwd}${why ? `: ${why}` : ""}`,
      r.status,
    );
  }
  if (envelope.ok !== true || r.status !== 0) {
    const errors = Array.isArray(envelope.errors) ? envelope.errors : [];
    const text = errors.map((e) => e?.message).filter((m) => typeof m === "string" && m !== "").join("; ");
    throw new BootstrapError(
      `bootstrap config get ${key} failed in ${cwd}: ${text || `exit ${envelope.code ?? r.status}`}`,
      r.status,
    );
  }
  return envelope.data?.value ?? null;
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
