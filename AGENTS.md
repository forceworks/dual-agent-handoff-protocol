# Codex Repo Instructions

This repository builds a public tool for dual-agent coordination. The strict handoff-only rules are part of the **product templates** in [`templates/AGENTS.md`](F:\projects\dual-agent-handoff-protocol\templates\AGENTS.md) and [`templates/CLAUDE.md`](F:\projects\dual-agent-handoff-protocol\templates\CLAUDE.md). They are **not** the workflow for developing this repository itself.

## Your role in this repo

You may inspect, edit, create, and delete files in this repository as needed to build the product.

When making changes here:

1. Treat the repo as a normal software project. You can modify source files, schemas, docs, templates, and tests.
2. Keep the product-facing agent behavior in `templates/`. If you change protocol semantics, update the templates and the implementation together.
3. Prefer changes that make the public starter experience faster, clearer, and more reliable.
4. Keep the root instructions lightweight. Do not reintroduce end-user product constraints here if they would block repo development.
5. Use `handoffs/` only as example artifacts or for testing the protocol, not as the only allowed output channel.

## Priority when making product decisions

Optimize for:

- setup in minutes
- one clear happy path
- durable local-first coordination
- minimal manual copy/paste between agents
- docs and examples that match the implementation

## Consistency checklist

When protocol behavior changes, review these areas together:

- `src/`
- `schemas/`
- `README.md`
- `templates/AGENTS.md`
- `templates/CLAUDE.md`
- `templates/commands/`

The root `AGENTS.md` should remain a contributor/developer instruction file for building this repo, not a copy of the generated product instructions.
