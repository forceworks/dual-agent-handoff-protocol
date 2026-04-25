import Ajv, { type ErrorObject } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import baseSchema from "../schemas/base-message.schema.json" with { type: "json" };
import discussionOpenSchema from "../schemas/discussion-open.schema.json" with { type: "json" };
import discussionReplySchema from "../schemas/discussion-reply.schema.json" with { type: "json" };
import discussionSummarySchema from "../schemas/discussion-summary.schema.json" with { type: "json" };
import consensusReachedSchema from "../schemas/consensus-reached.schema.json" with { type: "json" };
import needsHumanDecisionSchema from "../schemas/needs-human-decision.schema.json" with { type: "json" };
import proposalSchema from "../schemas/proposal.schema.json" with { type: "json" };
import challengeSchema from "../schemas/challenge.schema.json" with { type: "json" };
import revisionSchema from "../schemas/revision.schema.json" with { type: "json" };
import approvalSchema from "../schemas/approval.schema.json" with { type: "json" };
import implementationResultSchema from "../schemas/implementation-result.schema.json" with { type: "json" };
import reviewResultSchema from "../schemas/review-result.schema.json" with { type: "json" };
import clarificationRequestSchema from "../schemas/clarification-request.schema.json" with { type: "json" };
import clarificationResponseSchema from "../schemas/clarification-response.schema.json" with { type: "json" };
import cancelledSchema from "../schemas/cancelled.schema.json" with { type: "json" };
import reviewRequestSchema from "../schemas/review-request.schema.json" with { type: "json" };

import type { HandoffMessage } from "./types.js";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

ajv.addSchema(baseSchema);

const validators = {
  DISCUSSION_OPEN: ajv.compile(discussionOpenSchema),
  DISCUSSION_REPLY: ajv.compile(discussionReplySchema),
  DISCUSSION_SUMMARY: ajv.compile(discussionSummarySchema),
  CONSENSUS_REACHED: ajv.compile(consensusReachedSchema),
  NEEDS_HUMAN_DECISION: ajv.compile(needsHumanDecisionSchema),
  PROPOSAL: ajv.compile(proposalSchema),
  CHALLENGE: ajv.compile(challengeSchema),
  REVISION: ajv.compile(revisionSchema),
  APPROVAL: ajv.compile(approvalSchema),
  IMPLEMENTATION_RESULT: ajv.compile(implementationResultSchema),
  REVIEW_RESULT: ajv.compile(reviewResultSchema),
  CLARIFICATION_REQUEST: ajv.compile(clarificationRequestSchema),
  CLARIFICATION_RESPONSE: ajv.compile(clarificationResponseSchema),
  CANCELLED: ajv.compile(cancelledSchema),
  REVIEW_REQUEST: ajv.compile(reviewRequestSchema)
};

export function validateMessage(message: HandoffMessage): { valid: boolean; errors: string[] } {
  const validator = validators[message.message_type as keyof typeof validators];
  if (!validator) {
    return { valid: false, errors: [`Unsupported message_type: ${message.message_type}`] };
  }

  const valid = validator(message);
  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = (validator.errors ?? []).map(
    (err: ErrorObject) => `${err.instancePath || "/"} ${err.message ?? "validation error"}`
  );
  return { valid: false, errors };
}
