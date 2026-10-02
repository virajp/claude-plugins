// The scripted tools, loaded on demand. A tool absent here is still the
// prose's — its references/<tool>.md — and `all` returns it as
// {tool, handled: "prose"} for the skill to follow.

export const tools = {
  mise: () => import("./mise.mjs"),
};
