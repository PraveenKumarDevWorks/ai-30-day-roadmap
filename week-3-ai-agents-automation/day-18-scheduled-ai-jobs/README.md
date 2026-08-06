# Day 18: Scheduled AI jobs

**Week 3 — AI Agents & Automation** · Category: Backend

## Status

- [ ] Not started

## What to build

Use NestJS cron + a Bull queue + Kafka to run daily AI tasks (e.g. summarize yesterday's orders, flag anomalies). Publish results to a Redis channel.

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- NestJS's @Cron scheduler vs a Bull queue vs Kafka — when each is the right tool
- Bull queue basics: producers, consumers, retries, backoff
- Redis pub/sub channels for broadcasting job results to subscribers

## Stack for this project

NestJS, Redis, Kafka

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
