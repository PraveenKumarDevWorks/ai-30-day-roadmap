# Day 9: Basic RAG chatbot

**Week 2 — RAG & Knowledge Features** · Category: Full Stack

## Status

- [ ] Not started

## What to build

Retrieve top-k relevant chunks from pgvector. Feed them as context to the local LLM. Build a Q&A chat UI. The LLM answers only from your documents.

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- The full RAG loop: embed query → retrieve top-k → stuff into prompt → generate
- Context window budgeting — how many chunks you can afford to include
- Prompting the model to refuse answering when retrieved context doesn't cover the question

## Stack for this project

Next.js, NestJS, pgvector, Ollama

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
