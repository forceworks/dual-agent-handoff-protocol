import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { Actor, HandoffMessage, MessageType } from "./types.js";
import { validateMessage } from "./validator.js";

interface MessageRecord {
  fileName: string;
  message: HandoffMessage;
  version: number;
}

const FILE_NAME_PATTERN = /^(?<taskId>.+)\.(?<messageType>[A-Z_]+)\.v(?<version>\d+)\.json$/;

export async function ensureHandoffsDir(repoRoot: string): Promise<string> {
  const dir = join(repoRoot, "handoffs");
  await mkdir(dir, { recursive: true });
  return dir;
}

export function buildFileName(message: HandoffMessage, version = 1): string {
  return `${message.task_id}.${message.message_type}.v${version}.json`;
}

export function parseFileName(fileName: string): { taskId: string; messageType: MessageType; version: number } | null {
  const match = FILE_NAME_PATTERN.exec(fileName);
  if (!match?.groups) {
    return null;
  }

  return {
    taskId: match.groups.taskId,
    messageType: match.groups.messageType as MessageType,
    version: Number.parseInt(match.groups.version, 10)
  };
}

async function readMessageRecordsForTask(repoRoot: string, taskId: string): Promise<MessageRecord[]> {
  const dir = await ensureHandoffsDir(repoRoot);
  const files = await readdir(dir);
  const matching = files.filter((fileName) => fileName.startsWith(`${taskId}.`) && fileName.endsWith(".json"));

  const records: MessageRecord[] = [];
  for (const fileName of matching) {
    const raw = await readFile(join(dir, fileName), "utf-8");
    const parsed = parseFileName(fileName);

    records.push({
      fileName,
      message: JSON.parse(raw) as HandoffMessage,
      version: parsed?.version ?? 0
    });
  }

  return records.sort((left, right) => {
    const timestampCompare = left.message.timestamp.localeCompare(right.message.timestamp);
    if (timestampCompare !== 0) {
      return timestampCompare;
    }

    const versionCompare = left.version - right.version;
    if (versionCompare !== 0) {
      return versionCompare;
    }

    return left.fileName.localeCompare(right.fileName);
  });
}

export async function nextMessageVersion(
  repoRoot: string,
  taskId: string,
  messageType: MessageType
): Promise<number> {
  const dir = await ensureHandoffsDir(repoRoot);
  const files = await readdir(dir);
  const versions = files
    .map(parseFileName)
    .filter(
      (parsed): parsed is { taskId: string; messageType: MessageType; version: number } =>
        parsed !== null && parsed.taskId === taskId && parsed.messageType === messageType
    )
    .map((parsed) => parsed.version);

  if (versions.length === 0) {
    return 1;
  }

  return Math.max(...versions) + 1;
}

export async function writeMessage(repoRoot: string, message: HandoffMessage, version?: number): Promise<string> {
  const result = validateMessage(message);
  if (!result.valid) {
    throw new Error(`Invalid message: ${result.errors.join("; ")}`);
  }

  const dir = await ensureHandoffsDir(repoRoot);
  const resolvedVersion = version ?? (await nextMessageVersion(repoRoot, message.task_id, message.message_type));
  const fileName = buildFileName(message, resolvedVersion);
  const path = join(dir, fileName);

  await writeFile(path, JSON.stringify(message, null, 2), { encoding: "utf-8", flag: "wx" });
  return path;
}

export async function readMessagesForTask(repoRoot: string, taskId: string): Promise<HandoffMessage[]> {
  const records = await readMessageRecordsForTask(repoRoot, taskId);
  return records.map((record) => record.message);
}

export async function latestMessageForTask(repoRoot: string, taskId: string): Promise<HandoffMessage | null> {
  const messages = await readMessagesForTask(repoRoot, taskId);
  return messages.at(-1) ?? null;
}

export async function latestApprovedRevision(repoRoot: string, taskId: string): Promise<string | null> {
  const messages = await readMessagesForTask(repoRoot, taskId);
  const approvals = messages.filter((message) => message.message_type === "APPROVAL");
  if (approvals.length === 0) {
    return null;
  }

  const latest = approvals.at(-1) as Extract<HandoffMessage, { message_type: "APPROVAL" }>;
  return latest.approved_revision ?? null;
}

export async function isImplementationReady(repoRoot: string, taskId: string): Promise<boolean> {
  const latestMessage = await latestMessageForTask(repoRoot, taskId);
  if (!latestMessage) {
    return false;
  }

  return latestMessage.message_type === "APPROVAL" || latestMessage.message_type === "CONSENSUS_REACHED";
}

export async function isImplementationBlocked(repoRoot: string, taskId: string): Promise<boolean> {
  const latestMessage = await latestMessageForTask(repoRoot, taskId);
  if (!latestMessage) {
    return false;
  }

  return (
    latestMessage.message_type === "CHALLENGE" ||
    latestMessage.message_type === "CLARIFICATION_REQUEST" ||
    latestMessage.message_type === "NEEDS_HUMAN_DECISION"
  );
}

export async function nextResponderForTask(repoRoot: string, taskId: string): Promise<Actor | null> {
  const latestMessage = await latestMessageForTask(repoRoot, taskId);
  if (!latestMessage) {
    return null;
  }

  switch (latestMessage.message_type) {
    case "DISCUSSION_OPEN":
    case "DISCUSSION_REPLY":
    case "DISCUSSION_SUMMARY":
      return latestMessage.from === "claude" ? "codex" : latestMessage.from === "codex" ? "claude" : null;
    case "CONSENSUS_REACHED":
    case "APPROVAL":
      return "claude";
    case "IMPLEMENTATION_RESULT":
    case "REVIEW_REQUEST":
    case "PROPOSAL":
    case "REVISION":
    case "CLARIFICATION_RESPONSE":
      return latestMessage.from === "claude" ? "codex" : latestMessage.from === "codex" ? "claude" : null;
    case "CHALLENGE":
      return latestMessage.from === "claude" ? "codex" : latestMessage.from === "codex" ? "claude" : null;
    case "NEEDS_HUMAN_DECISION":
    case "REVIEW_RESULT":
    case "CANCELLED":
    case "CLARIFICATION_REQUEST":
      return null;
    default:
      return null;
  }
}
