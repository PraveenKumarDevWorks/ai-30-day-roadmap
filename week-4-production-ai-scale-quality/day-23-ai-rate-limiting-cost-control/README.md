# Day 23: AI rate limiting & cost control

**Week 4 — Production AI — Scale & Quality** · Category: Backend

## Status

- [ ] Not started

## What to build

Track token usage per user in Redis. Set limits per plan. Return 429 when exceeded. Log usage to PostgreSQL for billing. A real SaaS pattern — even with a free local model, this matters for compute/GPU capacity.

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- Counting tokens for a local model (or approximating via character/word count)
- Redis counters with expiry for sliding-window rate limits
- Writing a NestJS guard/interceptor that enforces the limit and returns 429
- Logging usage events to PostgreSQL for later billing/reporting

## Stack for this project

NestJS, Redis, PostgreSQL, Prisma

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
