# Day 1: LLM API integration

**Week 1 — AI Foundations — Text & APIs** · Category: Frontend

## Status

- [ ] Not started

## What to build

Call a local Ollama model from a Next.js API route. Stream the response to the frontend using ReadableStream. Build a simple chat UI with Tailwind.

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- How Ollama serves models locally as a REST API (default: http://localhost:11434)
- Difference between Ollama's /api/generate and /api/chat endpoints
- Streaming NDJSON responses from Ollama and forwarding them with ReadableStream in a Next.js route handler
- Building a minimal chat UI with Tailwind that renders streamed tokens as they arrive

## Stack for this project

Next.js, TypeScript, Tailwind, Ollama

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
