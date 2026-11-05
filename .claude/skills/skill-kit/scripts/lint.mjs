#!/usr/bin/env node
// Lints skills against the standard. Usage:
//   lint.mjs <skill-dir>... [--root <repo>] [--json]
//   lint.mjs --all [--root <repo>] [--json]
//   lint.mjs --words <skill-dir>
// Exits 1 on any error finding. Warnings alone exit 0.
import {
  existsSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import {
  dirname,
  join,
  relative,
  resolve,
} from "node:path";
import { fileURLToPath } from "node:url";
import {
  collectionRules,
  skillRules,
} from "./lib/rules.mjs";
import {
  dependencies,
  loadedWords,
  readSkill,
} from "./lib/skill.mjs";

const HOME = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readJson(name) {
  return JSON.parse(readFileSync(join(HOME, "assets", name), "utf8"));
}

/** Expands a root pattern. `*` matches one path segment. */
function expand(root, pattern) {
  let dirs = [root];
  for (const part of pattern.split("/")) {
    dirs = dirs.flatMap((d) => {
      if (part !== "*") { return existsSync(join(d, part)) ? [join(d, part)] : []; }
      return existsSync(d)
        ? readdirSync(d, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => join(d, e.name))
        : [];
    });
  }
  return dirs.filter((d) => existsSync(join(d, "SKILL.md")));
}

function load(root, config) {
  const installed = new Set(config.alwaysInstalledRoots.flatMap((p) => expand(root, p)));
  return config.roots.flatMap((p) => expand(root, p)).map((dir) => ({
    ...readSkill(dir),
    alwaysInstalled: installed.has(dir),
  }));
}

function dependents(skills) {
  const map = new Map();
  for (const s of skills) {
    for (const name of dependencies(s)) { map.set(name, [...(map.get(name) ?? []), s.fm.name]); }
  }
  return map;
}

function main(argv) {
  const args = [...argv];
  const take = (flag) => {
    const at = args.indexOf(flag);
    if (at < 0) { return null; }
    const [, value] = args.splice(at, 2);
    return value;
  };
  const flag = (name) => {
    const at = args.indexOf(name);
    if (at < 0) { return false; }
    args.splice(at, 1);
    return true;
  };

  if (flag("--words")) {
    if (args.length !== 1) { throw new Error("--words takes one skill folder"); }
    const w = loadedWords(readSkill(args[0]));
    console.log(`body ${w.body} always ${w.always} total ${w.total}`);
    return 0;
  }

  const root = resolve(take("--root") ?? process.cwd());
  const asJson = flag("--json");
  const all = flag("--all");
  if (!all && args.length === 0) { throw new Error("name a skill folder, or pass --all"); }

  const config = readJson("config.json");
  const archetypes = readJson("archetypes.json");
  const collection = load(root, config);
  const ctx = { config, archetypes, root, dependents: dependents(collection) };
  const targets = all ? collection : args.map((dir) => readSkill(dir));

  const findings = targets.flatMap((s) => skillRules(s, ctx));
  if (all) { findings.push(...collectionRules(collection, ctx)); }

  const errors = findings.filter((f) => f.severity === "error").length;
  if (asJson) {
    console.log(JSON.stringify({ skills: targets.length, errors, findings }, null, 2));
    return errors ? 1 : 0;
  }
  for (const f of findings) {
    const file = f.file.startsWith("(") ? f.file : relative(root, f.file);
    console.log(`${f.severity.toUpperCase()} ${f.id} ${file}:${f.line} ${f.msg}`);
  }
  const counts = new Map();
  for (const f of findings) { counts.set(f.id, (counts.get(f.id) ?? 0) + 1); }
  const byRule = [...counts].sort().map(([id, n]) => `${id}=${n}`).join(" ");
  console.log(`${targets.length} skills, ${errors} errors, ${findings.length - errors} other. ${byRule}`.trim());
  return errors ? 1 : 0;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (e) {
  console.error(`lint: ${e.message}`);
  process.exitCode = 2;
}
