import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import {
  delimiter,
  dirname,
  join,
} from "node:path";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  main,
  renderSnapshot,
  SNAPSHOT_PATH,
} from "./bootstrap-tools.ts";

const repoRoot = join(import.meta.dirname, "..", "..");

/**
 * A `PATH` holding only a stub `bootstrap` that prints `reply` and exits with
 * `code` — no test runs the real one — plus the directory of `sh` itself.
 */
function stub(reply: string, code = 0): NodeJS.ProcessEnv {
  const bin = mkdtempSync(join(tmpdir(), "bootstrap-stub-"));
  const script = join(bin, "bootstrap");
  writeFileSync(join(bin, "reply.json"), reply);
  writeFileSync(
    script,
    `#!/bin/sh\ncat "${join(bin, "reply.json")}"\nexit ${code}\n`,
  );
  chmodSync(script, 0o755);
  return { PATH: [bin, "/bin", "/usr/bin"].join(delimiter) };
}

/** A temp repo root with no snapshot yet. */
function repo(): string {
  const root = mkdtempSync(join(tmpdir(), "bootstrap-tools-"));
  mkdirSync(dirname(join(root, SNAPSHOT_PATH)), { recursive: true });
  return root;
}

const catalog = (tools: unknown) =>
  JSON.stringify({
    contract: 1,
    command: "catalog",
    ok: true,
    code: 0,
    data: { tools },
    errors: [],
    warnings: [],
  });

const tools = [
  { name: "pnpm", category: "package-managers", description: "x", questions: [] },
  { name: "node", category: "languages", description: "y", questions: [] },
];

describe("bootstrap-tools", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes the catalog's tools as a sorted list of name and category", () => {
    const root = repo();
    expect(main(root, [], stub(catalog(tools)))).toBe(0);
    expect(JSON.parse(readFileSync(join(root, SNAPSHOT_PATH), "utf8"))).toEqual([
      { name: "node", category: "languages" },
      { name: "pnpm", category: "package-managers" },
    ]);
  });

  it("checks without writing, and fails when the committed file differs", () => {
    const root = repo();
    expect(main(root, ["--check"], stub(catalog(tools)))).toBe(1);
    expect(existsSync(join(root, SNAPSHOT_PATH))).toBe(false);

    writeFileSync(join(root, SNAPSHOT_PATH), renderSnapshot(tools));
    expect(main(root, ["--check"], stub(catalog(tools)))).toBe(0);

    const more = [...tools, { name: "bun", category: "languages" }];
    expect(main(root, ["--check"], stub(catalog(more)))).toBe(1);
    expect(readFileSync(join(root, SNAPSHOT_PATH), "utf8")).toBe(
      renderSnapshot(tools),
    );
  });

  it("exits 1 with bootstrap's errors when it answers ok: false", () => {
    const root = repo();
    const reply = JSON.stringify({
      ok: false,
      code: 2,
      data: null,
      errors: [{ code: 2, message: "catalog has no flag --bogus" }],
    });
    expect(main(root, [], stub(reply, 0))).toBe(1);
    expect(console.error).toHaveBeenCalledWith("catalog has no flag --bogus");
    expect(existsSync(join(root, SNAPSHOT_PATH))).toBe(false);
  });

  it("exits 1 when bootstrap fails with no JSON reply", () => {
    const root = repo();
    expect(main(root, [], stub("not json", 3))).toBe(1);
    expect(existsSync(join(root, SNAPSHOT_PATH))).toBe(false);
  });

  it("exits 1 when no bootstrap is on PATH", () => {
    const root = repo();
    const empty = mkdtempSync(join(tmpdir(), "no-bootstrap-"));
    expect(main(root, [], { PATH: empty })).toBe(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("bootstrap could not run"),
    );
  });

  it("matches the committed snapshot's own shape", () => {
    // The committed file is a real run's output; re-rendering it is a no-op.
    const committed = readFileSync(join(repoRoot, SNAPSHOT_PATH), "utf8");
    expect(renderSnapshot(JSON.parse(committed))).toBe(committed);
  });
});
