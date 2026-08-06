# Day 4: AI-powered search

**Week 1 — AI Foundations — Text & APIs** · Category: Full Stack

## Status

- [ ] Not started

## What to build

Build semantic search using embeddings from a local Ollama embedding model (e.g. nomic-embed-text). Store vectors in PostgreSQL with pgvector. Query by similarity. This is the foundation of most AI search products.

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- What an embedding actually is (a vector that encodes meaning) and why similar meaning = similar vector
- Cosine similarity vs Euclidean distance for vector search
- Setting up the pgvector extension in PostgreSQL and defining a vector column
- ivfflat vs hnsw indexes — trade-offs for small vs large datasets
- Running vector queries through Prisma (raw SQL, since Prisma has no native vector type yet)

## Stack for this project

NestJS, PostgreSQL, Prisma, pgvector, Ollama

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
