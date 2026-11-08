# §3 — Interview, one question at a time

Work through `${CLAUDE_PLUGIN_ROOT}/assets/plan-interview.md` top to bottom. It
is shared with `/vwf:plan`, and it owns the items, their order and the ending
condition. Follow the *Change plans:* note where an item carries one.

- Make each item one `AskUserQuestion` call, or a prose question when the answer
  is open-ended — one decision per turn.
- Never batch, and never assume an answer — a batched answer hides a decision.
- Confirm an item the survey already answered in a sentence — re-asking wastes
  the user's turn.
- Ask only what has more than one reasonable answer given the repo. Lead with
  your recommendation and why, and let the user pick or redirect.
- Record each ruling with its rejected alternatives — a ruling recorded without
  them is one the next plan re-opens.
- When the user says "just decide", record an assumed decision with your
  reasoning and the alternative you rejected. The `decisions` list of
  `index.json` is what they review.
