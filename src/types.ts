export type Actor = "codex" | "claude" | "user";

export type DiscussionMessageType =
  | "DISCUSSION_OPEN"
  | "DISCUSSION_REPLY"
  | "DISCUSSION_SUMMARY"
  | "CONSENSUS_REACHED"
  | "NEEDS_HUMAN_DECISION";

export type ExecutionMessageType =
  | "PROPOSAL"
  | "CHALLENGE"
  | "REVISION"
  | "APPROVAL"
  | "IMPLEMENTATION_RESULT"
  | "REVIEW_RESULT"
  | "CLARIFICATION_REQUEST"
  | "CLARIFICATION_RESPONSE"
  | "CANCELLED"
  | "REVIEW_REQUEST";

export type MessageType = DiscussionMessageType | ExecutionMessageType;

export interface BaseMessage {
  protocol_version: 1;
  task_id: string;
  message_type: MessageType;
  from: Actor;
  to?: Actor;
  timestamp: string;
  summary: string;
}

export interface DiscussionMessageBase extends BaseMessage {
  body: string;
}

export interface DiscussionOpenMessage extends DiscussionMessageBase {
  message_type: "DISCUSSION_OPEN";
}

export interface DiscussionReplyMessage extends DiscussionMessageBase {
  message_type: "DISCUSSION_REPLY";
}

export interface DiscussionSummaryMessage extends DiscussionMessageBase {
  message_type: "DISCUSSION_SUMMARY";
}

export interface ConsensusReachedMessage extends DiscussionMessageBase {
  message_type: "CONSENSUS_REACHED";
  implementation_ready: true;
}

export interface NeedsHumanDecisionMessage extends DiscussionMessageBase {
  message_type: "NEEDS_HUMAN_DECISION";
  decision_summary: string;
  options?: string[];
}

export interface ProposalMessage extends BaseMessage {
  message_type: "PROPOSAL";
  title: string;
  objective: string;
  scope: {
    included: string[];
    excluded: string[];
  };
  constraints: string[];
  assumptions: string[];
  acceptance_criteria: string[];
  risks?: string[];
  implementation_guidance?: string[];
  file_targets?: string[];
}

export interface ChallengeIssue {
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
}

export interface ChallengeMessage extends BaseMessage {
  message_type: "CHALLENGE";
  status: "CHALLENGE";
  issues: ChallengeIssue[];
  requested_clarifications?: string[];
  proposed_adjustments?: string[];
  implementation_readiness: "ready" | "blocked";
}

export interface RevisionMessage extends BaseMessage {
  message_type: "REVISION";
  changes: string[];
  supersedes: string;
}

export interface ApprovalMessage extends BaseMessage {
  message_type: "APPROVAL";
  status: "APPROVED";
  notes?: string[];
  approved_revision?: string;
}

export interface ImplementationResultMessage extends BaseMessage {
  message_type: "IMPLEMENTATION_RESULT";
  status: "COMPLETED" | "PARTIAL" | "BLOCKED" | "ABORTED";
  files_changed: string[];
  summary_of_changes?: string[];
  validation: {
    tests_run: string[];
    result: string;
  };
  known_limits?: string[];
}

export interface ReviewFinding {
  severity: "low" | "medium" | "high";
  message: string;
}

export interface ReviewResultMessage extends BaseMessage {
  message_type: "REVIEW_RESULT";
  status: "PASS" | "PASS_WITH_NOTES" | "CHANGES_REQUESTED" | "FAIL";
  findings: ReviewFinding[];
  recommended_next_action: string;
}

export interface ClarificationRequestMessage extends BaseMessage {
  message_type: "CLARIFICATION_REQUEST";
  questions: string[];
}

export interface ClarificationAnswer {
  question: string;
  answer: string;
}

export interface ClarificationResponseMessage extends BaseMessage {
  message_type: "CLARIFICATION_RESPONSE";
  answers: ClarificationAnswer[];
}

export interface CancelledMessage extends BaseMessage {
  message_type: "CANCELLED";
  reason: string;
}

export interface ReviewRequestMessage extends BaseMessage {
  message_type: "REVIEW_REQUEST";
  context: string;
  artifacts?: string[];
  questions?: string[];
}

export type HandoffMessage =
  | DiscussionOpenMessage
  | DiscussionReplyMessage
  | DiscussionSummaryMessage
  | ConsensusReachedMessage
  | NeedsHumanDecisionMessage
  | ProposalMessage
  | ChallengeMessage
  | RevisionMessage
  | ApprovalMessage
  | ImplementationResultMessage
  | ReviewResultMessage
  | ClarificationRequestMessage
  | ClarificationResponseMessage
  | CancelledMessage
  | ReviewRequestMessage;
