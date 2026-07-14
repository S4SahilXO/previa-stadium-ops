# LEARNING_LOG.md — Maintenance Instructions for Antigravity

> This file is a companion to `PREVIA_MASTER_BUILD_PROMPT.md`. Its job: make sure the human builder actually understands the project and the code, not just watches it appear.

## What to do

At the end of **every** work session or phase, append a new dated entry to a file called `LEARNING_LOG.md` in the repo root (create it in Phase 0 if it doesn't exist). Never overwrite previous entries — always append.

## Entry format (use this template exactly)

```markdown
## [Phase N] — <short title> — <date>

### What we built
Plain-language summary, 3–6 sentences. No unexplained jargon — if you use a term
like "orchestration," "WebSocket," or "confidence score," define it in one clause
the first time it appears in this file.

### Why we built it this way
The actual reasoning/tradeoff behind the approach, including any alternative that
was rejected and why.

### Key code/concepts to understand
- `path/to/file.ts` — what it does, in one line
- Concept: <name> — 2–3 sentence explanation, aimed at someone comfortable with
  Python but still learning JS/architecture/AI pipelines.

### Try it yourself
One small, concrete exercise the builder could do to test their understanding of
what was just built (e.g. "try changing the risk threshold in `config.ts` and
observe how the recommendation confidence shifts").

### Open questions / what's next
What's still undecided or coming in the next phase.
```

## Rules

- Write for someone learning, not for another senior engineer — avoid unexplained acronyms, avoid assuming familiarity with frameworks not already used in this project.
- Keep each entry readable in under 3 minutes.
- If a phase involves an AI prompt (Gemini call), always paste the actual prompt used into this file, not a paraphrase — this doubles as material for the technical blog later.
- If something broke and got fixed, log the bug and the fix — that's often the most valuable learning content in the whole file.
- Never skip a session without an entry, even a short one. If nothing meaningful changed, say so briefly rather than omitting the entry.
