# §5 — Present the shape: the hard gate

Write nothing to disk before this gate, save a parked record, which
[scope-check.md](scope-check.md) owns. Present these sections, scaled to their
weight, in one message. Ask no question per section: each default the interview
stated, not asked, is shown here, and this gate is where the user changes it.

1. The goal and the reversals, if any.
2. The decisions: every ruling and its rejected alternatives.
3. The unit map: id, wave, owned paths, depends-on. State why each wave is safe
   to run concurrently, and the named reason each unit in a later wave waits.
   State the execution mode and its reason.
4. Every new third-party dependency any unit introduces: package, what for,
   which unit. The user consents to a dependency here, and a unit adds none the
   plan does not name.
5. The unit gate, the wave gate, the plan gate, the after-landing steps, the
   gates the orchestrator keeps, and the derived priority.
6. The consent — `merge` and `end_all_run` — and the release levels with their
   reasons. State each as a fact, like the priority. The user may change any of
   them here.
7. The parked list.

**The derived priority** is what `plan-management priority <requires…>` returns.
Pass it the `requires` entries item 12 settled: folder basenames or none, since
no folder exists before §6. State it as a fact with its arithmetic: `10 + max`
over the `priority` of every unarchived `requires` row in the plan index, naming
the row it stands on, or "requires nothing active → 10". Never ask it. The one
thing that changes it is a required plan the user names here that the interview
missed. Then run the verb again.

Then ask once: **approve**, **revise** or **abandon**. *Revise* names the
section, or the stated default, to change. Only approve continues.
Halt H1 in `SKILL.md` covers the other two.
