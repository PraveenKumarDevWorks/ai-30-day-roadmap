# Day 26: Observability for AI

**Week 4 — Production AI — Scale & Quality** · Category: Infra

## Status

- [ ] Not started

## What to build

Log every LLM call: prompt, response, latency, token count, model. Build a simple dashboard in Next.js that shows usage trends. Since Ollama is local, use a custom PostgreSQL-based tracer instead of a paid tool like LangSmith.

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- What to log for every AI call: prompt, response, latency, token count, model, cost (even if $0 for local)
- Building a lightweight custom tracer table in PostgreSQL instead of a paid SaaS tracer
- Charting usage trends in a Next.js dashboard

## Stack for this project

NestJS, PostgreSQL, Next.js

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
