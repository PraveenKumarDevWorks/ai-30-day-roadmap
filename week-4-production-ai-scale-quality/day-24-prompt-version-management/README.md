# Day 24: Prompt version management

**Week 4 — Production AI — Scale & Quality** · Category: Full Stack

## Status

- [ ] Not started

## What to build

Store prompts in the DB with versions. A/B test two prompt versions on 50/50 traffic. Log which prompt gave better outcomes. Improve prompts without redeploying.

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- Schema design for versioned prompts (prompt_id, version, template, active)
- Simple 50/50 traffic splitting logic
- Logging outcomes per prompt version and comparing them

## Stack for this project

NestJS, PostgreSQL, Prisma, Next.js

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
