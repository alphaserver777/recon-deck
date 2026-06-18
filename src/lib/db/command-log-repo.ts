import "server-only";

/**
 * Command-log repository (fork: tactical-map).
 *
 * Execution history — what was run against a host/port and what came back.
 * Distinct from `port_commands` (runnable templates from AutoRecon). Operator-
 * owned; the importer never writes here, so rescans don't touch it.
 */

import { eq, and, desc } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { command_log, type CommandLogEntry } from "./schema";
import type * as schema from "./schema";

export type Db = BetterSQLite3Database<typeof schema>;

export interface CommandLogInput {
  engagementId: number;
  hostId: number;
  portId?: number | null;
  command: string;
  result?: string;
  category?: string;
  status?: string;
  summary?: string;
  link?: string;
  goal?: string;
}

export interface CommandLogPatch {
  command?: string;
  result?: string;
  category?: string;
  status?: string;
  summary?: string;
  starred?: boolean;
  link?: string;
  goal?: string;
}

export function listCommandLog(
  db: Db,
  engagementId: number,
): CommandLogEntry[] {
  return db
    .select()
    .from(command_log)
    .where(eq(command_log.engagement_id, engagementId))
    .orderBy(desc(command_log.ts))
    .all();
}

export function createCommandLogEntry(
  db: Db,
  input: CommandLogInput,
): CommandLogEntry {
  return db
    .insert(command_log)
    .values({
      engagement_id: input.engagementId,
      host_id: input.hostId,
      port_id: input.portId ?? null,
      command: input.command.trim(),
      result: input.result ?? "",
      ts: new Date().toISOString(),
      category: input.category ?? "",
      status: input.status ?? "INFO",
      summary: input.summary ?? "",
      link: input.link ?? "",
      goal: input.goal ?? "",
    })
    .returning()
    .get();
}

export function updateCommandLogEntry(
  db: Db,
  engagementId: number,
  id: number,
  patch: CommandLogPatch,
): boolean {
  const sets: Record<string, unknown> = {};
  if (patch.command !== undefined) sets.command = patch.command.trim();
  if (patch.result !== undefined) sets.result = patch.result;
  if (patch.category !== undefined) sets.category = patch.category;
  if (patch.status !== undefined) sets.status = patch.status;
  if (patch.summary !== undefined) sets.summary = patch.summary;
  if (patch.starred !== undefined) sets.starred = patch.starred;
  if (patch.link !== undefined) sets.link = patch.link;
  if (patch.goal !== undefined) sets.goal = patch.goal;
  if (Object.keys(sets).length === 0) return false;
  const result = db
    .update(command_log)
    .set(sets)
    .where(
      and(
        eq(command_log.id, id),
        eq(command_log.engagement_id, engagementId),
      ),
    )
    .run();
  return result.changes > 0;
}

export function deleteCommandLogEntry(
  db: Db,
  engagementId: number,
  id: number,
): boolean {
  const result = db
    .delete(command_log)
    .where(
      and(
        eq(command_log.id, id),
        eq(command_log.engagement_id, engagementId),
      ),
    )
    .run();
  return result.changes > 0;
}
