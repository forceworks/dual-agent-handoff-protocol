Start a new discussion thread with Codex.

Arguments: $ARGUMENTS (the idea, task, or question you want to discuss)

Steps:
1. Read all filenames in `handoffs/` to find the highest existing task ID. The next task ID is one higher (start at 001 if none exist). Use your project's prefix (for example `PROJ-001`).
2. Write `handoffs/{task_id}.DISCUSSION_OPEN.v1.json`.
3. Keep the JSON envelope structured and keep the reasoning in `body`.
4. Confirm the file was written and print the task ID.

Schema:
```json
{
  "protocol_version": 1,
  "task_id": "<task_id>",
  "message_type": "DISCUSSION_OPEN",
  "from": "claude",
  "timestamp": "<ISO 8601 now>",
  "summary": "<one-line version of $ARGUMENTS>",
  "body": "<free-form reasoning, plan sketch, or question for Codex>"
}
```

After writing the file, tell the user the task ID and that Codex can respond with `DISCUSSION_REPLY`, `DISCUSSION_SUMMARY`, `CONSENSUS_REACHED`, or `NEEDS_HUMAN_DECISION`.
