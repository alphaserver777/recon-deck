import "server-only";

import type { MapHost } from "@/lib/tactical";
import type { HostTableRow, HostSegment, HostAvailability, HostVuln, HostCred } from "./types";

const SECTOR_TO_SEGMENT: Record<string, HostSegment> = {
  COMMAND: "SERVER_NET",
  DATABASES: "SERVER_NET",
  MGMT: "MGMT_NET",
  SERVERS: "SERVER_NET",
  ENDPOINTS: "WORKSTATIONS",
  NETWORK: "DMZ",
  IOT: "IOT_NET",
};

const ROLE_LABELS: Record<string, string> = {
  dc: "Domain Controller",
  mssql: "Database Server",
  ilo: "iLO / BMC",
  ipmi: "IPMI / BMC",
  backup: "Backup Server",
  printer: "Printer",
  camera: "Camera / NVR",
  windows: "Windows Workstation",
  host: "Server",
  exchange: "Exchange Server",
};

function credKindToType(kind: string): "password" | "hash" | "token" {
  if (kind === "hash") return "hash";
  if (kind === "key") return "token";
  return "password";
}

export function toHostTableRow(h: MapHost, domain: string): HostTableRow {
  const vulns: HostVuln[] = h.findings.map((f) => ({
    name: f.title,
    severity: (
      f.sev === "crit" ? "CRITICAL" : f.sev === "high" ? "HIGH" : f.sev === "med" ? "MEDIUM" : "LOW"
    ) as HostVuln["severity"],
  }));

  const creds: HostCred[] = h.creds.map((c) => ({
    username: c.username,
    type: credKindToType(c.kind),
  }));

  const services = [...new Set(h.ports.map((p) => p.service).filter(Boolean))] as string[];
  const riskScore = h.counts.crit * 40 + h.counts.high * 20 + h.counts.med * 8 + h.counts.low * 2;

  return {
    id: String(h.id),
    hostname: h.hostname ?? h.ip,
    ip: h.ip,
    role: h.role,
    roleLabel: ROLE_LABELS[h.role] || "Server",
    os: h.osName ?? "Unknown",
    segment: SECTOR_TO_SEGMENT[h.sector] || "DMZ",
    riskScore,
    availability: (h.state === "down" ? "offline" : "online") as HostAvailability,
    lastScan: "",
    services,
    vulns,
    creds,
    status: h.opStatus,
    notes: h.notes,
    domain,
  };
}

export function toHostTableRows(hosts: MapHost[], domain: string): HostTableRow[] {
  return hosts.map((h) => toHostTableRow(h, domain));
}
