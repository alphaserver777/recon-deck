import "server-only";

import { eq, and, desc } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { timeline_notes, type TimelineNote } from "./schema";
import type * as schema from "./schema";

export type Db = BetterSQLite3Database<typeof schema>;

export function listTimelineNotes(
  db: Db,
  engagementId: number,
): TimelineNote[] {
  return db
    .select()
    .from(timeline_notes)
    .where(eq(timeline_notes.engagement_id, engagementId))
    .orderBy(desc(timeline_notes.ts))
    .all();
}

export function createTimelineNote(
  db: Db,
  engagementId: number,
  body: string,
): TimelineNote {
  return db
    .insert(timeline_notes)
    .values({
      engagement_id: engagementId,
      body: body.trim(),
      ts: new Date().toISOString(),
    })
    .returning()
    .get();
}

export function deleteTimelineNote(
  db: Db,
  engagementId: number,
  id: number,
): boolean {
  const result = db
    .delete(timeline_notes)
    .where(
      and(
        eq(timeline_notes.id, id),
        eq(timeline_notes.engagement_id, engagementId),
      ),
    )
    .run();
  return result.changes > 0;
}
