# Day 20: Code review agent

**Week 3 — AI Agents & Automation** · Category: Full Stack

## Status

- [ ] Not started

## What to build

Agent reads a GitHub PR diff, gives feedback on code quality, security issues, and naming. Call the GitHub API for the diff. Use the local LLM to review. Return structured comments.

## Deep-dive topics

Research and understand these before or while building — this is the "why" behind the feature, not just the "how":

- Fetching a PR diff via the GitHub REST API
- Prompting for structured review comments (file, line, severity, message)
- Where this could eventually post comments back to GitHub via the API

## Stack for this project

NestJS, Next.js, GitHub API

## Notes / learnings

_(Fill this in as you build. This is the part that goes into the final README when you push to GitHub — what you built, what you learned, what tripped you up.)_
