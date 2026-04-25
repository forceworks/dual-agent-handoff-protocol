Check the `handoffs/` directory for any thread that needs your attention.

Steps:
1. Read all `.json` files in `handoffs/`.
2. Group them by `task_id`.
3. Sort each task's messages by `timestamp` ascending.
4. For each task, inspect the latest message and decide whether Claude owes the next move:
   - `DISCUSSION_OPEN`, `DISCUSSION_REPLY`, or `DISCUSSION_SUMMARY` from `codex` -> you should respond in the discussion
   - `CONSENSUS_REACHED` -> implementation is ready; you should code next
   - `PROPOSAL` or `REVISION` from `codex` -> you owe `APPROVAL` or `CHALLENGE`
   - `REVIEW_REQUEST` from `codex` -> you owe `REVIEW_RESULT`
   - `CHALLENGE` from `codex` -> you owe a revised `IMPLEMENTATION_RESULT`
   - `CLARIFICATION_REQUEST` from `codex` -> you owe `CLARIFICATION_RESPONSE`
   - `NEEDS_HUMAN_DECISION`, `REVIEW_RESULT`, or `CANCELLED` -> wait
   - Anything else -> no action needed from you
5. Print a summary table:
   - Task ID
   - Latest message type and author
   - What you should do next
6. If one or more tasks need action, ask which thread to work on first.
