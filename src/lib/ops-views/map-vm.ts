import "server-only";

import type { MapHost } from "@/lib/tactical";
import type { MapHostFull, MapRoleKey, SectorKey, OpStatus, SevCounts } from "./types";

export function toMapHostFull(h: MapHost): MapHostFull {
  return {
    id: String(h.id),
    hostname: h.hostname ?? h.ip,
    ip: h.ip,
    role: h.role as MapRoleKey,
    sector: h.sector as SectorKey,
    os: h.osShortStr || h.osName || "Unknown",
    osIcon: h.osIconStr || "",
    opStatus: h.opStatus as OpStatus,
    priority: h.priority,
    riskScore: h.counts.crit * 40 + h.counts.high * 20 + h.counts.med * 8 + h.counts.low * 2,
    counts: h.counts as SevCounts,
    ports: h.ports.map((p) => p.port),
    notes: h.notes,
  };
}
