import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  isImplementationBlocked,
  isImplementationReady,
  latestMessageForTask,
  nextMessageVersion,
  nextResponderForTask,
  writeMessage
} from "./store.js";
import type {
  ConsensusReachedMessage,
  DiscussionOpenMessage,
  NeedsHumanDecisionMessage
} from "./types.js";

async function withRepo(testBody: (repoRoot: string) => Promise<void>): Promise<void> {
  const repoRoot = await mkdtemp(join(tmpdir(), "dual-agent-handoffs-"));
  try {
    await testBody(repoRoot);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
}

export async function runStoreTests(): Promise<void> {
  await withRepo(async (repoRoot) => {
    const first: DiscussionOpenMessage = {
      protocol_version: 1,
      task_id: "TASK-200",
      message_type: "DISCUSSION_OPEN",
      from: "claude",
      timestamp: "2026-04-25T12:00:00.000Z",
      summary: "Start discussion",
      body: "First pass"
    };

    const second: DiscussionOpenMessage = {
      ...first,
      timestamp: "2026-04-25T12:00:01.000Z",
      summary: "Restart discussion",
      body: "Second pass"
    };

    const firstPath = await writeMessage(repoRoot, first);
    const secondPath = await writeMessage(repoRoot, second);

    assert.match(firstPath, /DISCUSSION_OPEN\.v1\.json$/);
    assert.match(secondPath, /DISCUSSION_OPEN\.v2\.json$/);
    assert.equal(await nextMessageVersion(repoRoot, "TASK-200", "DISCUSSION_OPEN"), 3);
  });

  await withRepo(async (repoRoot) => {
    await writeMessage(repoRoot, {
      protocol_version: 1,
      task_id: "TASK-201",
      message_type: "DISCUSSION_OPEN",
      from: "claude",
      timestamp: "2026-04-25T12:00:00.000Z",
      summary: "Start",
      body: "Should we change the flow?"
    });

    await writeMessage(repoRoot, {
      protocol_version: 1,
      task_id: "TASK-201",
      message_type: "DISCUSSION_REPLY",
      from: "codex",
      timestamp: "2026-04-25T12:00:01.000Z",
      summary: "Reply",
      body: "Yes, but keep it simple."
    });

    await writeMessage(repoRoot, {
      protocol_version: 1,
      task_id: "TASK-201",
      message_type: "DISCUSSION_SUMMARY",
      from: "claude",
      timestamp: "2026-04-25T12:00:02.000Z",
      summary: "Summary",
      body: "We agree on a minimal discussion lane."
    });

    const latestMessage = await latestMessageForTask(repoRoot, "TASK-201");
    assert.equal(latestMessage?.message_type, "DISCUSSION_SUMMARY");
    assert.equal(await nextResponderForTask(repoRoot, "TASK-201"), "codex");
  });

  await withRepo(async (repoRoot) => {
    const consensus: ConsensusReachedMessage = {
      protocol_version: 1,
      task_id: "TASK-202",
      message_type: "CONSENSUS_REACHED",
      from: "codex",
      timestamp: "2026-04-25T12:00:03.000Z",
      summary: "Ready to implement",
      body: "Claude should code next.",
      implementation_ready: true
    };

    await writeMessage(repoRoot, consensus);
    assert.equal(await isImplementationReady(repoRoot, "TASK-202"), true);
    assert.equal(await isImplementationBlocked(repoRoot, "TASK-202"), false);

    const blocked: NeedsHumanDecisionMessage = {
      protocol_version: 1,
      task_id: "TASK-203",
      message_type: "NEEDS_HUMAN_DECISION",
      from: "codex",
      timestamp: "2026-04-25T12:00:04.000Z",
      summary: "Need a product decision",
      body: "We can either keep APPROVAL optional or mandatory after consensus.",
      decision_summary: "Choose whether consensus alone is enough to start coding.",
      options: ["Consensus is enough", "Consensus must be followed by PROPOSAL"]
    };

    await writeMessage(repoRoot, blocked);
    assert.equal(await isImplementationReady(repoRoot, "TASK-203"), false);
    assert.equal(await isImplementationBlocked(repoRoot, "TASK-203"), true);
    assert.equal(await nextResponderForTask(repoRoot, "TASK-203"), null);
  });
}
