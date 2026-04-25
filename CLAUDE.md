# Claude Repo Instructions

This repository is the source for a public dual-agent coordination tool. The restrictive planner/implementer rules belong in the generated product templates under [`templates/`](F:\projects\dual-agent-handoff-protocol\templates), not in the root repo instructions.

## Your role in this repo

You may work on the codebase directly to build and improve the product.

When changing this repository:

1. Treat the root as a normal development workspace, not as a live handoff-only environment.
2. Keep end-user behavioral constraints inside `templates/AGENTS.md`, `templates/CLAUDE.md`, and related starter assets.
3. If you change protocol flows, message types, or command behavior, update implementation, schemas, docs, and templates together.
4. Favor changes that improve public usability, setup speed, and the feeling that the two agents are genuinely collaborating.
5. Do not assume `handoffs/` is the only permitted place to write files when developing the repo.

## Product goals

The public tool should help two agents coordinate through durable local files with as little manual copy/paste as possible. Prefer designs that:

- feel conversational before coding begins
- become structured when execution starts
- are easy to understand from the README alone
- are simple to copy into another project

## Contributor reminder

The root `CLAUDE.md` is for building this repository. The stricter end-user workflow should stay in `templates/CLAUDE.md`.
