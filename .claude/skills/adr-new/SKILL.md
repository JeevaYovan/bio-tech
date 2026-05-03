---
name: adr-new
description: Create a new ADR. Use for any architectural choice, custom component, or Klaro override.
argument-hint: "<short-title>"
---

Create `docs/decisions/NNNN-<slug>.md` (next padded number; pad to 4
digits, e.g. `0001-angular-klaro-stack.md`).

Use the MADR-lite template:

```markdown
# NNNN. <Title>

- Status: proposed
- Date: <YYYY-MM-DD>
- Deciders: <user>

## Context
<problem and forces — fill from user, do not invent>

## Options
1. <Option A>
2. <Option B>
3. <Option C>

## Decision
<chosen option and one-line rationale>

## Consequences
- Positive: ...
- Negative: ...
- Neutral: ...
```

ASK me to fill Context and Options first; never invent options or
rationale. The decision and consequences sections can be drafted from
the conversation, but pause for confirmation before marking Status
`accepted`.
