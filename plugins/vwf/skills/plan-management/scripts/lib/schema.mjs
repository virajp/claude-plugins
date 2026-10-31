// The two schemas of plan.mjs: a plan folder's index.json and the plan index,
// docs/plans/index.json. Each validator returns a list of findings,
// { path, message }; an empty list is a valid file.
//
// An object allows only the keys its schema names. One object is open:
// `consent.lsp` (its keys are language names). `run` is `{}`, or exactly
// `{ worktree, log }`, both non-empty strings, which claim writes. A
// cycle-only key — `covers`, `exposure`, `acceptance`, `consent.lsp` — is
// required on a vwf-plan (`exposure` optional) and a finding on a
// vwf-change-plan.
//
// Each unit, wave, stage and index row carries `started` and `ended`: "" or a
// UTC time as `new Date().toISOString()` prints it. `waves` lists exactly
// W1 … W<n>, in order, where <n> is the highest `wave` of any unit.

import {
  existsSync,
  readFileSync,
} from "node:fs";
import {
  basename,
  join,
  resolve,
  sep,
} from "node:path";
import { isObject } from "./path.mjs";

export const ID_RE = /^[A-Za-z0-9_-]+$/;

const str = (o = {}) => ({ t: "string", ...o });
const int = (o = {}) => ({ t: "int", ...o });
const bool = (o = {}) => ({ t: "bool", ...o });
const list = (of, o = {}) => ({ t: "list", of, ...o });
const obj = (keys, o = {}) => ({ t: "object", keys, ...o });
const strings = (o = {}) => list(str(), o);
const id = () => str({ nonEmpty: true });
const time = () => str({ time: true });

/** A `started` or `ended` value: "" or what `toISOString()` prints. */
export const TIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/** The state of a stage, `stages.<name>.state`. */
export const STAGE_STATE = ["pending", "running", "green", "failed", "skipped"];

/** The status of a unit, `units[].status`. */
export const UNIT_STATUS = [
  "pending",
  "running",
  "green",
  "failed",
  "unresolved",
  "skipped",
];

const STAGE = obj({
  state: str({ enum: STAGE_STATE }),
  started: time(),
  ended: time(),
  detail: str(),
});

const FOLDER = obj({
  format: int({ only: 1 }),
  type: str({ enum: ["vwf-plan", "vwf-change-plan"] }),
  title: str({ nonEmpty: true }),
  requires: strings(),
  source: strings(),
  backlog: strings(),
  backlog_pieces: strings(),
  gaps_of: strings(),
  covers: strings({ cycle: true }),
  exposure: str({ enum: ["dark"], cycle: true, optional: true }),
  status: obj({
    state: str({
      enum: ["DRAFT", "APPROVED", "RUNNING", "BLOCKED", "COMPLETE", "ARCHIVED"],
    }),
    detail: str(),
  }),
  consent: obj({
    merge: bool(),
    end_all_run: bool(),
    lsp: obj({}, {
      cycle: true,
      open: str({ enum: ["installed", "proceed without"] }),
    }),
  }),
  gates: obj({
    unit: strings(),
    wave: strings(),
    plan: strings(),
    keeps: list(obj({ id: id(), check: str(), pass: str() })),
  }),
  after_landing: list(
    obj({ id: id(), step: str(), mode: str({ enum: ["run"] }), notes: str() }),
  ),
  release_levels: list(
    obj({
      id: id(),
      level: str({ enum: ["NONE", "PATCH", "MINOR", "MAJOR"] }),
      reason: str(),
    }),
  ),
  dependencies: list(
    obj({
      id: id(),
      package: str(),
      purpose: str(),
      preferred_over: str(),
      unit: str(),
    }),
  ),
  units: list(
    obj({
      id: id(),
      title: str({ nonEmpty: true }),
      wave: int({ min: 1 }),
      file: str({ nonEmpty: true }),
      kind: str({ enum: ["code", "edit", "review"] }),
      model: str(),
      owns: strings(),
      depends_on: strings(),
      waits: str(),
      status: str({ enum: UNIT_STATUS }),
      started: time(),
      ended: time(),
      commit: str(),
      rounds: int({ min: 0 }),
      range: obj({ from: str(), to: str() }, { optional: true }),
    }),
  ),
  waves: list(
    obj({
      id: id(),
      status: str({ enum: UNIT_STATUS }),
      started: time(),
      ended: time(),
    }),
  ),
  shared_files: list(
    obj({ id: id(), file: str(), why: str(), owner: str() }),
  ),
  decisions: list(
    obj({
      id: id(),
      decision: str(),
      ruling: str(),
      rejected: str(),
      units: strings(),
    }),
  ),
  acceptance: list(obj({ id: id(), text: str(), flow: str() }), {
    cycle: true,
  }),
  stages: obj({
    renders: STAGE,
    acceptance: STAGE,
    ux: STAGE,
    reconcile: STAGE,
  }),
  gaps: list(
    obj({
      id: id(),
      unit: str(),
      stage: str(),
      text: str({ nonEmpty: true }),
      state: str({ enum: ["open", "closed"] }),
    }),
  ),
  overrides: list(obj({ id: id(), text: str() })),
  run: obj({
    worktree: str({ nonEmpty: true, optional: true }),
    log: str({ nonEmpty: true, optional: true }),
  }),
});

const INDEX = obj({
  format: int({ only: 1 }),
  plans: list(
    obj({
      id: id(),
      folder: str({ nonEmpty: true }),
      kind: str({ enum: ["change", "cycle"] }),
      title: str({ nonEmpty: true }),
      target_repo: str({ nullable: true }),
      priority: int(),
      status: str({ enum: ["APPROVED", "RUNNING", "COMPLETE"] }),
      started: time(),
      ended: time(),
      gaps: obj({ open: int({ min: 0 }), moved_to: strings() }, {
        nullable: true,
      }),
      requires: strings(),
      backlog: strings(),
      backlog_pieces: strings(),
    }),
  ),
});

function join_(path, key) {
  return path === "" ? key : `${path}.${key}`;
}

function check(value, spec, path, ctx, out) {
  const at = message => out.push({ path: path || "(file)", message });
  if (value === null && spec.nullable) {
    return;
  }
  switch (spec.t) {
    case "string":
      if (typeof value !== "string") {
        return at(`must be a string${spec.nullable ? " or null" : ""}`);
      }
      if (spec.enum && !spec.enum.includes(value)) {
        return at(
          `${JSON.stringify(value)} is not one of ${spec.enum.join(", ")}`,
        );
      }
      if (spec.nonEmpty && value === "") {
        at("must not be empty");
      }
      if (spec.time && value !== "" && !TIME_RE.test(value)) {
        at("must be \"\" or a UTC time like 2026-10-25T06:39:15.253Z");
      }
      return;
    case "int":
      if (!Number.isInteger(value)) {
        return at("must be an integer");
      }
      if (spec.only !== undefined && value !== spec.only) {
        return at(`must be ${spec.only}`);
      }
      if (spec.min !== undefined && value < spec.min) {
        at(`must be at least ${spec.min}`);
      }
      return;
    case "bool":
      if (typeof value !== "boolean") {
        at("must be true or false");
      }
      return;
    case "list": {
      if (!Array.isArray(value)) {
        return at("must be a list");
      }
      const seen = new Set();
      value.forEach((e, i) => {
        let segment = `[${i}]`;
        if (spec.of.t === "object" && isObject(e)) {
          const ok = typeof e.id === "string" && ID_RE.test(e.id);
          if (Object.hasOwn(e, "id") && !ok) {
            out.push({
              path: `${path}${segment}.id`,
              message: `must match ${ID_RE}`,
            });
          }
          else if (ok && seen.has(e.id)) {
            out.push({
              path: `${path}${segment}.id`,
              message: `${e.id} is not unique in the list`,
            });
          }
          else if (ok) {
            seen.add(e.id);
            segment = `.${e.id}`;
          }
        }
        check(e, spec.of, `${path}${segment}`, ctx, out);
      });
      return;
    }
    case "object": {
      if (!isObject(value)) {
        return at(`must be an object${spec.nullable ? " or null" : ""}`);
      }
      if (spec.open) {
        if (spec.open !== true) {
          for (const [k, v] of Object.entries(value)) {
            check(v, spec.open, join_(path, k), ctx, out);
          }
        }
        return;
      }
      for (const [key, ks] of Object.entries(spec.keys)) {
        const here = join_(path, key);
        const present = Object.hasOwn(value, key);
        if (ks.cycle && ctx.kind === "change") {
          if (present) {
            out.push({
              path: here,
              message: "is a cycle-only key; a vwf-change-plan has none",
            });
          }
          continue;
        }
        if (!present) {
          const required = !ks.optional && (!ks.cycle || ctx.kind === "cycle");
          if (required) {
            out.push({ path: here, message: "is missing" });
          }
          continue;
        }
        check(value[key], ks, here, ctx, out);
      }
      for (const key of Object.keys(value)) {
        if (!Object.hasOwn(spec.keys, key)) {
          out.push({
            path: join_(path, key),
            message: "is not a key the schema names",
          });
        }
      }
      return;
    }
  }
}

function strs(value) {
  return Array.isArray(value) ? value.filter(v => typeof v === "string") : [];
}

function unitPath(u, i) {
  return typeof u.id === "string" && ID_RE.test(u.id)
    ? `units.${u.id}`
    : `units[${i}]`;
}

// The rules that cross keys, files or the folder.
function folderRules(doc, dir, out) {
  const units = Array.isArray(doc.units) ? doc.units : [];
  const byId = new Map();
  for (const u of units) {
    if (isObject(u) && typeof u.id === "string" && !byId.has(u.id)) {
      byId.set(u.id, u);
    }
  }
  units.forEach((u, i) => {
    if (!isObject(u)) {
      return;
    }
    const p = unitPath(u, i);
    if (typeof u.file === "string" && u.file !== "") {
      if (!existsSync(join(dir, u.file))) {
        out.push({
          path: `${p}.file`,
          message: `${u.file} is not in the folder`,
        });
      }
    }
    for (const d of strs(u.depends_on)) {
      const target = byId.get(d);
      if (target === undefined) {
        out.push({
          path: `${p}.depends_on`,
          message: `${d} is not a unit of this plan`,
        });
      }
      else if (
        Number.isInteger(u.wave)
        && Number.isInteger(target.wave)
        && target.wave >= u.wave
      ) {
        out.push({
          path: `${p}.depends_on`,
          message: `${d} is not in an earlier wave`,
        });
      }
    }
    const fixedFinal = typeof u.file === "string"
      && (u.file.endsWith("-docs.md") || u.file.endsWith("-gates.md"));
    if (
      Number.isInteger(u.wave)
      && u.wave > 1
      && u.kind !== "review"
      && !fixedFinal
      && typeof u.waits === "string"
      && u.waits.trim() === ""
    ) {
      out.push({
        path: `${p}.waits`,
        message: "must name why a unit above wave 1 waits",
      });
    }
    if (u.kind === "review") {
      if (Array.isArray(u.owns) && u.owns.length > 0) {
        out.push({ path: `${p}.owns`, message: "a review unit owns nothing" });
      }
      if (Array.isArray(u.depends_on) && u.depends_on.length === 0) {
        out.push({
          path: `${p}.depends_on`,
          message: "a review unit depends on the units it reviews",
        });
      }
      if (!Object.hasOwn(u, "range")) {
        out.push({ path: `${p}.range`, message: "a review unit has a range" });
      }
    }
    else if (Object.hasOwn(u, "range")) {
      out.push({
        path: `${p}.range`,
        message: "only a review unit has a range",
      });
    }
  });

  if (Array.isArray(doc.waves)) {
    const top = Math.max(
      0,
      ...units.map(u => (isObject(u) && Number.isInteger(u.wave) ? u.wave : 0)),
    );
    const want = Array.from({ length: top }, (_, i) => `W${i + 1}`);
    const have = doc.waves.map(w => (isObject(w) ? w.id : undefined));
    for (const w of want) {
      if (!have.includes(w)) {
        out.push({ path: "waves", message: `${w} is missing` });
      }
    }
    for (const w of have) {
      if (typeof w === "string" && !want.includes(w)) {
        out.push({
          path: `waves.${w}`,
          message: `is not a wave of this plan; its units reach W${top}`,
        });
      }
    }
    const listed = have.filter(w => want.includes(w));
    if (
      listed.length === want.length
      && listed.some((w, i) => w !== want[i])
    ) {
      out.push({
        path: "waves",
        message: `must list ${want.join(", ")} in order`,
      });
    }
  }

  const backlog = strs(doc.backlog);
  const pieces = strs(doc.backlog_pieces);
  for (const b of backlog) {
    if (pieces.includes(b)) {
      out.push({
        path: "backlog_pieces",
        message: `${b} is on backlog too`,
      });
    }
  }
  for (const s of strs(doc.source)) {
    if (!backlog.includes(s) && !pieces.includes(s)) {
      out.push({
        path: "source",
        message: `${s} is on neither backlog nor backlog_pieces`,
      });
    }
  }
  if (backlog.length > 0 || pieces.length > 0) {
    const md = join(dir, "index.md");
    if (!existsSync(md)) {
      out.push({
        path: "backlog_pieces",
        message: "the folder has no index.md to hold its piece lines",
      });
    }
    else {
      const lines = readFileSync(md, "utf8").split("\n");
      const has = b => lines.some(l => l.startsWith(`- ${b}:`));
      for (const b of pieces) {
        if (!has(b)) {
          out.push({
            path: "backlog_pieces",
            message: `${b} has no line starting "- ${b}:" in index.md`,
          });
        }
      }
      for (const b of backlog) {
        if (has(b)) {
          out.push({
            path: "backlog",
            message: `${b} is whole, yet index.md has a "- ${b}:" line`,
          });
        }
      }
    }
  }

  if (isObject(doc.run)) {
    const keys = ["worktree", "log"].filter(k => Object.hasOwn(doc.run, k));
    if (keys.length === 1) {
      const missing = keys[0] === "worktree" ? "log" : "worktree";
      out.push({
        path: `run.${missing}`,
        message: "is missing; run is {} or has both worktree and log",
      });
    }
  }

  const gaps = Array.isArray(doc.gaps) ? doc.gaps : [];
  gaps.forEach((g, i) => {
    if (isObject(g) && typeof g.unit === "string" && g.unit !== "") {
      if (!byId.has(g.unit)) {
        const p = typeof g.id === "string" && ID_RE.test(g.id)
          ? `gaps.${g.id}`
          : `gaps[${i}]`;
        out.push({
          path: `${p}.unit`,
          message: `${g.unit} is not a unit of this plan`,
        });
      }
    }
  });
}

/** Findings for a plan folder's index.json; `dir` is the folder. */
export function validateFolder(doc, dir) {
  const out = [];
  const kind = !isObject(doc)
    ? undefined
    : doc.type === "vwf-plan"
    ? "cycle"
    : doc.type === "vwf-change-plan"
    ? "change"
    : undefined;
  check(doc, FOLDER, "", { kind }, out);
  if (isObject(doc)) {
    folderRules(doc, dir, out);
  }
  return out;
}

/** Findings for the plan index, docs/plans/index.json. */
export function validateIndex(doc) {
  const out = [];
  check(doc, INDEX, "", {}, out);
  if (isObject(doc) && Array.isArray(doc.plans)) {
    doc.plans.forEach((row, i) => {
      if (
        isObject(row)
        && typeof row.id === "string"
        && typeof row.folder === "string"
        && basename(row.folder) !== row.id
      ) {
        const p = ID_RE.test(row.id) ? `plans.${row.id}` : `plans[${i}]`;
        out.push({
          path: `${p}.id`,
          message: `does not match the basename of folder ${row.folder}`,
        });
      }
    });
  }
  return out;
}

/** Whether the file is the plan index rather than a plan folder's file. */
export function isPlanIndex(file) {
  const full = resolve(file).split(sep).join("/");
  return full.endsWith("/docs/plans/index.json");
}

/** Findings for the file at `file`, holding `doc`. */
export function validate(file, doc) {
  return isPlanIndex(file)
    ? validateIndex(doc)
    : validateFolder(doc, resolve(file, ".."));
}
