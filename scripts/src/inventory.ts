/**
 * Generates `plugins/stackgen/stacks/inventory.md` from the stacks tree.
 *
 * The inventory is a projection of five sources and nothing else:
 *
 *   plugins/stackgen/stacks/<type>/<slug>/pack.yaml   one row per pack
 *   plugins/stackgen/stacks/bundles/<slug>.md         one row per bundle
 *   plugins/stackgen/assets/kinds.md                  the closed kind vocabulary
 *   plugins/stackgen/tools/<slug>/tool.yaml           one row per tool entry
 *   plugins/stackgen/design-tools/<tool>/tool.yaml    one row per design tool
 *
 * It exists because the pack, bundle and kind counts used to be typed into four
 * prose files by hand, and drifted — one said 36 packs while 38 shipped, and the
 * manifest listed nine kinds while eleven were defined. A hand-maintained list
 * would drift the same way with more lines to get wrong. The tree is the only
 * inventory that is true by construction, so this renders the tree.
 *
 * The output is committed on purpose, so a reader (and a user who installed the
 * plugin) gets the table without running anything. That is also the only reason
 * `--check` exists: a generated-and-committed file has no other staleness
 * guarantee. Pre-commit and `plugins.yml` run it, the same as the marketplace
 * manifest.
 *
 * `plugins/**` is excluded from dprint, so the table lands exactly as rendered.
 *
 * Four things fail the generation outright rather than rendering a wrong row: a
 * pack, bundle, tool entry or design tool missing a field the format
 * requires — a bundle's `tools:` and `packs:` lists included, either of which
 * may be empty, and a retired `components:` list refused; a `kind` no heading
 * in `kinds.md` defines — the vocabulary is closed, and an undefined kind is a
 * typo, not a new kind; a bundle pack ref that is not
 * `<type>/<slug>@<version>`; and a ref that names no `pack.yaml`, or pins a
 * version differing from the one that pack.yaml carries. A pin that resolves to
 * nothing, or to a version the pack no longer has, would otherwise advertise a
 * composition the materializer cannot copy. `@generated` refs are skipped —
 * they name no pack by design. Whether a bundle's tool names are bootstrap's
 * is the checker's rule 14, against the committed snapshot.
 */

import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { firstDifference } from "./marketplace.ts";
import { frontmatterBlock } from "./plugins.ts";

export const STACKS_DIR = "plugins/stackgen/stacks";
export const BUNDLES_DIR = `${STACKS_DIR}/bundles`;
export const KINDS_PATH = "plugins/stackgen/assets/kinds.md";
export const INVENTORY_PATH = `${STACKS_DIR}/inventory.md`;
export const TOOLS_DIR = "plugins/stackgen/tools";
export const DESIGN_TOOLS_DIR = "plugins/stackgen/design-tools";

export interface Pack {
  readonly type: string;
  readonly slug: string;
  readonly name: string;
  readonly summary: string;
  readonly version: string;
  readonly kind: string;
  readonly axis: string;
  readonly category: string;
  readonly capability: string;
}

export interface Bundle {
  readonly slug: string;
  readonly name: string;
  readonly kind: string;
  readonly axis: string;
  /** Bootstrap tool names, no version. */
  readonly tools: readonly string[];
  /** Knowledge pack refs, `<type>/<slug>@<version>`. */
  readonly packs: readonly string[];
}

/** A tool knowledge entry under `tools/`, keyed by bootstrap tool. */
export interface ToolEntry {
  readonly slug: string;
  readonly version: string;
  /** The bootstrap tools it applies to; empty applies to every repo. */
  readonly tools: readonly string[];
}

/** A design tool folder under `design-tools/`. */
export interface DesignTool {
  readonly slug: string;
  readonly name: string;
  readonly version: string;
}

export interface Inventory {
  readonly kinds: readonly string[];
  readonly packs: readonly Pack[];
  readonly bundles: readonly Bundle[];
  readonly tools: readonly ToolEntry[];
  readonly designTools: readonly DesignTool[];
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

export function readInventory(repoRoot: string): Inventory {
  const kinds = readKinds(join(repoRoot, KINDS_PATH));
  const packs = readPacks(join(repoRoot, STACKS_DIR));
  const bundles = readBundles(join(repoRoot, BUNDLES_DIR));

  const defined = new Set(kinds);
  for (const pack of packs) {
    assertKind(defined, pack.kind, `${STACKS_DIR}/${pack.type}/${pack.slug}`);
  }
  for (const bundle of bundles) {
    assertKind(defined, bundle.kind, `${BUNDLES_DIR}/${bundle.slug}.md`);
  }
  assertComponents(packs, bundles);
  const tools = readToolEntries(join(repoRoot, TOOLS_DIR));
  const designTools = readDesignTools(join(repoRoot, DESIGN_TOOLS_DIR));

  return { kinds, packs, bundles, tools, designTools };
}

/**
 * The kind vocabulary, in definition order.
 *
 * Each kind is a level-two heading of the form ``## `name` — …`` in `kinds.md`.
 * The reserved-kinds and reviewer sections are headings too, but carry no
 * backticked name, so the pattern skips them without a special case.
 */
function readKinds(kindsPath: string): string[] {
  const text = readFileSync(kindsPath, "utf8");
  const kinds: string[] = [];
  for (const line of text.split("\n")) {
    const match = /^## `([a-z-]+)` /.exec(line);
    if (match?.[1]) {
      kinds.push(match[1]);
    }
  }
  if (kinds.length === 0) {
    throw new Error(`${KINDS_PATH} defines no kinds — the heading shape moved`);
  }
  return kinds;
}

/** Every `<type>/<slug>/pack.yaml`, sorted by type then slug. */
function readPacks(stacksDir: string): Pack[] {
  const packs: Pack[] = [];
  for (const type of subdirs(stacksDir)) {
    if (type === "bundles") {
      continue;
    }
    for (const slug of subdirs(join(stacksDir, type))) {
      const path = join(stacksDir, type, slug, "pack.yaml");
      if (!existsSync(path)) {
        continue;
      }
      const rel = `${STACKS_DIR}/${type}/${slug}/pack.yaml`;
      const doc = record(parseYaml(readFileSync(path, "utf8")), rel);
      packs.push({
        type,
        slug,
        name: required(doc, "name", rel),
        summary: required(doc, "summary", rel),
        version: required(doc, "version", rel),
        kind: required(doc, "kind", rel),
        axis: optional(doc, "axis"),
        category: optional(doc, "category"),
        capability: optional(doc, "capability"),
      });
    }
  }
  return packs.sort((a, b) => a.type.localeCompare(b.type) || a.slug.localeCompare(b.slug));
}

/** Every `bundles/<slug>.md` frontmatter, sorted by slug. */
function readBundles(bundlesDir: string): Bundle[] {
  const bundles: Bundle[] = [];
  const files = readdirSync(bundlesDir)
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b));
  for (const file of files) {
    const rel = `${BUNDLES_DIR}/${file}`;
    const block = frontmatterBlock(
      readFileSync(join(bundlesDir, file), "utf8"),
    );
    if (block === null) {
      throw new Error(`${rel} has no frontmatter`);
    }
    const doc = record(parseYaml(block), rel);
    if (doc["components"] !== undefined) {
      throw new Error(
        `${rel} carries the retired \`components:\` — a bundle lists `
          + `\`tools:\` and \`packs:\``,
      );
    }
    bundles.push({
      slug: file.slice(0, -".md".length),
      name: required(doc, "name", rel),
      kind: required(doc, "kind", rel),
      axis: required(doc, "axis", rel),
      tools: list(doc, "tools", rel),
      packs: list(doc, "packs", rel),
    });
  }
  return bundles;
}

/** Every `tools/<slug>/tool.yaml`, sorted by slug; none when the tree is absent. */
function readToolEntries(toolsDir: string): ToolEntry[] {
  if (!existsSync(toolsDir)) {
    return [];
  }
  const entries: ToolEntry[] = [];
  for (const slug of subdirs(toolsDir)) {
    const path = join(toolsDir, slug, "tool.yaml");
    const rel = `${TOOLS_DIR}/${slug}/tool.yaml`;
    if (!existsSync(path)) {
      throw new Error(`${TOOLS_DIR}/${slug} has no tool.yaml`);
    }
    const doc = record(parseYaml(readFileSync(path, "utf8")), rel);
    required(doc, "name", rel);
    required(doc, "summary", rel);
    entries.push({
      slug,
      version: required(doc, "version", rel),
      tools: list(doc, "tools", rel),
    });
  }
  return entries;
}

/** Every `design-tools/<tool>/tool.yaml`, sorted; the role skills are not a tool. */
function readDesignTools(designDir: string): DesignTool[] {
  if (!existsSync(designDir)) {
    return [];
  }
  const tools: DesignTool[] = [];
  for (const slug of subdirs(designDir)) {
    if (slug === "skills") {
      continue;
    }
    const path = join(designDir, slug, "tool.yaml");
    const rel = `${DESIGN_TOOLS_DIR}/${slug}/tool.yaml`;
    if (!existsSync(path)) {
      throw new Error(`${DESIGN_TOOLS_DIR}/${slug} has no tool.yaml`);
    }
    const doc = record(parseYaml(readFileSync(path, "utf8")), rel);
    required(doc, "summary", rel);
    tools.push({
      slug,
      name: required(doc, "name", rel),
      version: required(doc, "version", rel),
    });
  }
  return tools;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

export function renderInventory(inventory: Inventory): string {
  const { kinds, packs, bundles, tools, designTools } = inventory;
  const lines: string[] = [
    "<!-- Generated by scripts/src/inventory.ts — `mise run p:plugins:inventory`. Do not edit. -->",
    "",
    "# Inventory",
    "",
    "What this tree ships, rendered from the tree itself: every `<type>/<slug>/pack.yaml`",
    "under `stacks/`, every `bundles/<slug>.md` frontmatter, the kind headings in",
    "`../assets/kinds.md`, every `../tools/<slug>/tool.yaml` and every",
    "`../design-tools/<tool>/tool.yaml`. The narrative is [`readme.md`](readme.md); the",
    "shape of a pack is `../assets/pack-format.md`.",
    "",
    `**${packs.length} packs, ${bundles.length} bundles, ${kinds.length} kinds, `
    + `${tools.length} tool entries, ${designTools.length} design tools.**`,
    "",
    "## Kinds",
    "",
    "| Kind | Packs | Bundles |",
    "| ---- | ----: | ------: |",
  ];
  for (const kind of kinds) {
    const p = packs.filter((x) => x.kind === kind).length;
    const b = bundles.filter((x) => x.kind === kind).length;
    lines.push(`| \`${kind}\` | ${p} | ${b} |`);
  }

  lines.push(
    "",
    "## Packs",
    "",
    "| Component | Name | Kind | Axis | Category | Capability | Version | Summary |",
    "| --------- | ---- | ---- | ---- | -------- | ---------- | ------- | ------- |",
  );
  for (const p of packs) {
    lines.push(row([
      `\`${p.type}/${p.slug}\``,
      p.name,
      `\`${p.kind}\``,
      p.axis,
      p.category,
      p.capability,
      p.version,
      p.summary,
    ]));
  }

  lines.push(
    "",
    "## Bundles",
    "",
    "| Bundle | Name | Kind | Axis | Tools | Packs |",
    "| ------ | ---- | ---- | ---- | ----- | ----- |",
  );
  for (const b of bundles) {
    lines.push(row([
      `\`${b.slug}\``,
      b.name,
      `\`${b.kind}\``,
      b.axis,
      codes(b.tools),
      codes(b.packs),
    ]));
  }

  lines.push(
    "",
    "## Tool knowledge",
    "",
    "| Entry | Version | Tools |",
    "| ----- | ------- | ----- |",
  );
  for (const t of tools) {
    lines.push(row([
      `\`${t.slug}\``,
      t.version,
      t.tools.length > 0 ? codes(t.tools) : "every repo",
    ]));
  }

  lines.push(
    "",
    "## Design tools",
    "",
    "| Tool | Name | Version |",
    "| ---- | ---- | ------- |",
  );
  for (const d of designTools) {
    lines.push(row([`\`${d.slug}\``, d.name, d.version]));
  }

  return `${lines.join("\n")}\n`;
}

/** A list as comma-separated code spans; an empty list as an empty cell. */
function codes(items: readonly string[]): string {
  return items.map((item) => `\`${item}\``).join(", ");
}

/** One table row; a cell's pipes and newlines cannot be allowed to split it. */
function row(cells: readonly string[]): string {
  const safe = cells.map((c) => c.replace(/\s*\n\s*/g, " ").replace(/\|/g, "\\|"));
  return `| ${safe.join(" | ")} |`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function subdirs(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));
}

function record(value: unknown, rel: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${rel} is not a YAML mapping`);
  }
  return value as Record<string, unknown>;
}

function required(
  doc: Record<string, unknown>,
  key: string,
  rel: string,
): string {
  const value = doc[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${rel} is missing \`${key}:\``);
  }
  return value.trim();
}

/** A required list of strings, which may be empty. */
function list(
  doc: Record<string, unknown>,
  key: string,
  rel: string,
): string[] {
  const value = doc[key];
  if (!Array.isArray(value)) {
    throw new Error(`${rel} is missing \`${key}:\` (a list, which may be empty)`);
  }
  return value.map(String);
}

function optional(doc: Record<string, unknown>, key: string): string {
  const value = doc[key];
  return typeof value === "string" ? value.trim() : "";
}

function assertKind(defined: Set<string>, kind: string, rel: string): void {
  if (!defined.has(kind)) {
    throw new Error(
      `${rel} declares kind \`${kind}\`, which ${KINDS_PATH} does not define`,
    );
  }
}

/**
 * Every bundle pack pin resolves to a pack.yaml at exactly that version.
 *
 * A bundle is the recorded composition, so a pin is a claim about what the
 * materializer will copy. `@generated` is the one ref that names no pack: the
 * component is uncovered and runs the generation pipeline on first fetch.
 */
function assertComponents(
  packs: readonly Pack[],
  bundles: readonly Bundle[],
): void {
  const byRef = new Map(packs.map((p) => [`${p.type}/${p.slug}`, p]));
  for (const bundle of bundles) {
    const rel = `${BUNDLES_DIR}/${bundle.slug}.md`;
    for (const entry of bundle.packs) {
      const match = /^([a-z0-9-]+)\/([a-z0-9-]+)@(.+)$/.exec(entry);
      if (!match) {
        throw new Error(
          `${rel} pack ref "${entry}" is not <type>/<slug>@<version>`,
        );
      }
      const [, type, slug, version] = match;
      if (version === "generated") {
        continue;
      }
      const pack = byRef.get(`${type}/${slug}`);
      if (!pack) {
        throw new Error(
          `${rel} pins "${entry}" but there is no ${STACKS_DIR}/${type}/${slug}/pack.yaml`,
        );
      }
      if (pack.version !== version) {
        throw new Error(
          `${rel} pins "${entry}" but that pack.yaml is at version ${pack.version}`
            + ` — a bundle is the recorded composition, so bumping a pack means`
            + ` re-pinning every bundle that names it`,
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (import.meta.main) {
  const repoRoot = join(import.meta.dirname, "..", "..");
  const generated = renderInventory(readInventory(repoRoot));
  const target = join(repoRoot, INVENTORY_PATH);

  if (process.argv.includes("--check")) {
    const committed = existsSync(target) ? readFileSync(target, "utf8") : "";
    if (committed !== generated) {
      console.error(
        `${INVENTORY_PATH} is not what the stackgen tree generates.\n`,
      );
      console.error(firstDifference(committed, generated));
      console.error(
        `\nRe-run 'mise run p:plugins:inventory' and stage the result.`,
      );
      process.exit(1);
    }
    console.log(`${INVENTORY_PATH} is up to date.`);
  } else {
    writeFileSync(target, generated);
    console.log(`wrote ${INVENTORY_PATH}`);
  }
}
