# Day 10: Conversation memory

**Week 2 — RAG & Knowledge Features** · Category: Full Stack

## Status

- [ ] Not started

## What to build

Store chat history in Redis with TTL. Inject the last N messages as context on each API call. Simulate short-term memory for your chatbot.

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- Short-term (session) memory vs long-term (persisted) memory in chat apps
- Storing message lists in Redis and setting a rolling TTL
- Trimming history to fit the context window as conversations grow

## Stack for this project

NestJS, Redis

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
