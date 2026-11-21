/**
 * The project and worktree blocks of the row above the prompt, as claude-status
 * draws its `project` and `worktree` segments. A port of claude-status's
 * `src/modules/git.rs` (`find_root_and_branch`, `project`, `worktree_subpath`),
 * its config layers (`src/modules/config/layers.rs`) and its colour resolve
 * (`src/modules/config/color.rs`). It reads files only, and works with
 * claude-status's shipped defaults when claude-status is not installed.
 */

import type {
  Block,
  Identity,
} from "../../types";

/** Where a repository lives, which picks the project glyph. */
export type ProjectKind = "git" | "remote" | "github" | "gitlab";

/** The repository's identity: its kind, its name, and the root the name came from. */
export type Project = { kind: ProjectKind; name: string; root: string };

/** The file reads the port needs, as $.fs gives them. */
export type GitIo = {
  /** The kind of a path, or undefined when it does not exist. */
  kind: (path: string) => Promise<"file" | "dir" | "other" | undefined>;
  read: (path: string) => Promise<string | undefined>;
};

type Json = Record<string, unknown>;
type Rgb = [number, number, number];

// How far up the tree to look for a `.git`.
const MAX_WALK = 40;
// C0/C1 control characters: no escape sequence from a name reaches the terminal.
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/g;
const FALLBACK: Rgb = [251, 241, 199];
// Characters that mean something to a regex engine; `|` is alternation of literals.
const METACHARACTERS = /[.^$*+?()[\]{}\\]/;
const FORBIDDEN_KEYS = ["__proto__", "constructor", "prototype"];

/** claude-status's shipped values for the keys the row reads (`assets/claude-status.defaults.json`). */
export const DEFAULTS: Json = {
  defaultFg: "white",
  palette: {
    aqua: [104, 157, 106],
    bg3: [102, 92, 84],
    blue: [69, 133, 136],
    green: [152, 151, 26],
    grey: [60, 56, 54],
    orange: [214, 93, 14],
    purple: [177, 98, 134],
    red: [204, 36, 29],
    white: [251, 241, 199],
    yellow: [215, 153, 33],
  },
  powerline: { cap: "\u{e0b6}", sep: "\u{e0b0}", sepThin: "\u{e0b1}", thinFg: "grey" },
  segments: {
    project: { bg: "green", bold: true, fg: "white" },
    worktree: { bg: "yellow", fg: "grey" },
  },
  symbols: {
    folder: "\u{f07b}",
    projectGit: "\u{e702}",
    projectGithub: "\u{f09b}",
    projectGitlab: "\u{f0ba0}",
    projectRemote: "\u{f401}",
    worktree: "\u{1f332}",
  },
  worktreePattern: "worktree",
};

function isObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** `/a/b/../c/./d` → `/a/c/d`, lexically; a climb above the root is dropped. */
export function normalise(path: string): string {
  const rooted = path.startsWith("/");
  const out: string[] = [];
  for (const part of path.split("/")) {
    if (part === "" || part === ".") {
      continue;
    }
    if (part === "..") {
      if (out.length > 0 && out[out.length - 1] !== "..") {
        out.pop();
      } else if (!rooted) {
        out.push("..");
      }
      continue;
    }
    out.push(part);
  }

  return (rooted ? "/" : "") + out.join("/");
}

function join(dir: string, rel: string): string {
  return rel.startsWith("/") ? rel : `${dir.replace(/\/+$/, "")}/${rel}`;
}

function parentOf(path: string): string | undefined {
  const at = path.replace(/\/+$/, "").lastIndexOf("/");
  if (at < 0) {
    return undefined;
  }

  return at === 0 ? "/" : path.slice(0, at);
}

function baseOf(path: string): string {
  return path.replace(/\/+$/, "").split("/").pop() ?? "";
}

/** A `.git` pointer file's `gitdir: <path>`, relative to the folder that holds `.git`. */
function gitdirPointer(dir: string, pointer: string): string | undefined {
  const target = pointer.trim();
  if (!target.startsWith("gitdir:")) {
    return undefined;
  }
  const path = target.slice("gitdir:".length).trim();

  return path === "" ? undefined : normalise(join(dir, path));
}

/**
 * The checkout root: the nearest folder up from `start` whose `.git` leads to a
 * readable HEAD. A `.git` whose HEAD cannot be read does not stop the walk; a
 * pointer file that names no gitdir does.
 */
export async function findRoot(start: string, io: GitIo): Promise<string | undefined> {
  let dir: string | undefined = normalise(start);
  for (let i = 0; i < MAX_WALK && dir !== undefined; i++) {
    const dotGit = join(dir, ".git");
    const kind = await io.kind(dotGit);
    if (kind !== undefined) {
      let gitDir: string | undefined = dotGit;
      if (kind !== "dir") {
        const pointer = await io.read(dotGit);
        gitDir = pointer === undefined ? undefined : gitdirPointer(dir, pointer);
        if (pointer !== undefined && gitDir === undefined) {
          return dir;
        }
      }
      if (gitDir !== undefined && (await io.read(join(gitDir, "HEAD"))) !== undefined) {
        return dir;
      }
    }
    const parent = parentOf(dir);
    dir = parent === dir ? undefined : parent;
  }

  return undefined;
}

/** The checkout a store sits inside: `.git` always, a hidden store only when `<parent>/.git` points at it. */
async function checkoutOf(store: string, io: GitIo): Promise<string | undefined> {
  const name = baseOf(store);
  const parent = parentOf(store);
  if (name === "" || parent === undefined) {
    return undefined;
  }
  if (name === ".git") {
    return parent;
  }
  if (name.startsWith(".")) {
    const pointer = await io.read(join(parent, ".git"));
    if (pointer !== undefined && gitdirPointer(parent, pointer) === store) {
      return parent;
    }
  }

  return undefined;
}

/** The outermost superproject a git dir sits under, as `[identity, store]`. */
async function superproject(gitDir: string, io: GitIo): Promise<[string, string] | undefined> {
  const parts = gitDir.split("/").filter((one) => one !== "");
  const at = (i: number, name: string) => parts[i] === name;
  for (let i = 0; i < parts.length; i++) {
    if (!(at(i + 1, "modules") || (at(i + 1, "worktrees") && at(i + 3, "modules")))) {
      continue;
    }
    const store = "/" + parts.slice(0, i + 1).join("/");
    const identity = await checkoutOf(store, io);
    if (identity !== undefined) {
      return [identity, store];
    }
    if (parts[i]?.endsWith(".git")) {
      return [store, store];
    }
  }

  return undefined;
}

/** The identity root and the common git dir whose `config` names the remote. */
async function identityRoot(root: string, io: GitIo): Promise<[string, string]> {
  const dotGit = join(root, ".git");
  const own: [string, string] = [root, dotGit];
  if ((await io.kind(dotGit)) === "dir") {
    return own;
  }
  const pointer = await io.read(dotGit);
  const gitDir = pointer === undefined ? undefined : gitdirPointer(root, pointer);
  if (gitDir === undefined) {
    return own;
  }
  const commondir = await io.read(join(gitDir, "commondir"));
  const common = commondir === undefined ? gitDir : normalise(join(gitDir, commondir.trim()));
  const found = await superproject(common, io);
  if (found !== undefined) {
    return found;
  }
  if (commondir === undefined) {
    return [root, common];
  }

  return [(await checkoutOf(common, io)) ?? common, common];
}

/** A config value: a quoted value verbatim to its closing quote, else cut at `#` or `;`. */
function configValue(raw: string): string {
  const value = raw.trim();
  if (value.startsWith("\"")) {
    const end = value.indexOf("\"", 1);
    if (end > 0) {
      return value.slice(1, end);
    }
  }
  const cut = value.search(/[#;]/);

  return (cut < 0 ? value : value.slice(0, cut)).trimEnd();
}

/** The first `url` under `[remote "origin"]` of a git config, read the way git does. */
export function originUrl(config: string): string | undefined {
  let inOrigin = false;
  for (const raw of config.split("\n")) {
    const line = raw.trim();
    const close = line.startsWith("[") ? line.indexOf("]") : -1;
    if (close > 0) {
      const header = line.slice(1, close);
      const split = header.trim().search(/\s/);
      const [section, sub] = split < 0
        ? [header, ""]
        : [header.trim().slice(0, split), header.trim().slice(split)];
      inOrigin = section.toLowerCase() === "remote" && sub.trim() === "\"origin\"";
      continue;
    }
    if (line.startsWith("[")) {
      inOrigin = false;
      continue;
    }
    if (!inOrigin) {
      continue;
    }
    const eq = line.indexOf("=");
    if (eq > 0 && line.slice(0, eq).trim().toLowerCase() === "url") {
      return configValue(line.slice(eq + 1));
    }
  }

  return undefined;
}

/** A remote URL's kind and path: the host matched by substring, the path without `.git`. */
export function classify(url: string): [ProjectKind, string | undefined] {
  const noHost: [ProjectKind, undefined] = ["remote", undefined];
  let hostPort: string;
  let path: string;
  const scheme = url.indexOf("://");
  if (scheme >= 0) {
    if (url.slice(0, scheme).toLowerCase() === "file") {
      return noHost;
    }
    const rest = url.slice(scheme + 3);
    const slash = rest.indexOf("/");
    [hostPort, path] = slash < 0 ? [rest, ""] : [rest.slice(0, slash), rest.slice(slash + 1)];
  } else {
    const colon = url.indexOf(":");
    if (colon < 0 || url.slice(0, colon).includes("/")) {
      return noHost;
    }
    [hostPort, path] = [url.slice(0, colon), url.slice(colon + 1)];
  }
  const at = hostPort.lastIndexOf("@");
  const host = (at < 0 ? hostPort : hostPort.slice(at + 1)).split(":")[0]!.toLowerCase();
  path = path.replace(/^\/+/, "").replace(/\/+$/, "");
  if (path.endsWith(".git")) {
    path = path.slice(0, -4);
  }
  if (host === "" || path === "") {
    return noHost;
  }
  const kind: ProjectKind = host.includes("github") ? "github" : host.includes("gitlab") ? "gitlab" : "remote";

  return [kind, path];
}

/** `parent/base` of the identity root, a bare `repo.git` read as `repo`. */
function parentBase(root: string): string | undefined {
  let base = baseOf(root);
  if (base === "") {
    return undefined;
  }
  if (base.endsWith(".git")) {
    base = base.slice(0, -4);
  }
  const parent = parentOf(root);
  const parentName = parent === undefined ? "" : baseOf(parent);

  return parentName === "" ? base : `${parentName}/${base}`;
}

/** The repository's identity, from the checkout root `findRoot` returned. */
export async function project(root: string, io: GitIo): Promise<Project | undefined> {
  const [identity, common] = await identityRoot(root, io);
  const config = await io.read(join(common, "config"));
  const url = config === undefined ? undefined : originUrl(config);
  const [kind, path] = url === undefined ? ["git" as const, undefined] : classify(url);
  const name = (kind === "github" || kind === "gitlab") && path !== undefined ? path : parentBase(identity);

  return name === undefined ? undefined : { kind, name, root: identity };
}

/** Whether one path part matches `worktreePattern`: literals by substring, else a regex; both ignore case. */
function matches(pattern: string, part: string): boolean {
  if (!METACHARACTERS.test(pattern)) {
    const haystack = part.toLowerCase();

    return pattern.split("|").some((alt) => haystack.includes(alt.toLowerCase()));
  }
  try {
    return new RegExp(pattern, "i").test(part);
  } catch {
    return matches("worktree", part);
  }
}

/** Everything after the last path part that matches the pattern; none when nothing follows it. */
export function worktreeSubpath(cwd: string, pattern: string): string | undefined {
  const parts = cwd.split("/").filter((one) => one !== "");
  const used = pattern === "" ? "worktree" : pattern;
  let last = -1;
  parts.forEach((part, i) => {
    if (matches(used, part)) {
      last = i;
    }
  });
  const tail = last < 0 ? [] : parts.slice(last + 1);

  return tail.length === 0 ? undefined : tail.join("/");
}

/** `over` merged into `base`: objects key by key, anything else replaces. */
export function deepMerge(base: Json, over: Json): Json {
  const out: Json = { ...base };
  for (const [key, value] of Object.entries(over)) {
    if (FORBIDDEN_KEYS.includes(key)) {
      continue;
    }
    const was = out[key];
    out[key] = isObject(was) && isObject(value) ? deepMerge(was, value) : value;
  }

  return out;
}

function channel(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(255, Math.max(0, Math.round(value)))
    : undefined;
}

function triple(value: unknown): Rgb | undefined {
  if (!Array.isArray(value) || value.length !== 3) {
    return undefined;
  }
  const [r, g, b] = value.map(channel);

  return r === undefined || g === undefined || b === undefined ? undefined : [r, g, b];
}

function parseHex(text: string): Rgb | undefined {
  const body = text.slice(1);
  if (!/^[0-9a-fA-F]*$/.test(body)) {
    return undefined;
  }
  if (body.length === 3) {
    return [0, 1, 2].map((i) => parseInt(body[i]!, 16) * 17) as Rgb;
  }

  return body.length === 6 ? [0, 2, 4].map((i) => parseInt(body.slice(i, i + 2), 16)) as Rgb : undefined;
}

/** A colour spec as `#rrggbb`: a palette name first, then a hex string or an `[r, g, b]`; else the palette's white. */
export function resolveColor(spec: unknown, palette: Json): string {
  const direct = typeof spec === "string"
    ? spec in palette ? triple(palette[spec]) : spec.startsWith("#") ? parseHex(spec) : undefined
    : triple(spec);
  const rgb = direct ?? triple(palette["white"]) ?? FALLBACK;

  return "#" + rgb.map((one) => one.toString(16).padStart(2, "0")).join("");
}

function parse(text: string | undefined): Json | undefined {
  if (text === undefined) {
    return undefined;
  }
  try {
    const value: unknown = JSON.parse(text);

    return isObject(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

/** A text with control characters stripped, so a name cannot put an escape in the row. */
function clean(text: string): string {
  return text.replace(CONTROL, "");
}

const GLYPH_KEY: Record<ProjectKind, string> = {
  git: "projectGit",
  remote: "projectRemote",
  github: "projectGithub",
  gitlab: "projectGitlab",
};

/**
 * What the row draws for `cwd`, or null outside a git repository. The config is
 * claude-status's: its shipped defaults, then the user layer
 * `~/.config/claude-status/config.json` merged whole, then the repo layer
 * `<checkout>/.config/claude-status.json`, of which only `projectName` counts.
 */
export async function identityOf(cwd: string, home: string | undefined, io: GitIo): Promise<Identity | null> {
  const root = await findRoot(cwd, io);
  const found = root === undefined ? undefined : await project(root, io);
  if (root === undefined || found === undefined) {
    return null;
  }
  let config = DEFAULTS;
  const user = home === undefined ? undefined : parse(await io.read(`${home}/.config/claude-status/config.json`));
  if (user !== undefined) {
    config = deepMerge(config, user);
  }
  const repo = parse(await io.read(join(root, ".config/claude-status.json")));
  if (repo !== undefined && "projectName" in repo) {
    config = deepMerge(config, { projectName: repo["projectName"] });
  }
  const palette = isObject(config["palette"]) ? config["palette"] : {};
  const symbols = isObject(config["symbols"]) ? config["symbols"] : {};
  const segments = isObject(config["segments"]) ? config["segments"] : {};
  const powerline = isObject(config["powerline"]) ? config["powerline"] : {};
  const text = (value: unknown) => typeof value === "string" ? clean(value) : "";
  const block = (segment: string, glyph: string, body: string): Block => {
    const style = isObject(segments[segment]) ? segments[segment] : {};

    return {
      glyph,
      text: body,
      fg: resolveColor(style["fg"] ?? config["defaultFg"], palette),
      bg: resolveColor(style["bg"], palette),
      bold: style["bold"] === true,
    };
  };
  const named = typeof config["projectName"] === "string" && config["projectName"] !== ""
    ? config["projectName"]
    : found.name;
  const pattern = typeof config["worktreePattern"] === "string" ? config["worktreePattern"] : "worktree";
  const sub = worktreeSubpath(cwd, pattern);
  const identity: Identity = {
    project: block("project", text(symbols[GLYPH_KEY[found.kind]]), clean(named)),
    cap: text(powerline["cap"]),
    sep: text(powerline["sep"]),
    sepThin: text(powerline["sepThin"]),
    thinFg: resolveColor(powerline["thinFg"], palette),
  };
  if (sub !== undefined) {
    identity.worktree = block("worktree", text(symbols["worktree"]), `${text(symbols["folder"])} ${clean(sub)}`.trim());
  }

  return identity;
}

/** A text without Unicode private-use characters (Nerd Font glyphs), for a surface without that font. */
export function withoutPrivateUse(text: string): string {
  return text.replace(/[\u{e000}-\u{f8ff}\u{f0000}-\u{ffffd}\u{100000}-\u{10fffd}]/gu, "").replace(/\s+/g, " ").trim();
}
