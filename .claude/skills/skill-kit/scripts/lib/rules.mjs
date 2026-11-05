// The exact rules. A rule that needs judgment is on the reviewer's checklist in
// references/rules.md, not here.
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import {
  basename,
  dirname,
  join,
  resolve,
} from "node:path";
import {
  dependencies,
  invocationState,
  links,
  loadedWords,
  meta,
  reachable,
  sections,
  stripCode,
  stripFences,
  tables,
  walk,
} from "./skill.mjs";

const TRIGGER = /\b(use when|use as|use for|run when|auto-applies|invoked by|invoke as)\b/i;
const FILLER = ["please", "make sure to", "it's important that", "it is important", "in order to", "carefully"];
const KNOWN_KEYS = new Set([
  "name",
  "description",
  "license",
  "compatibility",
  "metadata",
  "allowed-tools",
  "argument-hint",
  "disable-model-invocation",
  "user-invocable",
  "paths",
  "model",
  "version",
  "category",
  "context",
  "agent",
  "hooks",
  "when_to_use",
  "effort",
  "shell",
]);
const RULE_SECTIONS = new Set(["Never", "Guardrails", "Rules", "Config rules", "Rules that don't wait"]);
const SECRET = /(sk-ant-[\w-]{8,}|ghp_\w{20,}|github_pat_\w{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/;
const USER_PATH = /(^|[\s"'`=(:])(\/Users\/[a-zA-Z]|\/home\/[a-z]|~\/Projects)/m;
const MUTATING = /\b(create|delete|put|apply|update)\b/i;

function isDir(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

function section(skill, title) {
  return sections(skill.body, skill.bodyLine).find((s) => s.title === title);
}

function shape(skill) {
  return isDir(join(skill.dir, "references")) ? "router" : "single";
}

/** The sentences of one prose text, each with its word limit. */
function sentences(text) {
  const out = [];
  let block = null;
  const flush = () => {
    if (!block) { return; }
    const limit = /^\d+\.\s/.test(block.text) ? 20 : 25;
    const clean = stripCode(block.text).replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/^([-*]|\d+\.)\s+/, "");
    for (const s of clean.split(/(?<=[.!?])\s+(?=[A-Z"(])/)) {
      const words = s.trim().split(/\s+/).filter(Boolean).length;
      if (words > limit) { out.push({ line: block.line, words, limit }); }
    }
    block = null;
  };
  stripFences(text).split("\n").forEach((line, i) => {
    const t = line.trim();
    if (!t || t.startsWith("|") || t.startsWith("#") || t.startsWith(">")) {
      flush();
      return;
    }
    if (/^([-*]|\d+\.)\s/.test(t)) { flush(); }
    if (block) { block.text += ` ${t}`; }
    else { block = { line: i + 1, text: t }; }
  });
  flush();
  return out;
}

function styleRules(text, firstLine, add) {
  for (const s of sentences(text)) {
    add("ST101", "warn", s.line + firstLine - 1, `sentence has ${s.words} words, limit ${s.limit}`);
  }
  stripFences(text).split("\n").forEach((line, i) => {
    const clean = stripCode(line).toLowerCase();
    for (const f of FILLER) {
      if (new RegExp(`\\b${f}\\b`).test(clean)) { add("ST102", "warn", i + firstLine, `filler: "${f}"`); }
    }
  });
}

/** Rules that read one skill. `ctx` holds the archetypes and all skills. */
export function skillRules(skill, ctx) {
  const out = [];
  const add = (id, severity, line, msg, file = skill.path) => out.push({ id, severity, file, line, msg });

  for (const e of skill.errors) { add("SK011", "error", e.line, e.msg); }

  const { fm } = skill;
  const m = meta(skill);
  const arch = ctx.archetypes[m.archetype];
  const description = typeof fm.description === "string" ? fm.description : "";

  if (!TRIGGER.test(description)) { add("SK001", "error", 1, "description has no trigger"); }
  if (m.archetype !== "doctrine" && !/\bnot for\b/i.test(description)) {
    add("SK001", "error", 1, "description has no \"Not for\"");
  }
  if (description.length > 1024) {
    add(
      "SK002",
      "error",
      1,
      `description has ${description.length} chars, limit 1024`,
    );
  } else if (arch && description.length > arch.description) {
    add("SK002", "warn", 1, `description has ${description.length} chars, target ${arch.description}`);
  }
  for (const key of Object.keys(fm)) {
    if (!KNOWN_KEYS.has(key)) { add("SK008", "warn", 1, `unknown frontmatter key: ${key}`); }
  }

  const fenced = stripFences(skill.body);
  for (const { target, line } of links(skill.body, skill.bodyLine)) {
    if (!existsSync(resolve(skill.dir, target))) { add("SK004", "error", line, `link does not resolve: ${target}`); }
  }
  const refs = join(skill.dir, "references");
  if (isDir(refs)) {
    for (const name of readdirSync(refs)) {
      if (isDir(join(refs, name))) { add("SK005", "error", 1, `nested folder: references/${name}`); }
    }
  }
  const seen = reachable(skill);
  for (const folder of ["references", "workflows"]) {
    for (const file of walk(join(skill.dir, folder))) {
      if (file.endsWith(".md") && !seen.has(file)) { add("SK013", "warn", 1, "no link reaches this file", file); }
    }
  }
  const routing = section(skill, "Routing");
  if (routing && !tables(routing.text).some((t) => t.header.some((h) => h.toLowerCase() === "loads"))) {
    add("SK014", "warn", routing.line, "Routing table has no Loads column");
  }

  for (const file of walk(join(skill.dir, "scripts"))) {
    const text = readFileSync(file, "utf8");
    if (USER_PATH.test(text)) { add("SK009", "error", 1, "hardcoded user path", file); }
  }
  for (const file of walk(skill.dir)) {
    if (file.endsWith(".lock") || basename(file).endsWith(".png")) { continue; }
    if (SECRET.test(readFileSync(file, "utf8"))) { add("SK010", "error", 1, "text looks like a secret", file); }
  }

  styleRules(skill.body, skill.bodyLine, add);
  for (const file of walk(skill.dir)) {
    if (file === skill.path || !file.endsWith(".md") || file.includes("/templates/")) { continue; }
    styleRules(readFileSync(file, "utf8"), 1, (id, sev, line, msg) => add(id, sev, line, msg, file));
  }
  const emphasis = fenced.match(/\*\*[^*\n]*\b(MUST|NEVER)\b[^*\n]*\*\*/g) ?? [];
  if (emphasis.length > 3) { add("ST103", "warn", skill.bodyLine, `${emphasis.length} bold MUST or NEVER, limit 3`); }
  for (const s of sections(skill.body, skill.bodyLine)) {
    if (!RULE_SECTIONS.has(s.title)) { continue; }
    const lines = s.text.split("\n");
    lines.forEach((line, i) => {
      if (!/^\s*[-*]\s/.test(line)) { return; }
      let bullet = line;
      for (let j = i + 1; j < lines.length && lines[j].trim() && !/^\s*[-*]\s/.test(lines[j]); j++) {
        bullet += ` ${lines[j].trim()}`;
      }
      if (!/\s—\s/.test(bullet)) { add("ST105", "warn", s.line + i + 1, "rule has no \" — \" reason"); }
    });
  }

  if (!m.archetype || !arch) {
    add("SK007", "error", 1, m.archetype ? `unknown archetype: ${m.archetype}` : "no metadata.archetype");
    return out;
  }

  const form = shape(skill);
  const single = m.archetype === "doctrine" && form === "single";
  const budget = single ? arch.singleBudget : arch.budget;
  const words = loadedWords(skill);
  if (words.always > budget) { add("SK003", "warn", 1, `${words.always} always-loaded words, budget ${budget}`); }

  const required = single ? arch.singleSections : arch.sections;
  const titles = sections(skill.body).map((s) => s.title);
  let last = -1;
  for (const title of required) {
    const at = titles.indexOf(title);
    if (at < 0) { add("SK015", "warn", skill.bodyLine, `missing section: ${title}`); }
    else if (at < last) { add("SK015", "warn", skill.bodyLine, `section out of order: ${title}`); }
    else { last = at; }
  }
  for (const folder of arch.folders) {
    if (!isDir(join(skill.dir, folder))) { add("SK016", "warn", 1, `missing folder: ${folder}/`); }
  }

  const state = invocationState(fm);
  const dependents = ctx.dependents.get(fm.name) ?? [];
  if (state !== arch.invocation && dependents.length === 0 && !m["invocation-reason"]) {
    add("SK012", "warn", 1, `invocation is ${state}, the ${m.archetype} default is ${arch.invocation}`);
  }

  ARCHETYPE_RULES[m.archetype]?.(skill, add, ctx, m);
  return out;
}

function topics(skill, add, ctx, m, id) {
  const set = ctx.archetypes[m.archetype].subtypes?.[m.subtype];
  if (!m.subtype) { return; }
  if (!set) {
    add(id, "error", 1, `unknown subtype: ${m.subtype}`);
    return;
  }
  for (const topic of set) {
    if (!existsSync(join(skill.dir, "references", `${topic}.md`))) {
      add(id, "error", 1, `missing topic: references/${topic}.md`);
    }
  }
}

function findingsLink(skill, add, id) {
  const s = section(skill, "Findings");
  if (s && !links(s.text).some((l) => /findings/i.test(basename(l.target)))) {
    add(id, "error", s.line, "Findings section links no findings schema");
  }
}

const ARCHETYPE_RULES = {
  workflow(skill, add) {
    const phases = section(skill, "Phases");
    if (!phases) { add("WF301", "error", skill.bodyLine, "no Phases section"); }
    else {
      for (const row of tables(phases.text, phases.start + skill.bodyLine).flatMap((t) => t.rows)) {
        if (links(row.raw).length === 0) {
          add(
            "WF301",
            "error",
            row.line,
            `Phases row links no file: ${row.cells[0]}`,
          );
        }
      }
    }
    const halt = section(skill, "Halt and pause");
    const table = halt && tables(halt.text)[0];
    if (!table || table.header[0]?.toLowerCase() !== "id") {
      add("WF303", "warn", halt?.line ?? skill.bodyLine, "Halt and pause has no table with an ID column");
    }
  },
  doctrine(skill, add) {
    if (skill.fm["user-invocable"] === "false" && !skill.fm.paths) {
      add("DC401", "error", 1, "user-invocable: false needs paths");
    }
    const rules = section(skill, "Rules that don't wait");
    const count = rules ? rules.text.split("\n").filter((l) => /^\s*[-*]\s/.test(l)).length : 0;
    if (count > 3) { add("DC403", "warn", rules.line, `${count} inline rules, limit 3`); }
  },
  reference(skill, add, ctx, m) {
    topics(skill, add, ctx, m, "RF501");
    for (const file of walk(join(skill.dir, "references"))) {
      if (file.endsWith(".md") && !/https?:\/\//.test(readFileSync(file, "utf8"))) {
        add("RF502", "warn", 1, "reference cites no source URL", file);
      }
    }
  },
  adapter(skill, add, ctx, m) {
    const state = invocationState(skill.fm);
    if (state !== "both") { add("AD601", "error", 1, `an adapter must be user and model, not ${state}`); }
    const parsed = (m.implements ?? "").match(/^([\w-]+)\/([\w-]+)@\w+$/);
    if (!parsed) {
      add("AD602", "error", 1, "metadata.implements is not <host>/<name>@<version>");
      return;
    }
    const path = ctx.config.contractPath.replace("{host}", parsed[1]).replace("{name}", parsed[2]);
    if (!existsSync(join(ctx.root, path))) { add("AD602", "error", 1, `contract does not exist: ${path}`); }
    if (parsed[2] !== skill.fm.name) { add("AD603", "error", 1, `name differs from contract name ${parsed[2]}`); }
  },
  generator(skill, add) {
    const preview = section(skill, "Preview");
    const write = section(skill, "Write");
    if (!preview || !write || preview.line > write.line) {
      add(
        "GN701",
        "error",
        skill.bodyLine,
        "no Preview before Write",
      );
    }
    if (!section(skill, "Record")) { add("GN702", "warn", skill.bodyLine, "no Record section"); }
    if (!section(skill, "Verify")) { add("GN703", "error", skill.bodyLine, "no Verify section"); }
  },
  audit(skill, add) {
    const checks = section(skill, "Checks");
    const table = checks && tables(checks.text)[0];
    const ids = table?.rows.map((r) => r.cells[0]) ?? [];
    if (new Set(ids).size !== ids.length || ids.length === 0) {
      add("AU801", "error", checks?.line ?? skill.bodyLine, "check IDs are absent or not unique");
    }
    findingsLink(skill, add, "AU802");
    const tools = String(skill.fm["allowed-tools"] ?? "");
    if (/\b(Write|Edit)\b/.test(tools) && !section(skill, "Fix mode")) {
      add("AU803", "warn", 1, "write tools with no Fix mode section");
    }
  },
  analysis(skill, add, ctx, m) {
    topics(skill, add, ctx, m, "AN907");
    const question = section(skill, "Question");
    if (!question || !/decision/i.test(question.text) || !section(skill, "Scope")) {
      add("AN901", "error", question?.line ?? skill.bodyLine, "Question must name the decision, and Scope must exist");
    }
    for (const file of walk(join(skill.dir, "scripts"))) {
      if (!basename(file).startsWith("collect-")) { continue; }
      const code = readFileSync(file, "utf8").split("\n").filter((l) => !/^\s*(#|\/\/)/.test(l)).join("\n");
      if (!code.includes("data/")) { add("AN902", "warn", 1, "collector does not write to data/", file); }
      if (MUTATING.test(code)) { add("AN903", "error", 1, "collector holds a mutating verb", file); }
    }
    const report = join(skill.dir, "templates", "report.md");
    const text = existsSync(report) ? readFileSync(report, "utf8") : "";
    for (const needed of ["## Answer", "## Findings", "## Assumptions and gaps", "evidence", "confidence"]) {
      if (!text.toLowerCase().includes(needed.toLowerCase())) {
        add("AN904", "error", 1, `report template lacks: ${needed}`, report);
      }
    }
    findingsLink(skill, add, "AN905");
  },
  runbook(skill, add) {
    if (invocationState(skill.fm) !== "user") { add("RB101", "error", 1, "a runbook must be user-only"); }
  },
};

function hasCycle(graph) {
  const state = new Map();
  const visit = (node, path) => {
    if (state.get(node) === "done") { return null; }
    if (state.get(node) === "open") { return [...path, node]; }
    state.set(node, "open");
    for (const next of graph.get(node) ?? []) {
      const found = visit(next, [...path, node]);
      if (found) { return found; }
    }
    state.set(node, "done");
    return null;
  };
  for (const node of graph.keys()) {
    const found = visit(node, []);
    if (found) { return found; }
  }
  return null;
}

/** Rules that read the whole collection. */
export function collectionRules(skills, ctx) {
  const out = [];
  const add = (id, severity, file, msg) => out.push({ id, severity, file, line: 1, msg });
  const byName = new Map();
  for (const s of skills) { byName.set(s.fm.name, [...(byName.get(s.fm.name) ?? []), s]); }

  const total = skills.filter((s) => s.alwaysInstalled).reduce((n, s) => n + String(s.fm.description ?? "").length, 0);
  if (total > ctx.config.descriptionBudget) {
    add(
      "CL201",
      "warn",
      "(collection)",
      `${total} description chars always installed, budget ${ctx.config.descriptionBudget}`,
    );
  }

  const graph = new Map();
  for (const s of skills) {
    const deps = dependencies(s);
    graph.set(s.fm.name, [...(graph.get(s.fm.name) ?? []), ...deps]);
    for (const dep of deps) {
      const targets = byName.get(dep) ?? [];
      if (targets.length === 0) { add("CL203", "error", s.path, `depends-on target does not exist: ${dep}`); }
      for (const t of targets) {
        if (meta(t).deprecated === "true") { add("CL204", "warn", s.path, `depends on a deprecated skill: ${dep}`); }
        if (invocationState(t.fm) === "user") {
          add(
            "CL205",
            "error",
            t.path,
            `user-only, but ${s.fm.name} depends on it`,
          );
        }
      }
    }
  }
  const cycle = hasCycle(graph);
  if (cycle) { add("CL203", "error", "(collection)", `dependency cycle: ${cycle.join(" -> ")}`); }

  for (const [name, group] of byName) {
    const adapters = group.filter((s) => meta(s).archetype === "adapter");
    if (adapters.length < 2) { continue; }
    const key = (s) => sections(s.body).map((x) => x.title).join("|");
    const first = key(adapters[0]);
    for (const s of adapters.slice(1)) {
      if (key(s) !== first) {
        add(
          "AD604",
          "warn",
          s.path,
          `sections differ from ${dirname(adapters[0].path)} for ${name}`,
        );
      }
    }
  }
  return out;
}
