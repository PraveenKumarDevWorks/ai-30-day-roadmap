# Day 27: AI feature flags

**Week 4 — Production AI — Scale & Quality** · Category: Full Stack

## Status

- [ ] Not started

## What to build

Use Redis to toggle AI features on/off per tenant. Comixo can enable AI for some food businesses and not others. Combine with rate limits for a full tier system.

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- Feature flag patterns and where Redis fits as a fast, shared toggle store
- Per-tenant config keys in Redis
- Combining feature flags with the rate limiter from Day 23 into a tier system

## Stack for this project

NestJS, Redis

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
