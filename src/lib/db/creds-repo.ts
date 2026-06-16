import "server-only";

/**
 * Creds repository (fork: tactical-map) — CRUD on harvested credentials.
 *
 * Credentials are host-scoped and operator-owned: the AutoRecon importer never
 * writes here, so a rescan leaves them intact. Mirrors the findings-repo shape
 * (db first arg, engagement-scoped guards on update/delete).
 */

import { eq, and, desc } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { creds, type Cred } from "./schema";
import type * as schema from "./schema";

export type Db = BetterSQLite3Database<typeof schema>;

export type CredKind = "pass" | "hash" | "key";
export type CredValidated = "untested" | "valid" | "invalid";

export interface CredInput {
  engagementId: number;
  hostId: number;
  service?: string | null;
  port?: number | null;
  username?: string;
  secret?: string;
  kind?: CredKind;
  validated?: CredValidated;
}

export interface CredPatch {
  service?: string | null;
  port?: number | null;
  username?: string;
  secret?: string;
  kind?: CredKind;
  validated?: CredValidated;
}

export function listCreds(db: Db, engagementId: number): Cred[] {
  return db
    .select()
    .from(creds)
    .where(eq(creds.engagement_id, engagementId))
    .orderBy(desc(creds.created_at))
    .all();
}

export function createCred(db: Db, input: CredInput): Cred {
  const now = new Date().toISOString();
  return db
    .insert(creds)
    .values({
      engagement_id: input.engagementId,
      host_id: input.hostId,
      service: input.service?.trim() || null,
      port: input.port ?? null,
      username: (input.username ?? "").trim(),
      secret: input.secret ?? "",
      kind: input.kind ?? "pass",
      validated: input.validated ?? "untested",
      created_at: now,
    })
    .returning()
    .get();
}

export function updateCred(
  db: Db,
  engagementId: number,
  id: number,
  patch: CredPatch,
): Cred | null {
  const existing = db
    .select()
    .from(creds)
    .where(and(eq(creds.id, id), eq(creds.engagement_id, engagementId)))
    .get();
  if (!existing) return null;

  const next = {
    service:
      patch.service === undefined
        ? existing.service
        : patch.service?.trim() || null,
    port: patch.port === undefined ? existing.port : patch.port,
    username: patch.username === undefined ? existing.username : patch.username.trim(),
    secret: patch.secret === undefined ? existing.secret : patch.secret,
    kind: patch.kind ?? existing.kind,
    validated: patch.validated ?? existing.validated,
  };

  return db
    .update(creds)
    .set(next)
    .where(and(eq(creds.id, id), eq(creds.engagement_id, engagementId)))
    .returning()
    .get();
}

export function deleteCred(db: Db, engagementId: number, id: number): boolean {
  const result = db
    .delete(creds)
    .where(and(eq(creds.id, id), eq(creds.engagement_id, engagementId)))
    .run();
  return result.changes > 0;
}
