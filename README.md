# AI Projects — 30-Day Roadmap

A 30-day, hands-on roadmap. The goal: go from "can call an LLM API" to "can ship real AI features." Every project uses **Ollama** to run AI models on your own computer — free, no API keys — instead of paid APIs like OpenAI or Claude, wherever the original plan asked for a hosted model.

Stack used throughout: Next.js, React, Angular, JS, TS, Tailwind, Redux, React Query, Axios, NestJS, MongoDB, PostgreSQL, Prisma, Redis, Kafka, gRPC, Microservices, and **Ollama** for local AI models and embeddings.

See `CLAUDE.md` (added Day 7) for conventions, structure, and everything a Claude Code session needs to work in this repo without re-deriving context from scratch.

## How this repo is organized

```
week-1-ai-foundations/           AI Foundations — Text & APIs
week-2-rag-knowledge-features/   RAG & Knowledge Features
week-3-ai-agents-automation/     AI Agents & Automation
week-4-production-ai-scale-quality/  Production AI — Scale & Quality
```

Each week folder has 7-9 `day-NN-<title>/` folders. Each day folder starts with a `README.md` that has:

- **What to build** — the feature for that day, in plain words
- **Deep-dive topics** — the ideas to actually understand, not just copy-paste
- **Stack** — which tools from the list above are used

Once a day's project is built, its README gets **5 more sections added**. Every finished day follows this same template (see `week-1-ai-foundations/day-01-llm-api-integration/README.md` as a full example). All writing uses simple, plain English — short sentences, easy words, easy to read:

1. **Explain it like I'm 10** — the same feature explained with a simple, everyday example, no hard words
2. **How it flows (diagram)** — a Mermaid diagram (GitHub shows it directly, no image file needed) showing the steps from request to reply
3. **Backend flow: how one request actually travels** — a plain, step-by-step trace of what happens in the actual code, in order, from the moment a request leaves the browser to the moment the answer comes back — file by file, explaining what each step does and why it exists. Written for someone who only knows backend a little, so basic words (route, controller, request, decorator, and so on) get explained inline the first time they show up. This is different from the ELI10 section (that's an analogy) and different from the diagram (that's the big picture) — this section is the actual code path.
4. **If someone wakes you up at midnight and quizzes you** — a practice Q&A list: the questions someone would likely ask about the project, with short, clear answers, so you can explain it on the spot without opening the code
5. **Using other AI models (hints)** — short hints and examples for using the same feature with other AI models and providers beyond Ollama — hosted APIs (OpenAI, Claude, Gemini, Groq, Mistral) and other local tools (LM Studio, vLLM, llama.cpp) — just enough to point the way, not a full build

The existing **Deep dive: how it actually works** section stays too, organized by file rather than by request flow — good as a reference once you already understand the flow. The 5 sections above are added next to it, not instead of it.

## Setup: Ollama

1. Install Ollama: https://ollama.com/download
2. Pull a general-purpose model for chat/agents — Praveen's setup uses `ollama pull llama3.2`
3. Pull an embedding model for RAG/search days — `ollama pull nomic-embed-text`
4. Ollama runs a local REST API on `http://localhost:11434` — no API key needed
5. Make sure `ollama serve` is actually running before starting any project's dev server, or API calls fail with `ECONNREFUSED`. Check what's pulled with `ollama list`.

## Working through the roadmap

1. Open a day's README, read the deep-dive topics first
2. Build the feature inside that day's folder (add your own `src/`, `package.json`, etc. as needed — these starter folders only contain the README for now)
3. Fill in "Notes / learnings" with what you actually built and learned
4. Commit and push

## Progress

| Day | Week | Title | Category | Path |
|-----|------|-------|----------|------|
| 1 | 1 | ✅ LLM API integration | Frontend | `week-1-ai-foundations/day-01-llm-api-integration` |
| 2 | 1 | ✅ Prompt engineering basics | Frontend | `week-1-ai-foundations/day-02-prompt-engineering-basics` |
| 3 | 1 | ✅ Streaming text responses | Frontend | `week-1-ai-foundations/day-03-streaming-text-responses` |
| 4 | 1 | ✅ AI-powered search | Full Stack | `week-1-ai-foundations/day-04-ai-powered-search` |
| 5 | 1 | ✅ Text summarization feature | Frontend | `week-1-ai-foundations/day-05-text-summarization-feature` |
| 6 | 1 | ✅ Sentiment analysis API | Backend | `week-1-ai-foundations/day-06-sentiment-analysis-api` |
| 7 | 1 | ✅ Revision day | Full Stack | `week-1-ai-foundations/day-07-revision-day` |
| 8 | 2 | Document ingestion pipeline | Backend | `week-2-rag-knowledge-features/day-08-document-ingestion-pipeline` |
| 9 | 2 | Basic RAG chatbot | Full Stack | `week-2-rag-knowledge-features/day-09-basic-rag-chatbot` |
| 10 | 2 | Conversation memory | Full Stack | `week-2-rag-knowledge-features/day-10-conversation-memory` |
| 11 | 2 | Multi-doc RAG | Backend | `week-2-rag-knowledge-features/day-11-multi-doc-rag` |
| 12 | 2 | RAG with reranking | Backend | `week-2-rag-knowledge-features/day-12-rag-with-reranking` |
| 13 | 2 | AI FAQ generator | Full Stack | `week-2-rag-knowledge-features/day-13-ai-faq-generator` |
| 14 | 2 | Revision day | Full Stack | `week-2-rag-knowledge-features/day-14-revision-day` |
| 15 | 3 | Function calling / tool use | Backend | `week-3-ai-agents-automation/day-15-function-calling-tool-use` |
| 16 | 3 | Simple AI agent loop | Backend | `week-3-ai-agents-automation/day-16-simple-ai-agent-loop` |
| 17 | 3 | Email automation agent | Full Stack | `week-3-ai-agents-automation/day-17-email-automation-agent` |
| 18 | 3 | Scheduled AI jobs | Backend | `week-3-ai-agents-automation/day-18-scheduled-ai-jobs` |
| 19 | 3 | AI data extractor | Backend | `week-3-ai-agents-automation/day-19-ai-data-extractor` |
| 20 | 3 | Code review agent | Full Stack | `week-3-ai-agents-automation/day-20-code-review-agent` |
| 21 | 3 | Revision day | Full Stack | `week-3-ai-agents-automation/day-21-revision-day` |
| 22 | 4 | LLM output validation | Backend | `week-4-production-ai-scale-quality/day-22-llm-output-validation` |
| 23 | 4 | AI rate limiting & cost control | Backend | `week-4-production-ai-scale-quality/day-23-ai-rate-limiting-cost-control` |
| 24 | 4 | Prompt version management | Full Stack | `week-4-production-ai-scale-quality/day-24-prompt-version-management` |
| 25 | 4 | AI response caching | Backend | `week-4-production-ai-scale-quality/day-25-ai-response-caching` |
| 26 | 4 | Observability for AI | Infra | `week-4-production-ai-scale-quality/day-26-observability-for-ai` |
| 27 | 4 | AI feature flags | Full Stack | `week-4-production-ai-scale-quality/day-27-ai-feature-flags` |
| 28 | 4 | Fine-tuning intro | Backend | `week-4-production-ai-scale-quality/day-28-fine-tuning-intro` |
| 29 | 4 | Final project day | Full Stack | `week-4-production-ai-scale-quality/day-29-final-project-day` |
| 30 | 4 | Portfolio & blog post | Full Stack | `week-4-production-ai-scale-quality/day-30-portfolio-blog-post` |

## GitHub

Repo: https://github.com/PraveenKumarDevWorks

Each day's folder should end up with real, working code plus a filled-out README before it's pushed. The root README (this file) is the entry point — keep the progress table above up to date as you complete days.
