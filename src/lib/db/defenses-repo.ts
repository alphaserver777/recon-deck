import "server-only";

/**
 * Defenses repository (fork) — discovered security controls (СЗИ / САВЗ).
 *
 * host_id NULL = network-level control. Operator-owned; importer never writes.
 */

import { eq, and, desc } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { defenses, type Defense } from "./schema";
import type * as schema from "./schema";

export type Db = BetterSQLite3Database<typeof schema>;

export type DefenseCategory =
  | "savz"
  | "edr"
  | "fw"
  | "ips"
  | "siem"
  | "dlp"
  | "waf"
  | "nac"
  | "other";

export const DEFENSE_CATEGORIES: DefenseCategory[] = [
  "savz",
  "edr",
  "fw",
  "ips",
  "siem",
  "dlp",
  "waf",
  "nac",
  "other",
];

export interface DefenseInput {
  engagementId: number;
  hostId?: number | null;
  category: DefenseCategory;
  product: string;
  detail?: string;
}

export function listDefenses(db: Db, engagementId: number): Defense[] {
  return db
    .select()
    .from(defenses)
    .where(eq(defenses.engagement_id, engagementId))
    .orderBy(desc(defenses.created_at))
    .all();
}

export function createDefense(db: Db, input: DefenseInput): Defense {
  return db
    .insert(defenses)
    .values({
      engagement_id: input.engagementId,
      host_id: input.hostId ?? null,
      category: input.category,
      product: input.product.trim(),
      detail: (input.detail ?? "").trim(),
      created_at: new Date().toISOString(),
    })
    .returning()
    .get();
}

export function deleteDefense(
  db: Db,
  engagementId: number,
  id: number,
): boolean {
  const result = db
    .delete(defenses)
    .where(and(eq(defenses.id, id), eq(defenses.engagement_id, engagementId)))
    .run();
  return result.changes > 0;
}
