# Day 12: RAG with reranking

**Week 2 — RAG & Knowledge Features** · Category: Backend

## Status

- [ ] Not started

## What to build

After fetching top-k chunks, rerank them using a cross-encoder model before sending to the LLM. Improves answer quality significantly. Use a local reranker to stay free (e.g. bge-reranker via a small Python sidecar, or Ollama if a supported model is available).

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- Why a first-pass vector search (bi-encoder) is fast but imprecise, and reranking (cross-encoder) fixes that
- Bi-encoder vs cross-encoder — what's different about how they score relevance
- Running a small local reranker model alongside your NestJS service

## Stack for this project

NestJS, Ollama

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
