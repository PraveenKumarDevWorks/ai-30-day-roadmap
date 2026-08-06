# Day 7: Revision day

**Week 1 — AI Foundations — Text & APIs** · Category: Full Stack

## Status

- [x] Done (2026-08-06)

This day is different from the others — no new feature, no new stack. Just three things: review what's been built, polish one weak spot, and write a `CLAUDE.md` so future work in this repo starts with full context instead of from zero.

---

## Review: Days 1-6, in plain words

**Day 1 — LLM API integration.** Chat page, streams Ollama's reply word by word through a Next.js route handler. Solid. No changes needed.

**Day 2 — Prompt engineering basics.** Same task run three ways (zero-shot, few-shot, chain-of-thought) side by side, plus temperature/top_p sliders. Solid. Good example of the "one shared prompt-building function" pattern used again later.

**Day 3 — Streaming text responses.** Compares plain fetch streaming against real Server-Sent Events, with a proper typewriter effect and a simulated dropped-connection demo. Solid, and probably the most conceptually dense day so far — worth re-reading before Week 2's RAG chatbot, since that will also stream.

**Day 4 — AI-powered search.** First NestJS day, first real database (Postgres + pgvector), first raw-SQL-because-Prisma-can't-do-vectors pattern. Solid, though the inline HTML tester has no error handling if a fetch fails — a fine target for a future polish pass, not urgent.

**Day 5 — Text summarization.** Chunking + map-reduce, with its own progress-event stream instead of token streaming. Solid. The URL-fetching path is clearly and honestly flagged as demo-quality (naive HTML stripping), which is the right call rather than pretending it's production-ready.

**Day 6 — Sentiment analysis API.** First Redis day, cache-aside pattern, `format: 'json'` plus defensive parsing. This is where the review found a real gap — see below.

## What got polished, and why Day 6

Day 6's `AnalyzeSentimentDto` had **no upper limit on input text length**. Every other day that deals with long text (Day 5, specifically) actively handles the "text might be too long for the model's context window" problem — chunking it, summarizing piece by piece. Day 6 quietly had no such protection at all: paste in a huge wall of text, and it would just get sent straight to Ollama with no warning, no chunking, and no error — silently risking a truncated or low-quality result instead of a clear failure.

This was the clearest, most concrete gap across all 6 days — not a style issue, an actual missing safeguard — so it's the one that got fixed:

```ts
@MaxLength(3000, {
  message:
    'text is too long for this endpoint (max 3000 characters) — sentiment analysis works fine on an excerpt; ' +
    'for full long documents, see the chunking approach in Day 5 instead.',
})
text: string
```

One line, using validation machinery that was already wired up (the global `ValidationPipe` from Day 4 onward) — a good example of how a small, well-placed check can close a real gap without a big rewrite. Full details are in Day 6's own README, under "Polished on Day 7."

## CLAUDE.md

Added at the repo root: `/CLAUDE.md`. It covers the folder structure, the port-numbering convention (Next.js on 3000, NestJS incrementing from 3001), the full 5-section README template so it doesn't have to be re-explained every day, coding conventions actually observed across Days 1-6 (thin NestJS controllers, `class-validator` DTOs, defensive parsing, streaming vs non-streaming Ollama calls), and the git/GitHub setup.

The goal: any future Claude Code session opened in this repo — even a brand new one with no memory of these conversations — should be able to read `CLAUDE.md` once and immediately know how this project works and what "matching the existing style" actually means, instead of guessing from scratch or asking Praveen to re-explain it every time.

---

## What to build

Review days 1-6. Polish one of the features. Write a short CLAUDE.md for your AI project so Claude Code can assist future sessions better.

## Deep-dive topics

- What belongs in a good CLAUDE.md: stack, conventions, how to run things, gotchas
- Picking the weakest of the 6 features and hardening it end to end

## Stack for this project

Review/writing day — no new stack
