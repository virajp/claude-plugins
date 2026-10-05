// What a render writes, file by file: `assets/` copied as they are,
// `templates/` rendered with lib/template.mjs from the values plus the names
// derived here on every render. Six files carry a `>>> tool-config` /
// `<<< tool-config` marker pair: only the lines between them are rewritten,
// and every line outside is the repo's own. Every other file is owned whole.
// A mise file a CI environment loads has each `latest` pin made exact.

import {
  existsSync,
  readdirSync,
  statSync,
} from "node:fs";
import {
  join,
  relative,
} from "node:path";
import {
  joinLines,
  splitLines,
} from "./paths.mjs";
import { RefusalError } from "./rows.mjs";
import {
  render,
  TemplateError,
} from "./template.mjs";

export const TASKS_DIR = ".config/mise/tasks";
const CONF_D = ".config/mise/conf.d";

/** The `…:all` task folders, each with the derived name listing its subtasks. */
export const SUBTASK_DIRS = {
  CHECK_SUBTASKS: "code/check",
  LINT_SUBTASKS: "code/lint",
  FORMAT_SUBTASKS: "code/format",
  AI_SUBTASKS: "setup/ai",
  DEPS_INSTALL_SUBTASKS: "setup/deps/install",
  DEPS_UPGRADE_SUBTASKS: "setup/deps/upgrade",
  DEPS_OUTDATED_SUBTASKS: "setup/deps/outdated",
  DEPS_AUDIT_SUBTASKS: "setup/deps/audit",
  DEPS_CLEANUP_SUBTASKS: "setup/deps/cleanup",
};

/** The tools whose pin stays `latest` even where CI loads it. */
const FLOATING = new Set(["node", "pnpm"]);

// --- the source trees ---------------------------------------------------------

/** Every file under `dir`: its repo-relative path and whether it is executable. */
export function walk(dir) {
  if (!existsSync(dir)) {
    return [];
  }
  const out = [];
  const visit = abs => {
    for (const d of readdirSync(abs, { withFileTypes: true })) {
      const p = join(abs, d.name);
      if (d.isDirectory()) {
        visit(p);
      }
      else if (d.isFile()) {
        out.push({
          path: relative(dir, p).split("\\").join("/"),
          abs: p,
          exec: (statSync(p).mode & 0o111) !== 0,
        });
      }
    }
  };
  visit(dir);
  return out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/** Which derived file names a template reads: 0 none, 1 a `*_SUBTASKS` list, 2 `TASKS`. */
export function tierOf(text) {
  if (/@@(?:#each |#if )?TASKS@@/.test(text)) {
    return 2;
  }
  return /@@(?:#each |#if )?[A-Z_]+_SUBTASKS@@/.test(text) ? 1 : 0;
}

/** A template rendered, a TemplateError refused naming the file. */
export function renderTemplate(text, values, source) {
  try {
    return render(text, values, { source });
  }
  catch (e) {
    if (e instanceof TemplateError) {
      throw new RefusalError(
        `${e.message} — the render needs that value (a pack's own: --set <key>=<value>)`,
      );
    }
    throw e;
  }
}

// --- the marker pair ------------------------------------------------------------

const OPEN = /^\s*(?:#|\/\/)\s*>>> tool-config\s*$/;
const CLOSE = /^\s*(?:#|\/\/)\s*<<< tool-config\s*$/;

function markers(lines) {
  const open = lines.findIndex(l => OPEN.test(l));
  const close = lines.findIndex(l => CLOSE.test(l));
  if (
    open < 0
    || close <= open
    || lines.filter(l => OPEN.test(l) || CLOSE.test(l)).length !== 2
  ) {
    return null;
  }
  return { open, close };
}

/** Whether a source file carries the marker pair. */
export const isMarked = text => markers(splitLines(text).lines) !== null;

/**
 * The repo's file with the source's marked lines in place of its own — or
 * null when the repo's file has no single marker pair to rewrite between.
 */
export function splice(existing, source) {
  const src = splitLines(source).lines;
  const { lines, eol } = splitLines(existing);
  const s = markers(src);
  const e = markers(lines);
  if (!s || !e) {
    return null;
  }
  return joinLines(
    [
      ...lines.slice(0, e.open),
      ...src.slice(s.open, s.close + 1),
      ...lines.slice(e.close + 1),
    ],
    eol,
  );
}

// --- slots --------------------------------------------------------------------

export const PLACEHOLDER = /^#PLACEHOLDER\s*$/m;

/** A slot a pack or the repo has filled: the source is a placeholder, the file in place is not. */
export const filledSlot = (source, existing) =>
  existing !== null && PLACEHOLDER.test(source) && !PLACEHOLDER.test(existing);

// --- pins -----------------------------------------------------------------------

/** A mise file every CI environment loads: the base config, or a conf.d `mise{,.ci,.test}.toml`. */
export const isCiLoaded = path =>
  path === ".config/mise.toml"
  || /^\.config\/mise\/conf\.d\/[^/]+\/mise(?:\.ci|\.test)?\.toml$/.test(path);

/** An exact version: three numeric parts at least, an optional pre-release or build tail. */
export const isExact = v =>
  /^v?\d+\.\d+\.\d+([-+.][0-9A-Za-z.-]+)?$/.test(v ?? "");

const HEADER = /^\s*\[([^\]]+)\]\s*(?:#.*)?$/;
const TOOL_HEADER = /^tools\.(?:"([^"]+)"|([A-Za-z0-9_.:/@-]+))$/;
const VERSION_LINE = /^(\s*version\s*=\s*)"([^"]*)"(.*)$/;
const INLINE_PIN =
  /^(\s*)(?:"([^"]+)"|([A-Za-z0-9_:/@.-]+))(\s*=\s*)"([^"]*)"(.*)$/;

/**
 * Every pin in a mise file: `{tool, version, line}` per `version = "…"` in a
 * `[tools.<name>]` table and per `<name> = "…"` in `[tools]`.
 */
export function pinsOf(text) {
  const out = [];
  let table = null;
  splitLines(text ?? "").lines.forEach((l, line) => {
    const h = HEADER.exec(l);
    if (h) {
      table = h[1].trim();
      return;
    }
    const t = table && TOOL_HEADER.exec(table);
    if (t) {
      const v = VERSION_LINE.exec(l);
      if (v) {
        out.push({ tool: t[1] ?? t[2], version: v[2], line });
      }
      return;
    }
    if (table === "tools") {
      const m = INLINE_PIN.exec(l);
      if (m) {
        out.push({ tool: m[2] ?? m[3], version: m[5], line });
      }
    }
  });
  return out;
}

/** `text` with the pin on `line` set to `version`. */
export function setPin(text, line, version) {
  const { lines, eol } = splitLines(text);
  lines[line] = VERSION_LINE.test(lines[line])
    ? lines[line].replace(VERSION_LINE, `$1"${version}"$3`)
    : lines[line].replace(
      INLINE_PIN,
      (_, ind, q, b, eq, _v, rest) =>
        `${ind}${q ? `"${q}"` : b}${eq}"${version}"${rest}`,
    );
  return joinLines(lines, eol);
}

/**
 * A CI-loaded render with every `latest` pin made exact — the version the
 * repo's file already pins for that tool when it pins one exactly, else
 * `latest(tool)`. node and pnpm stay `latest`.
 */
export function pinExact(text, existing, latest) {
  const held = new Map(
    pinsOf(existing).filter(p => isExact(p.version)).map(p => [
      p.tool,
      p.version,
    ]),
  );
  let out = text;
  for (const pin of pinsOf(text)) {
    if (pin.version !== "latest" || FLOATING.has(pin.tool)) {
      continue;
    }
    out = setPin(out, pin.line, held.get(pin.tool) ?? latest(pin.tool));
  }
  return out;
}

// --- derived names ------------------------------------------------------------

/** A member's slug: its folder name, lowercased, every other run of characters a `-`. */
export const slugOf = path =>
  path
    .split("/")
    .at(-1)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** The names derived from the values alone, with the stored names' defaults filled. */
export function valueNames(values) {
  const out = {
    MERGE_MODEL_DEVELOP: "direct",
    MERGE_MODEL_MAIN: "pr",
    MEMBERS: [],
    SCOPES: [],
    NODE: false,
    EXTERNAL: false,
    ...values,
  };
  if (out.PROJECT_NAME === undefined && out.REPO_NAME !== undefined) {
    out.PROJECT_NAME = out.REPO_NAME;
  }
  out.MEMBERS_SPACED = out.MEMBERS.join(" ");
  const seen = new Map();
  out.MEMBER_ENTRIES = out.MEMBERS.map(path => {
    const slug = slugOf(path);
    if (!slug || slug === "all") {
      throw new RefusalError(
        `member ${path} has no usable slug (${
          slug || "empty"
        }) — rename its folder`,
      );
    }
    if (seen.has(slug)) {
      throw new RefusalError(
        `members ${
          seen.get(slug)
        } and ${path} share the slug ${slug} — their setup flags would collide`,
      );
    }
    seen.set(slug, path);
    return { path, slug };
  });
  return out;
}

/** A file task: executable, and named neither `.` nor `_` first. */
const isTask = (ws, path) => {
  const leaf = path.split("/").at(-1);
  return !leaf.startsWith(".") && !leaf.startsWith("_") && ws.isExec(path);
};

/** Every `*_SUBTASKS` list: the task files directly in each folder, `all` excluded, sorted. */
export function subtaskNames(ws) {
  const out = {};
  for (const [name, dir] of Object.entries(SUBTASK_DIRS)) {
    const prefix = `${TASKS_DIR}/${dir}/`;
    out[name] = ws
      .list(prefix)
      .map(p => p.slice(prefix.length))
      .filter(leaf =>
        !leaf.includes("/") && leaf !== "all" && isTask(ws, prefix + leaf)
      )
      .sort();
  }
  return out;
}

const DESCRIPTION = /^#MISE description="((?:[^"\\]|\\.)*)"\s*$/m;
const TOML_TASK = /^tasks\.(?:"([^"]+)"|([A-Za-z0-9_:-]+))$/;
const TOML_DESCRIPTION = /^\s*description\s*=\s*"((?:[^"\\]|\\.)*)"/;

const unescape = s => s.replace(/\\(.)/g, "$1");

/**
 * `TASKS`: every task the tree defines — each file task under the tasks
 * folder outside a `_`-named folder, and each `[tasks.<name>]` table in the
 * mise config — with its description, sorted by name.
 */
export function taskNames(ws) {
  const tasks = new Map();
  for (const path of ws.list(`${TASKS_DIR}/`)) {
    const rel = path.slice(TASKS_DIR.length + 1);
    if (
      rel.split("/").some(seg => seg.startsWith("_") || seg.startsWith("."))
      || !ws.isExec(path)
    ) {
      continue;
    }
    const m = DESCRIPTION.exec(ws.read(path) ?? "");
    tasks.set(rel.split("/").join(":"), m ? unescape(m[1]) : "");
  }
  const configs = [
    ".config/mise.toml",
    ...ws.list(`${CONF_D}/`).filter(p => p.endsWith(".toml")),
  ];
  for (const path of configs) {
    let task = null;
    for (const l of splitLines(ws.read(path) ?? "").lines) {
      const h = HEADER.exec(l);
      if (h) {
        const t = TOML_TASK.exec(h[1].trim());
        task = t ? t[1] ?? t[2] : null;
        if (task && !tasks.has(task)) {
          tasks.set(task, "");
        }
        continue;
      }
      const d = task && TOML_DESCRIPTION.exec(l);
      if (d) {
        tasks.set(task, unescape(d[1]));
      }
    }
  }
  return [...tasks]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([name, description]) => ({ name, description }));
}
