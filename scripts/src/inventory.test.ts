import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import {
  dirname,
  join,
} from "node:path";
import {
  describe,
  expect,
  it,
} from "vitest";
import {
  BUNDLES_DIR,
  INVENTORY_PATH,
  readInventory,
  renderInventory,
  STACKS_DIR,
} from "./inventory.ts";

const repoRoot = join(import.meta.dirname, "..", "..");
const inventory = readInventory(repoRoot);
const generated = renderInventory(inventory);

describe("the generated stackgen inventory", () => {
  it("is byte-identical to the committed file", () => {
    // The same assertion `plugins:inventory --check` makes. Pinned here as well
    // as in the task because the task only runs where mise does, and a count
    // typed into prose is exactly the drift this file replaced.
    const committed = readFileSync(join(repoRoot, INVENTORY_PATH), "utf8");
    expect(committed).toBe(generated);
  });

  it("lists every pack.yaml in the tree, and nothing else", () => {
    const stacks = join(repoRoot, STACKS_DIR);
    const onDisk = readdirSync(stacks, { recursive: true, withFileTypes: true })
      .filter(e => e.isFile() && e.name === "pack.yaml")
      .length;
    expect(inventory.packs.length).toBe(onDisk);
    expect(generated).toContain(`**${onDisk} packs, `);
  });

  it("lists every bundle file", () => {
    const onDisk = readdirSync(join(repoRoot, BUNDLES_DIR))
      .filter(f => f.endsWith(".md"))
      .length;
    expect(inventory.bundles.length).toBe(onDisk);
  });

  it("only uses kinds that kinds.md defines", () => {
    // readInventory throws on an undefined kind; this pins the positive side —
    // every kind in the table has at least one pack or bundle, so a kind that
    // is defined but never authored against is visible as a zero row, not
    // silently dropped.
    const used = new Set([
      ...inventory.packs.map(p => p.kind),
      ...inventory.bundles.map(b => b.kind),
    ]);
    for (const kind of used) {
      expect(inventory.kinds).toContain(kind);
    }
    for (const kind of inventory.kinds) {
      expect(generated).toContain(`| \`${kind}\` | `);
    }
  });

  it("keeps a cell's pipes from splitting the row", () => {
    const rendered = renderInventory({
      kinds: ["k"],
      packs: [{
        type: "t",
        slug: "s",
        name: "a | b",
        summary: "line one\n  line two",
        version: "0.1.0",
        kind: "k",
        axis: "",
        category: "",
        capability: "",
      }],
      bundles: [],
    });
    expect(rendered).toContain("| a \\| b |");
    expect(rendered).toContain("| line one line two |");
  });
});

describe("component refs", () => {
  // A temp root mirroring the three sources `readInventory` reads, so a pin
  // that resolves to nothing can be asserted without authoring a broken bundle
  // into the real tree. The corpus itself resolves today, so the tests above
  // stay green.
  function root(options: {
    readonly pack?: { readonly path: string; readonly version: string; };
    readonly components: readonly string[];
  }): string {
    const dir = mkdtempSync(join(tmpdir(), "inventory-"));
    write(
      join(dir, "plugins/stackgen/assets/kinds.md"),
      "## `cloud-provider` — where the product runs\n",
    );
    if (options.pack) {
      write(
        join(dir, `plugins/stackgen/stacks/${options.pack.path}/pack.yaml`),
        [
          "name: A Pack",
          "summary: one line",
          `version: ${options.pack.version}`,
          "kind: cloud-provider",
          "",
        ]
          .join("\n"),
      );
    }
    write(
      join(dir, "plugins/stackgen/stacks/bundles/a-bundle.md"),
      [
        "---",
        "name: A Bundle",
        "kind: cloud-provider",
        "axis: backing",
        "components:",
        ...options.components.map(c => `- ${c}`),
        "---",
        "",
        "# A Bundle",
        "",
      ]
        .join("\n"),
    );
    return dir;
  }

  function write(path: string, text: string): void {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
  }

  it("resolves a ref pinned to the pack's own version", () => {
    const dir = root({
      pack: { path: "cloud-provider/acme", version: "0.1.0" },
      components: ["cloud-provider/acme@0.1.0"],
    });
    expect(readInventory(dir).bundles[0]?.components).toEqual([
      "cloud-provider/acme@0.1.0",
    ]);
  });

  it("throws on a ref shaped unlike <type>/<slug>@<version>", () => {
    const dir = root({
      pack: { path: "cloud-provider/acme", version: "0.1.0" },
      components: ["cloud-provider/acme"],
    });
    expect(() => readInventory(dir)).toThrow(
      /a-bundle\.md component ref "cloud-provider\/acme" is not <type>\/<slug>@<version>/,
    );
  });

  it("throws on a ref naming a slug with no pack.yaml", () => {
    const dir = root({
      pack: { path: "cloud-provider/acme", version: "0.1.0" },
      components: ["cloud-provider/ghost@0.1.0"],
    });
    expect(() => readInventory(dir)).toThrow(
      /a-bundle\.md pins "cloud-provider\/ghost@0\.1\.0" but there is no plugins\/stackgen\/stacks\/cloud-provider\/ghost\/pack\.yaml/,
    );
  });

  it("throws on a ref pinned to a version the pack no longer carries", () => {
    const dir = root({
      pack: { path: "cloud-provider/acme", version: "0.2.0" },
      components: ["cloud-provider/acme@0.1.0"],
    });
    expect(() => readInventory(dir)).toThrow(
      /pins "cloud-provider\/acme@0\.1\.0" but that pack\.yaml is at version 0\.2\.0/,
    );
  });

  it("skips an @generated ref, which names no pack by design", () => {
    const dir = root({
      pack: { path: "cloud-provider/acme", version: "0.1.0" },
      components: ["cloud-provider/acme@0.1.0", "cloud-service/none@generated"],
    });
    expect(readInventory(dir).packs.length).toBe(1);
  });
});
