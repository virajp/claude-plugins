#!/usr/bin/env node
// The hook half of the /vwf:execute action log. action-log.sh runs it, with
// the hook payload on stdin, only while some session holds a run marker.
//
// It appends one line to the session's log — the file named by
// <root>/active/<session_id>, which skills/execute/scripts/log.mjs writes —
// and does nothing for a session with no marker. <root> is $VWF_LOG_ROOT,
// default /tmp/vwf. The event, by hook:
//
//   PreToolUse     tool.start  tool, tool_use_id, summary
//   PostToolUse    tool.end    tool, tool_use_id, dur_ms; an Agent call adds
//                              child, the id of the agent it spawned
//   SubagentStart  agent.start agent_type
//   SubagentStop   agent.end   agent_type, gaps — the GAP: and UNRESOLVED:
//                              lines of the agent's last message
//
// Every line carries ts, run, session, agent (the payload's agent_id: null for
// the orchestrator, set for a subagent's own tool calls) and event. The
// summary is short and never a file's content: a Bash call's description or
// the head of its command, a file tool's path, a search's pattern, a skill's
// name, an Agent call's subagent type and description.

import {
  appendFileSync,
  existsSync,
  readFileSync,
} from "node:fs";
import {
  basename,
  join,
} from "node:path";

const ROOT = process.env.VWF_LOG_ROOT || "/tmp/vwf";
const MAX = 200;

const clip = s => (typeof s === "string"
  ? s.replace(/\s+/g, " ").trim().slice(0, MAX)
  : undefined);

function summary(tool, input = {}) {
  switch (tool) {
    case "Bash":
      return clip(input.description || input.command);
    case "Read":
    case "Write":
    case "Edit":
    case "NotebookEdit":
      return clip(input.file_path || input.notebook_path);
    case "Grep":
    case "Glob":
      return clip(input.pattern);
    case "Skill":
      return clip([input.skill, input.args].filter(Boolean).join(" "));
    case "Agent":
    case "Task":
      return clip(
        [input.subagent_type, input.name, input.description]
          .filter(Boolean)
          .join(" :: ")
          + (input.run_in_background ? " [bg]" : ""),
      );
    default:
      return undefined;
  }
}

function gapLines(text) {
  if (typeof text !== "string") {
    return [];
  }
  return text
    .split("\n")
    .map(l => l.trim())
    .filter(l => /^(GAP|UNRESOLVED):/.test(l) && !/:\s*none\b/i.test(l))
    .map(l => l.slice(0, 2 * MAX));
}

function main() {
  let p;
  try {
    p = JSON.parse(readFileSync(0, "utf8"));
  }
  catch {
    return;
  }
  if (!p || typeof p.session_id !== "string") {
    return;
  }
  const marker = join(ROOT, "active", p.session_id);
  if (!existsSync(marker)) {
    return;
  }
  const file = readFileSync(marker, "utf8").trim();
  if (!file) {
    return;
  }

  const line = {
    ts: new Date().toISOString(),
    run: basename(file, ".jsonl"),
    session: p.session_id,
    agent: p.agent_id ?? null,
  };
  switch (p.hook_event_name) {
    case "PreToolUse":
      Object.assign(line, {
        event: "tool.start",
        tool: p.tool_name,
        tool_use_id: p.tool_use_id,
        summary: summary(p.tool_name, p.tool_input),
      });
      break;
    case "PostToolUse": {
      Object.assign(line, {
        event: "tool.end",
        tool: p.tool_name,
        tool_use_id: p.tool_use_id,
        dur_ms: p.duration_ms,
      });
      const child = p.tool_response?.agentId;
      if ((p.tool_name === "Agent" || p.tool_name === "Task") && child) {
        line.child = child;
      }
      break;
    }
    case "SubagentStart":
      Object.assign(line, { event: "agent.start", agent_type: p.agent_type });
      break;
    case "SubagentStop":
      Object.assign(line, {
        event: "agent.end",
        agent_type: p.agent_type,
        gaps: gapLines(p.last_assistant_message),
      });
      break;
    default:
      return;
  }
  appendFileSync(file, JSON.stringify(line) + "\n");
}

try {
  main();
}
catch {
  // A logging fault never reaches the session.
}
