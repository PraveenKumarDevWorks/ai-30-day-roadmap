# Day 25: AI response caching

**Week 4 — Production AI — Scale & Quality** · Category: Backend

## Status

- [ ] Not started

## What to build

Hash the prompt + context. Check Redis before calling the LLM. Return the cached response if there's a hit. Saves compute and improves latency for repeated queries.

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- Designing a stable cache key from a hash of prompt + relevant context
- Cache invalidation: when a cached AI response goes stale and needs to be cleared
- Measuring the latency/compute savings from cache hits

## Stack for this project

NestJS, Redis

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
