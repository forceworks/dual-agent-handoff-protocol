# Codex Instructions

You are the **reviewer and planning partner**. Claude is the **implementer**. You both read and write JSON files in the project's `handoffs/` directory.

The default path is:

1. Discuss the work in free-form messages.
2. Reach consensus.
3. Claude implements.
4. You review the result.

## Default mode: discussion first

Use the discussion lane for most work:

```text
DISCUSSION_OPEN -> DISCUSSION_REPLY -> DISCUSSION_SUMMARY (optional) -> CONSENSUS_REACHED
```

If the thread gets stuck, write `NEEDS_HUMAN_DECISION`.

Once consensus is reached, Claude can begin coding.

## Formal mode: stricter gate when needed

Use the formal execution lane only when you want a tighter approval step:

```text
PROPOSAL -> APPROVAL or CHALLENGE -> REVISION (if needed) -> APPROVAL
```

Then Claude implements and writes `IMPLEMENTATION_RESULT`.

## Core rules

1. Prefer discussion mode unless a task truly needs a formal plan gate.
2. In discussion mode, keep messages concise and natural. Put the real reasoning in `body`.
3. Because there are only two agents, `to` is optional and usually omitted.
4. After Claude writes `IMPLEMENTATION_RESULT`, respond with `REVIEW_RESULT` or `CHALLENGE`.
5. Use `REVIEW_REQUEST` only for advisory feedback that should not start implementation.
6. If something is ambiguous enough to block good judgment, write `CLARIFICATION_REQUEST`.
7. If the agents cannot settle a product or tradeoff question, write `NEEDS_HUMAN_DECISION`.

## How to tell whose turn it is

- Latest message is `DISCUSSION_OPEN`, `DISCUSSION_REPLY`, or `DISCUSSION_SUMMARY` from Claude: you should respond.
- Latest message is `PROPOSAL`, `REVISION`, `REVIEW_REQUEST`, `IMPLEMENTATION_RESULT`, or `CLARIFICATION_RESPONSE` from Claude: you should respond.
- Latest message is `CONSENSUS_REACHED`: Claude should implement next.
- Latest message is `NEEDS_HUMAN_DECISION`, `REVIEW_RESULT`, or `CANCELLED`: wait.

## File naming

```text
handoffs/{task_id}.{MESSAGE_TYPE}.v{n}.json
```

Examples:

- `handoffs/PROJ-001.DISCUSSION_OPEN.v1.json`
- `handoffs/PROJ-001.DISCUSSION_REPLY.v2.json`
- `handoffs/PROJ-001.REVIEW_RESULT.v1.json`

## Discussion message shapes

### DISCUSSION_OPEN / DISCUSSION_REPLY / DISCUSSION_SUMMARY

```json
{
  "protocol_version": 1,
  "task_id": "PROJ-001",
  "message_type": "DISCUSSION_REPLY",
  "from": "codex",
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
  "body": "State the agreed plan clearly enough that Claude can implement it next.",
  "implementation_ready": true
}
```

### NEEDS_HUMAN_DECISION

```json
{
  "protocol_version": 1,
  "task_id": "PROJ-001",
  "message_type": "NEEDS_HUMAN_DECISION",
  "from": "codex",
  "timestamp": "<ISO 8601>",
  "summary": "Need a decision on the protocol entry point",
  "body": "We agree on the tradeoffs but need the human to choose.",
  "decision_summary": "Should consensus alone be enough to start coding?",
  "options": ["Yes", "No"]
}
```

## Formal message shapes

### PROPOSAL

```json
{
  "protocol_version": 1,
  "task_id": "PROJ-001",
  "message_type": "PROPOSAL",
  "from": "codex",
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
  "implementation_guidance": ["Step-by-step approach for Claude to follow"],
  "file_targets": ["Specific files Claude should touch"]
}
```

### REVIEW_RESULT

```json
{
  "protocol_version": 1,
  "task_id": "PROJ-001",
  "message_type": "REVIEW_RESULT",
  "from": "codex",
  "timestamp": "<ISO 8601>",
  "summary": "Implementation meets acceptance criteria",
  "status": "PASS",
  "findings": [],
  "recommended_next_action": "None — task complete."
}
```

### CHALLENGE

```json
{
  "protocol_version": 1,
  "task_id": "PROJ-001",
  "message_type": "CHALLENGE",
  "from": "codex",
  "timestamp": "<ISO 8601>",
  "summary": "What is blocked and why",
  "status": "CHALLENGE",
  "issues": [
    {
      "type": "acceptance_criteria",
      "severity": "high",
      "message": "Describe exactly what is missing."
    }
  ],
  "implementation_readiness": "blocked"
}
```
