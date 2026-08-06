# Day 6: Sentiment analysis API

**Week 1 — AI Foundations — Text & APIs** · Category: Backend

## Status

- [ ] Not started

## What to build

NestJS endpoint that takes text, calls the local LLM with a structured prompt, returns a sentiment score + label as JSON. Add Redis cache so repeated text doesn't re-call the model.

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- Prompting a local model to return strict, parseable JSON
- Defensive JSON parsing when the model adds extra text around the JSON
- Redis caching strategy: hash the input text as the cache key, set a TTL

## Stack for this project

NestJS, Redis, Ollama

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
