import "server-only";

/**
 * Network-intel repository (fork) — the engagement-level "operation brief".
 *
 * One row per engagement (PK = engagement_id). Operator-owned; the importer
 * never writes here. Upsert keeps it 1:1 with the engagement.
 */

import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { network_intel, type NetworkIntel } from "./schema";
import type * as schema from "./schema";

export type Db = BetterSQLite3Database<typeof schema>;

export interface NetworkIntelPatch {
  organization?: string;
  domain?: string;
  scope?: string;
  budget?: string;
  notes?: string;
  vpn_login?: string;
  vpn_password?: string;
  industry?: string;
  employee_count?: number;
  progress?: number;
  risk_level?: string;
  op_status?: string;
}

const EMPTY = (engagementId: number): NetworkIntel => ({
  engagement_id: engagementId,
  organization: "",
  domain: "",
  scope: "",
  budget: "",
  notes: "",
  updated_at: "",
  vpn_login: "",
  vpn_password: "",
  industry: "",
  employee_count: 0,
  progress: 0,
  risk_level: "medium",
  op_status: "recon",
});

export function getNetworkIntel(db: Db, engagementId: number): NetworkIntel {
  const row = db
    .select()
    .from(network_intel)
    .where(eq(network_intel.engagement_id, engagementId))
    .get();
  return row ?? EMPTY(engagementId);
}

export function upsertNetworkIntel(
  db: Db,
  engagementId: number,
  patch: NetworkIntelPatch,
): NetworkIntel {
  const now = new Date().toISOString();
  const existing = db
    .select()
    .from(network_intel)
    .where(eq(network_intel.engagement_id, engagementId))
    .get();

  const merged = {
    organization: patch.organization ?? existing?.organization ?? "",
    domain: patch.domain ?? existing?.domain ?? "",
    scope: patch.scope ?? existing?.scope ?? "",
    budget: patch.budget ?? existing?.budget ?? "",
    notes: patch.notes ?? existing?.notes ?? "",
    vpn_login: patch.vpn_login ?? existing?.vpn_login ?? "",
    vpn_password: patch.vpn_password ?? existing?.vpn_password ?? "",
    industry: patch.industry ?? existing?.industry ?? "",
    employee_count: patch.employee_count ?? existing?.employee_count ?? 0,
    progress: patch.progress ?? existing?.progress ?? 0,
    risk_level: patch.risk_level ?? existing?.risk_level ?? "medium",
    op_status: patch.op_status ?? existing?.op_status ?? "recon",
  };

  return db
    .insert(network_intel)
    .values({ engagement_id: engagementId, ...merged, updated_at: now })
    .onConflictDoUpdate({
      target: network_intel.engagement_id,
      set: { ...merged, updated_at: now },
    })
    .returning()
    .get();
}
