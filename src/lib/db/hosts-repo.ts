import "server-only";

/**
 * Hosts repository (P1-F PR 1).
 *
 * Read-side helpers for the multi-host foundation. Write-side mutations live
 * in `engagement-repo.ts` (createFromScan / updateTarget) so the host invariants
 * — at-least-one row, exactly-one-primary — stay close to the engagement
 * lifecycle. Once later PRs introduce explicit "add host" / "delete host"
 * actions in the UI, full CRUD will land here.
 */

import { eq, and, desc } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { hosts, type Host } from "./schema";
import type * as schema from "./schema";

export type Db = BetterSQLite3Database<typeof schema>;

export type OpStatus = "recon" | "active" | "owned" | "dismissed";

/**
 * List every host inside an engagement, primary first then by IP.
 *
 * Sort order matters: the engagement page header reads `[0]` to render the
 * default-selected host until the UI explicitly switches. Keep deterministic.
 */
export function listHostsForEngagement(db: Db, engagementId: number): Host[] {
  return db
    .select()
    .from(hosts)
    .where(eq(hosts.engagement_id, engagementId))
    .all()
    .sort((a, b) => {
      // primary first
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      // then IP ascending — string compare is fine for both v4 and v6
      return a.ip.localeCompare(b.ip);
    });
}

/**
 * Resolve the engagement's primary host. Throws if absent — every engagement
 * is required to have one (migration 0007 backfilled, createFromScan inserts).
 * A missing primary signals corruption that callers shouldn't paper over.
 */
export function getPrimaryHost(db: Db, engagementId: number): Host {
  const row = db
    .select()
    .from(hosts)
    .where(
      and(eq(hosts.engagement_id, engagementId), eq(hosts.is_primary, true)),
    )
    .orderBy(desc(hosts.id))
    .get();
  if (!row) {
    throw new Error(
      `No primary host for engagement ${engagementId} — schema invariant violated.`,
    );
  }
  return row;
}

// ---------------------------------------------------------------------------
// Tactical-map operator mutations (fork). Engagement-scoped guards mirror the
// findings-repo pattern; all three are operator-owned and survive rescans.
// ---------------------------------------------------------------------------

function updateHostField(
  db: Db,
  engagementId: number,
  hostId: number,
  patch: Partial<Pick<Host, "priority" | "op_status" | "notes">>,
): Host | null {
  const existing = db
    .select()
    .from(hosts)
    .where(and(eq(hosts.id, hostId), eq(hosts.engagement_id, engagementId)))
    .get();
  if (!existing) return null;
  return db
    .update(hosts)
    .set(patch)
    .where(and(eq(hosts.id, hostId), eq(hosts.engagement_id, engagementId)))
    .returning()
    .get();
}

/** Set operator priority (0=none,1=low,2=high,3=critical). */
export function setHostPriority(
  db: Db,
  engagementId: number,
  hostId: number,
  priority: number,
): Host | null {
  const p = Math.max(0, Math.min(3, Math.trunc(priority)));
  return updateHostField(db, engagementId, hostId, { priority: p });
}

/** Set operation status (recon|active|owned|dismissed). */
export function setHostStatus(
  db: Db,
  engagementId: number,
  hostId: number,
  status: OpStatus,
): Host | null {
  return updateHostField(db, engagementId, hostId, { op_status: status });
}

/** Set host-level markdown notes. */
export function setHostNotes(
  db: Db,
  engagementId: number,
  hostId: number,
  notes: string,
): Host | null {
  return updateHostField(db, engagementId, hostId, { notes });
}
