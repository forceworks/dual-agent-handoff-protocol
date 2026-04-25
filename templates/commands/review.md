Ask Codex for targeted feedback without starting implementation.

Arguments: $ARGUMENTS (what you want Codex to review)

Steps:
1. Read all filenames in `handoffs/` to find the highest existing task ID. The next task ID is one higher (start at 001 if none exist). Use your project's prefix.
2. Write `handoffs/{task_id}.REVIEW_REQUEST.v1.json`.
3. Confirm the file was written and print the task ID.

Schema:
```json
{
  "protocol_version": 1,
  "task_id": "<task_id>",
  "message_type": "REVIEW_REQUEST",
  "from": "claude",
  "timestamp": "<ISO 8601 now>",
  "summary": "<one-line version of $ARGUMENTS>",
  "context": "<what to look at and why>",
  "artifacts": ["<optional file paths or handoff IDs>"],
  "questions": ["<optional specific questions>"]
}
```

After writing the file, tell the user the task ID and that Codex will respond with `REVIEW_RESULT` when they next check the thread.
