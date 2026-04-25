import {
  isImplementationBlocked,
  isImplementationReady,
  latestMessageForTask,
  nextResponderForTask,
  writeMessage
} from "./store.js";
import type {
  ConsensusReachedMessage,
  DiscussionOpenMessage,
  DiscussionReplyMessage,
  ImplementationResultMessage,
  ReviewResultMessage
} from "./types.js";

const repoRoot = process.cwd();

const start = Date.now();
const at = (offsetMs: number) => new Date(start + offsetMs).toISOString();

const discussionOpen: DiscussionOpenMessage = {
  protocol_version: 1,
  task_id: "TASK-001",
  message_type: "DISCUSSION_OPEN",
  from: "claude",
  timestamp: at(0),
  summary: "Should we add a discussion-first workflow?",
  body: "I want the repo to feel more collaborative before coding begins. Should discussion messages be the default starting point?"
};

const discussionReply: DiscussionReplyMessage = {
  protocol_version: 1,
  task_id: "TASK-001",
  message_type: "DISCUSSION_REPLY",
  from: "codex",
  timestamp: at(1_000),
  summary: "Yes, but keep the envelope tiny",
  body: "I agree with adding a conversational lane as long as it stays file-based and uses just a few message types."
};

const consensus: ConsensusReachedMessage = {
  protocol_version: 1,
  task_id: "TASK-001",
  message_type: "CONSENSUS_REACHED",
  from: "codex",
  timestamp: at(2_000),
  summary: "Discussion mode is the recommended entry point",
  body: "We will recommend DISCUSSION_OPEN -> DISCUSSION_REPLY -> CONSENSUS_REACHED, then Claude codes and reports back with IMPLEMENTATION_RESULT.",
  implementation_ready: true
};

const implementationResult: ImplementationResultMessage = {
  protocol_version: 1,
  task_id: "TASK-001",
  message_type: "IMPLEMENTATION_RESULT",
  from: "claude",
  timestamp: at(3_000),
  summary: "Added discussion-mode message types and docs",
  status: "COMPLETED",
  files_changed: ["src/types.ts", "schemas/discussion-open.schema.json", "README.md"],
  summary_of_changes: ["Added free-form discussion messages before formal execution handoffs"],
  validation: {
    tests_run: ["npm run build", "npm test"],
    result: "All passed"
  }
};

const reviewResult: ReviewResultMessage = {
  protocol_version: 1,
  task_id: "TASK-001",
  message_type: "REVIEW_RESULT",
  from: "codex",
  timestamp: at(4_000),
  summary: "Implementation matches the agreed discussion outcome",
  status: "PASS",
  findings: [],
  recommended_next_action: "None — task complete."
};

async function main(): Promise<void> {
  const openPath = await writeMessage(repoRoot, discussionOpen);
  const replyPath = await writeMessage(repoRoot, discussionReply);
  const consensusPath = await writeMessage(repoRoot, consensus);
  const implementationPath = await writeMessage(repoRoot, implementationResult);
  const reviewPath = await writeMessage(repoRoot, reviewResult);

  console.log("Wrote:", openPath);
  console.log("Wrote:", replyPath);
  console.log("Wrote:", consensusPath);
  console.log("Wrote:", implementationPath);
  console.log("Wrote:", reviewPath);
  console.log("Latest message:", await latestMessageForTask(repoRoot, "TASK-001"));
  console.log("Implementation ready:", await isImplementationReady(repoRoot, "TASK-001"));
  console.log("Implementation blocked:", await isImplementationBlocked(repoRoot, "TASK-001"));
  console.log("Next responder:", await nextResponderForTask(repoRoot, "TASK-001"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
