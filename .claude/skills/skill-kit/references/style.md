# Writing style

Based on ASD-STE100, adapted for models. Verbosity comes from explanation,
hedging and repetition. Compress those, and keep a short reason on each rule.

## Rules

- One instruction per sentence — the model can miss the second one.
- Use the imperative and the active voice — the actor stays clear.
- Keep to 20 words in a numbered step, and 25 elsewhere — long sentences hide
  conditions.
- Use one term for one meaning — a synonym reads as a second thing.
- Cut filler such as `please`, `make sure to`, `in order to` and `carefully` —
  it adds tokens and no rule.
- Give each rule a reason as `rule — reason`, with at most 10 words — the model
  can then generalize.
- Name the correct action in each prohibition — a bare "do not" leaves a gap.
- Use at most 3 bold MUST or NEVER per skill — more emphasis dilutes all of it.
- Prefer plain to literary text — "Billed per row read" beats "a bill measured
  in rows".
- Keep precise technical terms — a term costs less than a paraphrase.

## Format by content

| Content                  | Format                                           |
| ------------------------ | ------------------------------------------------ |
| Guardrails, conventions  | Bullet: `rule — reason`                          |
| Procedure                | Numbered steps, with one action each             |
| Conditions and responses | Table: ID, condition, action                     |
| Judgment calls           | 2–4 sentences, with one good and one bad example |
| Lookup facts             | Table                                            |

## Keep

- Do not compress a rule until its condition goes — the condition is the rule.
- Keep an example that decides a judgment call — it costs less than the wrong
  result.
- Keep the reason for a surprising rule — without it, a later edit removes the
  rule.
