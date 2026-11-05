#!/usr/bin/env node
// Scaffolds a skill from its archetype template. Usage:
//   new.mjs <archetype> <name> <parent-dir> [--subtype <subtype>]
// Refuses a folder that exists, so it never overwrites a skill.
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import {
  dirname,
  join,
  resolve,
} from "node:path";
import { fileURLToPath } from "node:url";
import { links } from "./lib/skill.mjs";

const HOME = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function main(argv) {
  const args = [...argv];
  const at = args.indexOf("--subtype");
  const subtype = at >= 0 ? args.splice(at, 2)[1] : "";
  const [archetype, name, parent] = args;
  if (!archetype || !name || !parent) {
    throw new Error("usage: new.mjs <archetype> <name> <parent-dir> [--subtype <s>]");
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) { throw new Error(`name must be kebab-case: ${name}`); }

  const archetypes = JSON.parse(readFileSync(join(HOME, "assets", "archetypes.json"), "utf8"));
  const arch = archetypes[archetype];
  if (!arch) { throw new Error(`unknown archetype: ${archetype}. Use one of: ${Object.keys(archetypes).join(", ")}`); }
  const set = subtype ? arch.subtypes?.[subtype] : [];
  if (!set) { throw new Error(`unknown subtype of ${archetype}: ${subtype}`); }

  const dir = resolve(parent, name);
  if (existsSync(dir)) { throw new Error(`folder exists: ${dir}`); }

  // A plain word and a real row, because the formatter rewrites any brace placeholder.
  let text = readFileSync(join(HOME, "templates", `${archetype}.md`), "utf8").replaceAll("SKILL_NAME", name);
  if (subtype) { text = text.replace(`  archetype: ${archetype}`, `  archetype: ${archetype}\n  subtype: ${subtype}`); }
  if (set.length > 0) {
    const rows = set.map((t) => `| TODO: the task | [${t}.md](references/${t}.md) | sometimes |`).join("\n");
    text = text.replace(/^\|.*references\/topic\.md.*$/m, rows);
  }

  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "SKILL.md"), text);
  for (const { target } of links(text)) {
    const file = join(dir, target);
    if (existsSync(file)) { continue; }
    mkdirSync(dirname(file), { recursive: true });
    if (target.endsWith("findings.schema.json")) { copyFileSync(join(HOME, "assets", "findings.schema.json"), file); }
    else if (target === "templates/report.md") { copyFileSync(join(HOME, "templates", "analysis-report.md"), file); }
    else { writeFileSync(file, `# ${target.split("/").pop().replace(/\.md$/, "")}\n\nTODO\n`); }
  }
  console.log(`${dir}\nNext: fill each TODO, then run lint.mjs on this folder.`);
  return 0;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (e) {
  console.error(`new: ${e.message}`);
  process.exitCode = 2;
}
