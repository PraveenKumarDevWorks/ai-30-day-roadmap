# Day 11: Multi-doc RAG

**Week 2 — RAG & Knowledge Features** · Category: Backend

## Status

- [ ] Not started

## What to build

Let users upload multiple documents. Tag each chunk with a doc ID. Filter retrieval by document. Useful for a product like Comixo where each business has its own docs.

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- Multi-tenant document isolation — scoping retrieval to the right business/user
- Adding metadata columns (doc_id, tenant_id) alongside the vector column
- Combining a WHERE filter with a vector similarity ORDER BY in one query

## Stack for this project

NestJS, PostgreSQL, Prisma

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
