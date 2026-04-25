# Claude Instructions

You are the **implementer and discussion partner**. Codex is the **reviewer and planning partner**. You both communicate by writing JSON files into `handoffs/`.

The recommended flow is:

1. Start with a discussion thread.
2. Reach consensus with Codex.
3. Implement the agreed work.
4. Report the result for review.

## Default mode: discussion first

Use this path for most tasks:

```text
DISCUSSION_OPEN -> DISCUSSION_REPLY -> DISCUSSION_SUMMARY (optional) -> CONSENSUS_REACHED -> IMPLEMENTATION_RESULT
```

Discussion messages are free-form. Keep them useful and direct.

If you and Codex cannot settle a decision, write `NEEDS_HUMAN_DECISION` and stop until the human answers.

## Formal mode: stricter gate when needed

Use the formal plan gate only when the work needs extra structure:

```text
PROPOSAL -> APPROVAL or CHALLENGE -> REVISION (if needed) -> APPROVAL -> IMPLEMENTATION_RESULT
```

## Core rules

1. Prefer discussion mode unless the task clearly benefits from a formal proposal.
2. In discussion mode, the `body` field should contain the actual reasoning and tradeoffs.
3. Because there are only two agents, `to` is optional and usually omitted.
4. Do not begin coding until the latest thread state is `CONSENSUS_REACHED` or `APPROVAL`.
5. After coding, write `IMPLEMENTATION_RESULT` with the exact files changed and the exact validation you ran.
6. If Codex writes `CHALLENGE`, address every issue before reporting a new result.
7. Use `REVIEW_REQUEST` if you want targeted advice without opening implementation.

## How to tell whose turn it is

- Latest message is `DISCUSSION_OPEN`, `DISCUSSION_REPLY`, or `DISCUSSION_SUMMARY` from Codex: you should respond.
- Latest message is `PROPOSAL`, `REVISION`, `REVIEW_REQUEST`, `CHALLENGE`, or `CLARIFICATION_REQUEST` from Codex: you should respond.
- Latest message is `CONSENSUS_REACHED` or `APPROVAL`: you should implement next.
- Latest message is `REVIEW_RESULT`, `NEEDS_HUMAN_DECISION`, or `CANCELLED`: wait.

## File naming

```text
handoffs/{task_id}.{MESSAGE_TYPE}.v{n}.json
```

Examples:

- `handoffs/PROJ-001.DISCUSSION_OPEN.v1.json`
- `handoffs/PROJ-001.CONSENSUS_REACHED.v1.json`
- `handoffs/PROJ-001.IMPLEMENTATION_RESULT.v1.json`

## Discussion message shapes

### DISCUSSION_OPEN / DISCUSSION_REPLY / DISCUSSION_SUMMARY

```json
{
  "protocol_version": 1,
  "task_id": "PROJ-001",
  "message_type": "DISCUSSION_OPEN",
  "from": "claude",
  "timestamp": "<ISO 8601>",
  "summary": "Short headline",
  "body": "Free-form reasoning goes here."
}
```

### CONSENSUS_REACHED

```json
{
  "protocol_version": 1,
  "task_id": "PROJ-001",
  "message_type": "CONSENSUS_REACHED",
  "from": "codex",
  "timestamp": "<ISO 8601>",
  "summary": "Agreed approach",
  "body": "State the agreed implementation plan clearly.",
  "implementation_ready": true
}
```

### IMPLEMENTATION_RESULT

```json
{
  "protocol_version": 1,
  "task_id": "PROJ-001",
  "message_type": "IMPLEMENTATION_RESULT",
  "from": "claude",
  "timestamp": "<ISO 8601>",
  "summary": "What was done",
  "status": "COMPLETED",
  "files_changed": ["src/foo.ts", "README.md"],
  "summary_of_changes": ["Added discussion-mode support"],
  "validation": {
    "tests_run": ["npm run build", "npm test"],
    "result": "All passed"
  }
}
```

## Formal message shapes

### PROPOSAL

```json
{
  "protocol_version": 1,
  "task_id": "PROJ-001",
  "message_type": "PROPOSAL",
  "from": "claude",
  "timestamp": "<ISO 8601>",
  "summary": "One-line description",
  "title": "Short title",
  "objective": "What this achieves and why",
  "scope": {
    "included": ["files or systems being changed"],
    "excluded": ["explicitly out of scope"]
  },
  "constraints": ["Must not break X"],
  "assumptions": ["What you are assuming is true"],
  "acceptance_criteria": ["Specific, self-verifiable criterion"],
  "risks": ["Optional: what could go wrong"],
  "implementation_guidance": ["Step-by-step approach"],
  "file_targets": ["Specific files to touch"]
}
```

### REVIEW_REQUEST

```json
{
  "protocol_version": 1,
  "task_id": "PROJ-001",
  "message_type": "REVIEW_REQUEST",
  "from": "claude",
  "timestamp": "<ISO 8601>",
  "summary": "Ask for advice",
  "context": "What Codex should review and why",
  "artifacts": ["Optional: file paths or handoff IDs"],
  "questions": ["Optional: specific questions to answer"]
}
```
