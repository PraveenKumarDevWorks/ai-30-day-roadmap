# Day 22: LLM output validation

**Week 4 — Production AI — Scale & Quality** · Category: Backend

## Status

- [ ] Not started

## What to build

Use Zod + an Instructor-style pattern to force structured JSON output from the local LLM. Handle malformed responses with retry logic. Never trust raw LLM output in production.

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- Why LLM output can't be trusted as-is, even with a "return JSON" instruction
- The Instructor pattern: schema-guided prompting + validation + automatic retry on failure
- Designing a bounded retry loop (e.g. max 2 retries, then fail gracefully)

## Stack for this project

NestJS, Zod

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
