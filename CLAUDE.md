# CLAUDE.md

Context for Claude Code (or any AI assistant) working in this repository. Read this before making changes.

## What this repo is

A 30-day, hands-on roadmap to go from "can call an LLM API" to "can ship real AI features" — one small project per weekday, grouped into 4 weekly themes. See the root `README.md` for the full day-by-day index and progress table.

Every project uses **Ollama** (free, local, no API key) for AI calls instead of a paid hosted API, unless a day's own README says otherwise. Praveen's local setup has `llama3.2` (chat/completion) and `nomic-embed-text` (embeddings) pulled — default to those model names in new code, and check `ollama list` before assuming a different one is available.

## Structure

```
week-1-ai-foundations/           day-01 .. day-07
week-2-rag-knowledge-features/   day-08 .. day-14
week-3-ai-agents-automation/     day-15 .. day-21
week-4-production-ai-scale-quality/  day-22 .. day-30
```

Each `day-NN-<slug>/` folder is a **standalone project** with its own `package.json` — not a shared monorepo workspace. Don't assume dependencies or config from one day are available in another; each one installs and runs independently.

## Before building a new day

1. Read that day's `README.md` first — it already has "What to build," "Deep-dive topics," and "Stack for this project" filled in from the original roadmap plan. Don't restructure or second-guess that plan without asking.
2. Check whether earlier days already solved a piece of what this day needs (e.g. the streaming/NDJSON-parsing pattern from Day 1, the cache-aside pattern from Day 6) and reuse the same approach for consistency, rather than inventing a new style each time.
3. Default to Ollama for any AI call. Only use a paid API if explicitly asked.

## Ports (so multiple days can run side by side)

- Next.js days: default port 3000
- NestJS days: 3001, 3002, 3003, ... — increment per day so an earlier day's server can stay running while a new one is being tested. Check the highest port already used by an earlier NestJS day before picking the next one.

## New infrastructure (Docker, Prisma, Redis, etc.)

The first day that introduces a new piece of infrastructure explains, in its own README, why that tool is needed and how it connects end-to-end (see Day 4 for Docker+Prisma+pgvector, Day 6 for Redis). Later days that reuse the same tool can link back to that explanation instead of repeating it from scratch.

## After building a day: the README template

Every finished day's `README.md` follows the same shape. Look at `week-1-ai-foundations/day-01-llm-api-integration/README.md` for a full example. In order:

1. `## Status` — checkbox + build date
2. `## Run it` — exact copy-pasteable setup/run commands
3. `## Explain it like I'm 10` — the feature explained with a simple, everyday analogy, no jargon
4. `## How it flows (diagram)` — a Mermaid diagram (GitHub renders it natively — no image files)
5. `## Backend flow: how one request actually travels` — a plain, step-by-step trace of the ACTUAL CODE PATH, file by file, in the order it happens, explaining what each step does and *why* — not an analogy, not a diagram, the real chain. Explain basic backend vocabulary inline the first time it comes up (route, controller, decorator, DTO, and so on) — Praveen is still building backend fluency, so don't assume terms are already known.
6. `## If someone wakes you up at midnight and quizzes you` — a practice Q&A list, short clear answers
7. `## What to build` / `## Deep-dive topics` / `## Stack for this project` — carried over from the original starter README, unchanged
8. `## Deep dive: how it actually works (technical)` — detailed walkthrough organized by file, for reference once the flow is already understood
9. `## Using other AI models (just hints — not built here)` — brief hints for adapting the feature to other AI models/providers beyond Ollama (hosted APIs like OpenAI/Claude/Gemini/Groq/Mistral, and other local runners like LM Studio/vLLM/llama.cpp) — genuinely different models, not just other Ollama models

**Language rule, for every section above:** simple, plain English. Short sentences, easy words. No Tanglish. This applies to the technical sections too, not just the ELI10 one — simplify wording without losing technical accuracy.

Once a day is built, also add a ✅ in front of its title in the root `README.md`'s progress table.

## Coding conventions observed across existing days

- TypeScript `strict: true` everywhere.
- Next.js days: App Router, Tailwind for styling, route handlers under `app/api/.../route.ts`, `'use client'` only on components that actually need it.
- NestJS days: standard module/controller/service split, controllers stay thin (just call a service method and return), real logic lives in services. `class-validator` DTOs + a global `ValidationPipe({ whitelist: true, transform: true })` for input validation.
- Ollama calls: streaming (`stream: true`) for anything meant to feel conversational/live; non-streaming (`stream: false`) for anything that's really just "give me one complete answer," like embeddings, JSON extraction, or a step inside a multi-call pipeline (see Day 5's map-reduce, Day 6's `format: 'json'`).
- Never trust raw LLM output blindly — defensive parsing (Day 6), retry logic, or explicit fallback behavior belongs wherever a model's reply gets used programmatically, not just where it's displayed to a person.
- Every project has a `.env.example` (never a committed `.env`), and every network-dependent step (Ollama not running, DB not reachable) fails with a clear, specific error message rather than a silent hang or a generic 500.

## Git / GitHub

Single repo for the whole roadmap: `github.com/PraveenKumarDevWorks/ai-30-day-roadmap`. Commit as each day is finished; Praveen pushes manually from his own machine. Don't create new repos per day or per week.
