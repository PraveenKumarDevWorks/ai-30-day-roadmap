# Day 8: Document ingestion pipeline

**Week 2 — RAG & Knowledge Features** · Category: Backend

## Status

- [ ] Not started

## What to build

Accept PDF/text upload in NestJS. Chunk the text. Generate embeddings via a local Ollama embedding model. Store in PostgreSQL (pgvector). This is step 1 of RAG.

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- Chunking strategies: fixed-size vs sentence/paragraph-aware vs semantic chunking
- Why chunk overlap matters and how much to use
- Extracting text from PDFs (pdf-parse or similar) before chunking
- Batch-generating embeddings efficiently without overwhelming the local Ollama server

## Stack for this project

NestJS, PostgreSQL, Prisma, pgvector, Ollama

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
