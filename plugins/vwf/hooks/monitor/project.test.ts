import {
  expect,
  test,
} from "claude-code/testing";

import type { GitIo } from "./project";
import {
  classify,
  findRoot,
  identityOf,
  normalise,
  originUrl,
  project,
  resolveColor,
  withoutPrivateUse,
  worktreeSubpath,
} from "./project";

/** A file system of the given files; a path that holds a file is a folder. */
function io(files: Record<string, string>): GitIo {
  return {
    kind: async (path) =>
      path in files ? "file" : Object.keys(files).some((one) => one.startsWith(`${path}/`)) ? "dir" : undefined,
    read: async (path) => files[path],
  };
}

const HEAD = "ref: refs/heads/main\n";
const origin = (url: string) => `[core]\n\tbare = false\n[remote "origin"]\n\turl = ${url}\n`;

test("the checkout root is the nearest folder with a readable HEAD", async () => {
  const files = { "/a/repo/.git/HEAD": HEAD, "/a/repo/src/x.ts": "" };
  expect(await findRoot("/a/repo/src/deep", io(files))).toBe("/a/repo");
  expect(await findRoot("/elsewhere", io(files))).toBe(undefined);
  // A .git with no HEAD does not stop the walk.
  expect(await findRoot("/a/repo/inner", io({ ...files, "/a/repo/inner/.git/config": "" }))).toBe("/a/repo");
});

test("a plain repo is kind git, named parent/base", async () => {
  expect(await project("/u/acme/widget", io({ "/u/acme/widget/.git/HEAD": HEAD }))).toEqual({
    kind: "git",
    name: "acme/widget",
    root: "/u/acme/widget",
  });
});

test("an origin on github or gitlab names the URL path; another host is remote", async () => {
  const one = async (url: string) =>
    project("/u/x/y", io({ "/u/x/y/.git/HEAD": HEAD, "/u/x/y/.git/config": origin(url) }));
  expect(await one("git@github.com:acme/widget.git")).toMatchObject({ kind: "github", name: "acme/widget" });
  expect(await one("https://gitlab.example.com/group/sub/repo")).toMatchObject({
    kind: "gitlab",
    name: "group/sub/repo",
  });
  expect(await one("https://git.example.com/src/thing.git")).toMatchObject({ kind: "remote", name: "x/y" });
});

test("classify and originUrl read URLs and configs the way git does", () => {
  expect(classify("ssh://git@github.com:22/acme/widget.git/")).toEqual(["github", "acme/widget"]);
  expect(classify("file:///srv/repo.git")).toEqual(["remote", undefined]);
  expect(classify("/srv/repo.git")).toEqual(["remote", undefined]);
  expect(originUrl("[Remote \"origin\"]\n url = \"git@x:a/b\" # c\n")).toBe("git@x:a/b");
  expect(originUrl("[remote \"origin\"]\n\tURL = git@x:a/b ; c\n")).toBe("git@x:a/b");
  expect(originUrl("[remote \"upstream\"]\n\turl = git@x:a/b\n")).toBe(undefined);
  expect(normalise("/a/b/../c/./d")).toBe("/a/c/d");
});

test("a linked worktree names its main checkout", async () => {
  const files = {
    "/u/acme/widget/.git/HEAD": HEAD,
    "/u/acme/widget/.git/config": origin("git@github.com:acme/widget.git"),
    "/u/acme/widget/.git/worktrees/feat/HEAD": HEAD,
    "/u/acme/widget/.git/worktrees/feat/commondir": "../..\n",
    "/u/acme/widget/.worktrees/feat/.git": "gitdir: /u/acme/widget/.git/worktrees/feat\n",
  };
  const root = await findRoot("/u/acme/widget/.worktrees/feat", io(files));
  expect(root).toBe("/u/acme/widget/.worktrees/feat");
  expect(await project(root!, io(files))).toEqual({
    kind: "github",
    name: "acme/widget",
    root: "/u/acme/widget",
  });
});

test("a submodule names the outermost superproject", async () => {
  const files = {
    "/u/acme/top/.git/HEAD": HEAD,
    "/u/acme/top/.git/modules/lib/HEAD": HEAD,
    "/u/acme/top/lib/.git": "gitdir: ../.git/modules/lib\n",
  };
  expect(await project("/u/acme/top/lib", io(files))).toMatchObject({ name: "acme/top", root: "/u/acme/top" });
});

test("the worktree subpath is everything after the last matching part", () => {
  expect(worktreeSubpath("/Users/x/repo/.worktrees/main-bar", "worktree")).toBe("main-bar");
  expect(worktreeSubpath("/a/WORKTREES/b", "worktree")).toBe("b");
  expect(worktreeSubpath("/a/worktree/b/worktrees/c", "worktree")).toBe("c");
  expect(worktreeSubpath("/a/worktrees", "worktree")).toBe(undefined);
  expect(worktreeSubpath("/a/trees/b", "^trees$")).toBe("b");
});

test("colours resolve through the palette, then hex, then the palette's white", () => {
  const palette = { green: [152, 151, 26], white: [251, 241, 199] };
  expect(resolveColor("green", palette)).toBe("#98971a");
  expect(resolveColor("#fff", palette)).toBe("#ffffff");
  expect(resolveColor([1, 2, 300], palette)).toBe("#0102ff");
  expect(resolveColor("nope", palette)).toBe("#fbf1c7");
});

test("the row's blocks follow claude-status's config layers", async () => {
  const files = {
    "/u/acme/widget/.git/HEAD": HEAD,
    "/u/acme/widget/.git/config": origin("git@github.com:acme/widget.git"),
  };
  const shipped = await identityOf("/u/acme/widget/src", "/home/me", io(files));
  expect(shipped?.project).toEqual({
    glyph: "\u{f09b}",
    text: "acme/widget",
    fg: "#fbf1c7",
    bg: "#98971a",
    bold: true,
  });
  expect(shipped?.worktree).toBe(undefined);
  expect(shipped?.sep).toBe("\u{e0b0}");

  const user = JSON.stringify({
    symbols: { projectGithub: "GH" },
    segments: { project: { bg: "#000000" } },
    projectName: "from-user",
  });
  const repo = JSON.stringify({ projectName: "from-repo\u001b[31m", segments: { project: { bg: "red" } } });
  const layered = await identityOf(
    "/u/acme/widget",
    "/home/me",
    io({
      ...files,
      "/home/me/.config/claude-status/config.json": user,
      "/u/acme/widget/.config/claude-status.json": repo,
    }),
  );
  // The repo layer sets the name alone; the user layer sets the rest.
  expect(layered?.project).toMatchObject({ glyph: "GH", text: "from-repo[31m", bg: "#000000", bold: true });
});

test("a worktree has its block, and outside git there is no identity", async () => {
  const files = {
    "/u/acme/widget/.git/HEAD": HEAD,
    "/u/acme/widget/.git/worktrees/feat/HEAD": HEAD,
    "/u/acme/widget/.git/worktrees/feat/commondir": "../..\n",
    "/u/acme/widget/.worktrees/feat/.git": "gitdir: /u/acme/widget/.git/worktrees/feat\n",
  };
  const one = await identityOf("/u/acme/widget/.worktrees/feat", undefined, io(files));
  expect(one?.project.text).toBe("acme/widget");
  expect(one?.worktree).toEqual({
    glyph: "\u{1f332}",
    text: "\u{f07b} feat",
    fg: "#3c3836",
    bg: "#d79921",
    bold: false,
  });
  expect(await identityOf("/tmp/x", undefined, io(files))).toBe(null);
  expect(withoutPrivateUse("\u{f07b} feat")).toBe("feat");
  expect(withoutPrivateUse("\u{1f332}")).toBe("\u{1f332}");
});
