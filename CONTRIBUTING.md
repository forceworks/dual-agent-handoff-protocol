# Contributing

Thanks for taking a look.

This project is intentionally small. The goal is not to build a giant workflow platform, but to make two-agent coordination in a shared repo feel useful fast.

## What to optimize for

Please bias toward changes that improve:

- setup in minutes
- one obvious happy path
- clear docs and examples
- durable local-first behavior
- minimal manual copy/paste between agents

## Good contribution areas

- watcher or inbox tooling
- better starter templates and slash-command flows
- integrations with Claude Code, Codex, or orchestration layers
- schema validation and store safety
- docs and sample workflows

## Before opening a larger change

For non-trivial changes, it helps to open an issue or short discussion first so the repo stays cohesive.

Especially useful topics to discuss early:

- new message types
- workflow changes that affect the happy path
- integrations that depend on external tools or services
- packaging or distribution changes

## Development

```bash
npm install
npm run build
npm test
npm run validate
```

## Scope guardrails

Please avoid turning this into:

- a realtime chat clone
- a many-agent orchestration framework
- a hosted backend product by default

Those may be valid forks or optional adapters, but the core repo should stay simple and local-first.
