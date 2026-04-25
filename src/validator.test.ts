import assert from "node:assert/strict";

import { validateMessage } from "./validator.js";
import type { ConsensusReachedMessage, DiscussionOpenMessage } from "./types.js";

export async function runValidatorTests(): Promise<void> {
  const message: DiscussionOpenMessage = {
    protocol_version: 1,
    task_id: "TASK-100",
    message_type: "DISCUSSION_OPEN",
    from: "claude",
    timestamp: "2026-04-25T12:00:00.000Z",
    summary: "Start a conversation",
    body: "Should we keep the protocol linear for two agents?"
  };

  assert.deepEqual(validateMessage(message), { valid: true, errors: [] });

  const messageWithUnexpectedField = {
    protocol_version: 1,
    task_id: "TASK-101",
    message_type: "DISCUSSION_REPLY",
    from: "codex",
    timestamp: "2026-04-25T12:00:01.000Z",
    summary: "Reply",
    body: "Yes, linear threads are enough.",
    unexpected: true
  };

  const unexpectedFieldResult = validateMessage(messageWithUnexpectedField as never);
  assert.equal(unexpectedFieldResult.valid, false);
  assert.match(unexpectedFieldResult.errors.join(" "), /unevaluated/i);

  const validConsensusMessage: ConsensusReachedMessage = {
    protocol_version: 1,
    task_id: "TASK-102",
    message_type: "CONSENSUS_REACHED",
    from: "codex",
    timestamp: "2026-04-25T12:00:02.000Z",
    summary: "Agreed approach",
    body: "Claude should implement the discussion outcome next.",
    implementation_ready: true
  };

  assert.deepEqual(validateMessage(validConsensusMessage), { valid: true, errors: [] });
  assert.equal(
    validateMessage({ ...validConsensusMessage, implementation_ready: false } as never).valid,
    false
  );
}
