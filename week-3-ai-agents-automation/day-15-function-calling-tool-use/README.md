# Day 15: Function calling / tool use

**Week 3 — AI Agents & Automation** · Category: Backend

## Status

- [ ] Not started

## What to build

Give the local LLM tools: get_order_status, get_menu, check_inventory. The model decides which tool to call. NestJS handles the execution. Very powerful for Cookr/Comixo use cases.

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- How function/tool calling works: JSON-schema tool definitions passed alongside the prompt
- Which Ollama models support native tool calling (e.g. llama3.1, qwen2.5) vs which need a prompted workaround
- Building a tool registry pattern in NestJS so new tools are easy to add

## Stack for this project

NestJS, Ollama

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
