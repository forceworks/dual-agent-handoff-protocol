# Dual-Agent Handoff Protocol

A local-first coordination kit for two coding agents sharing the same project folder.

This repo is for people who already have two agent tools pointed at the same codebase and want something better than manual copy/paste between chats.

It does **not** create a shared live chat session between tools. Instead, it gives the agents a durable shared message bus inside the repo: a `handoffs/` folder with structured JSON messages for discussion, consensus, implementation, and review.

## Status

This project is an early open-source v1.

It is useful today if you want:

- discussion-first coordination between two agents
- a durable local history of decisions
- a clean starting point you can copy into another repo
- an extension point for future watchers, bridges, or orchestrators

It does **not** yet solve:

- direct injection into Claude Code's current chat session
- direct injection into Codex's current thread
- realtime orchestration across closed chat products

If you want those, this repo is meant to be a solid base for adapters and forks.

## Why this exists

Most dual-agent workflows still rely on a human copying and pasting between chats. That works, but it is fragile, lossy, and hard to scale.

This repo gives you a better default:

- a **discussion lane** for free-form back-and-forth
- an **execution lane** for implementation and review
- file history that stays in your repo
- starter instructions and command templates you can drop into another project in minutes

## Recommended workflow

Use **discussion mode first**.

1. Claude or Codex opens a thread with `DISCUSSION_OPEN`.
2. The other agent replies with `DISCUSSION_REPLY`.
3. Either side can post `DISCUSSION_SUMMARY` to compress the thread.
4. Once they agree, one of them writes `CONSENSUS_REACHED`.
5. Claude implements.
6. Claude writes `IMPLEMENTATION_RESULT`.
7. Codex reviews with `REVIEW_RESULT` or `CHALLENGE`.

If the agents get stuck, they write `NEEDS_HUMAN_DECISION`.

If you want a stricter gate for a particular task, you can still use the formal `PROPOSAL -> APPROVAL/CHALLENGE -> IMPLEMENTATION_RESULT` path.

## Message types

### Discussion lane

| Type | Purpose |
|---|---|
| `DISCUSSION_OPEN` | Start a free-form task thread |
| `DISCUSSION_REPLY` | Continue the conversation |
| `DISCUSSION_SUMMARY` | Compress the current state of the discussion |
| `CONSENSUS_REACHED` | Mark the thread ready for implementation |
| `NEEDS_HUMAN_DECISION` | Escalate when the agents cannot resolve a decision |

### Execution lane

| Type | Purpose |
|---|---|
| `PROPOSAL` | Formal implementation plan when you want a stricter gate |
| `REVISION` | Update a challenged proposal |
| `APPROVAL` | Clear formal implementation to begin |
| `CHALLENGE` | Block a proposal or implementation result |
| `IMPLEMENTATION_RESULT` | Report what Claude changed |
| `REVIEW_REQUEST` | Ask for feedback or advice without opening a gate |
| `REVIEW_RESULT` | Respond to a review request or implementation |
| `CLARIFICATION_REQUEST` | Ask a blocking question |
| `CLARIFICATION_RESPONSE` | Answer a clarification request |
| `CANCELLED` | Close a task without finishing it |

## Design choices

- **Shared folder, not shared chat**: the repo is the message bus.
- **Mostly free-form reasoning**: discussion messages have a simple JSON envelope with a natural-language `body`.
- **Two-agent optimized**: because the system assumes only Claude and Codex, `to` is optional and usually omitted.
- **Inspectable by default**: every turn is a file on disk.
- **Easy to copy**: the starter templates live in `templates/`.

## Repository layout

```text
schemas/          JSON Schema definitions for every message type
src/
  types.ts        TypeScript interfaces
  validator.ts    AJV-based schema validation
  store.ts        File-based persistence and task helpers
  example.ts      Runnable end-to-end example
templates/        Copy these into your own repo
  AGENTS.md       Codex instructions
  CLAUDE.md       Claude instructions
  commands/
    handoff.md        Start a discussion thread
    review.md         Ask for targeted feedback
    handoff-check.md  See what needs attention
```

## Quick start

### 1. Install and verify

```bash
npm install
npm run build
npm test
npm run validate
```

`npm run validate` writes a sample discussion and implementation flow into `./handoffs/`.

### 2. Copy the starter files into your project

```bash
cp templates/AGENTS.md your-project/AGENTS.md
cp templates/CLAUDE.md your-project/CLAUDE.md
mkdir -p your-project/.claude/commands
cp templates/commands/* your-project/.claude/commands/
```

### 3. Put both agents in the same project folder

Your target project should look like this:

```text
your-project/
  handoffs/
  AGENTS.md
  CLAUDE.md
  .claude/commands/
```

### 4. Start a discussion

Recommended first move in Claude Code:

```text
/handoff Add a lightweight discussion loop before the formal coding flow
```

That should create a `DISCUSSION_OPEN` file in `handoffs/`.

## File naming

```text
handoffs/{task_id}.{MESSAGE_TYPE}.v{n}.json
```

Examples:

- `handoffs/PROJ-001.DISCUSSION_OPEN.v1.json`
- `handoffs/PROJ-001.DISCUSSION_REPLY.v2.json`
- `handoffs/PROJ-001.CONSENSUS_REACHED.v1.json`
- `handoffs/PROJ-001.IMPLEMENTATION_RESULT.v1.json`

Versions increment per `task_id` and `message_type`.

## Example message

```json
{
  "protocol_version": 1,
  "task_id": "PROJ-001",
  "message_type": "DISCUSSION_REPLY",
  "from": "codex",
  "timestamp": "2026-04-25T15:00:00-03:00",
  "summary": "Keep the protocol discussion-first",
  "body": "I think we should recommend DISCUSSION_OPEN -> DISCUSSION_REPLY -> CONSENSUS_REACHED as the default path for new users."
}
```

## TypeScript usage

```ts
import { writeMessage } from "./src/store.js";

await writeMessage("./", {
  protocol_version: 1,
  task_id: "PROJ-001",
  message_type: "DISCUSSION_OPEN",
  from: "claude",
  timestamp: new Date().toISOString(),
  summary: "Should we simplify onboarding?",
  body: "I want to reduce setup to a single copy-paste path."
});
```

## Limitations

This repo currently assumes:

- exactly two agents
- a shared local filesystem
- agents that can read repo files but cannot necessarily message each other directly

It intentionally does **not** attempt to fake realtime chat synchronization between closed tools.

## Roadmap

Good next steps for this project:

- a local watcher that surfaces new handoff messages instantly
- a simple inbox view for active threads and whose turn it is
- adapters for tools that can pull handoffs into their current session
- better starter flows for public repo onboarding
- optional bridges to orchestrators like OpenClaw

## Contributing

Contributions are very welcome, especially in these areas:

- developer experience and setup speed
- watcher or inbox tooling
- adapters for Claude Code, Codex, or other agent runtimes
- schema and workflow design improvements
- docs, examples, and starter templates

See [CONTRIBUTING.md](./CONTRIBUTING.md) for a lightweight guide.

## License

[MIT](./LICENSE)

## What this is not

- not a realtime chat bridge
- not a hosted service
- not a general workflow engine
- not a replacement for human judgment when product direction is unclear

It is a durable local protocol that gets surprisingly close to agent-to-agent collaboration with almost no infrastructure.
