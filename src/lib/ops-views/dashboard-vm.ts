import "server-only";

import type { MapHost } from "@/lib/tactical";
import type { CommandLogEntry } from "@/lib/db/schema";
import type {
  ChartSegment,
  EntryPoint,
  TopTarget,
  TimelineEvent,
  Objective,
  CredStat,
  MockHost,
  PivotPath,
  MitreTechnique,
} from "./types";

export interface DashboardData {
  hostCount: number;
  highValueCount: number;
  entryPointCount: number;
  credCount: number;
  vulnCount: number;
  attackPathCount: number;

  riskDist: ChartSegment[];
  hostsByRole: ChartSegment[];
  osDist: ChartSegment[];
  entryPoints: EntryPoint[];
  topTargets: TopTarget[];
  timelineEvents: TimelineEvent[];
  objectives: Objective[];
  credStats: CredStat[];
  selectedHost: MockHost | null;
  pivotPaths: PivotPath[];
  mitreTechniques: MitreTechnique[];
  notes: string[];
}

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: "var(--accent-green)",
  CREDENTIALS: "var(--risk-high)",
  ERROR: "var(--risk-crit)",
  INFO: "var(--accent)",
};

export function buildDashboardData(
  hosts: MapHost[],
  commands: CommandLogEntry[],
  domain: string,
): DashboardData {
  const riskDist: ChartSegment[] = [
    { label: "CRITICAL", value: 0, color: "var(--risk-crit)" },
    { label: "HIGH", value: 0, color: "var(--risk-high)" },
    { label: "MEDIUM", value: 0, color: "var(--risk-med)" },
    { label: "LOW", value: 0, color: "var(--risk-low)" },
  ];
  for (const h of hosts) {
    riskDist[0].value += h.counts.crit;
    riskDist[1].value += h.counts.high;
    riskDist[2].value += h.counts.med;
    riskDist[3].value += h.counts.low;
  }

  const roleCount = new Map<string, number>();
  const osCount = new Map<string, number>();
  for (const h of hosts) {
    roleCount.set(h.roleLabel, (roleCount.get(h.roleLabel) ?? 0) + 1);
    const os = h.osShortStr || h.osName || "Unknown";
    osCount.set(os, (osCount.get(os) ?? 0) + 1);
  }

  const ROLE_COLORS = ["var(--accent)", "var(--risk-high)", "var(--risk-med)", "var(--risk-low)", "var(--risk-crit)", "var(--fg-subtle)"];
  const hostsByRole = [...roleCount.entries()].map(([label, value], i) => ({
    label,
    value,
    color: ROLE_COLORS[i % ROLE_COLORS.length],
  }));

  const OS_COLORS = ["var(--risk-low)", "var(--accent)", "var(--risk-med)", "var(--risk-high)", "var(--fg-subtle)"];
  const osDist = [...osCount.entries()].map(([label, value], i) => ({
    label,
    value,
    color: OS_COLORS[i % OS_COLORS.length],
  }));

  const entryPorts = new Set([21, 22, 80, 443, 445, 3389, 8080, 8443]);
  const entryPoints: EntryPoint[] = [];
  for (const h of hosts) {
    for (const p of h.ports) {
      if (entryPorts.has(p.port)) {
        entryPoints.push({
          ip: h.ip,
          port: p.port,
          protocol: p.protocol,
          label: p.service || `port ${p.port}`,
        });
      }
    }
  }

  const topTargets = hosts
    .map((h) => ({
      hostname: h.hostname || h.ip,
      score: h.counts.crit * 40 + h.counts.high * 20 + h.counts.med * 8 + h.counts.low * 2,
    }))
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const recentCmds = commands.slice(0, 8);
  const timelineEvents: TimelineEvent[] = recentCmds.map((c) => {
    const dt = new Date(c.ts);
    return {
      time: dt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      label: c.summary || c.command.slice(0, 60),
      color: STATUS_COLORS[c.status || "INFO"] || "var(--accent)",
    };
  });

  let totalCreds = 0;
  let hashCreds = 0;
  let clearCreds = 0;
  for (const h of hosts) {
    totalCreds += h.creds.length;
    for (const c of h.creds) {
      if (c.kind === "hash") hashCreds++;
      else clearCreds++;
    }
  }
  const credStats: CredStat[] = [
    { label: "Total", value: totalCreds, icon: "🔑" },
    { label: "Cleartext", value: clearCreds, icon: "📝" },
    { label: "Hashes", value: hashCreds, icon: "#️⃣" },
  ];

  const highValueCount = hosts.filter((h) => h.maxsev >= 3).length;

  const selectedHost: MockHost | null = hosts.length > 0
    ? {
        id: String(hosts[0].id),
        hostname: hosts[0].hostname || hosts[0].ip,
        ip: hosts[0].ip,
        role: hosts[0].role as any,
        os: hosts[0].osName || "Unknown",
        domain,
        riskScore: hosts[0].counts.crit * 40 + hosts[0].counts.high * 20,
        attackSurface: hosts[0].ports.map((p) => p.service || `${p.port}/${p.protocol}`).slice(0, 5),
        exposures: hosts[0].findings.map((f) => f.title).slice(0, 3),
        highValueUsers: hosts[0].creds.map((c) => c.username).slice(0, 3),
        mapX: 0.5,
        mapY: 0.5,
      }
    : null;

  return {
    hostCount: hosts.length,
    highValueCount,
    entryPointCount: entryPoints.length,
    credCount: totalCreds,
    vulnCount: riskDist.reduce((s, r) => s + r.value, 0),
    attackPathCount: 0,
    riskDist,
    hostsByRole,
    osDist,
    entryPoints: entryPoints.slice(0, 8),
    topTargets,
    timelineEvents,
    objectives: [],
    credStats,
    selectedHost,
    pivotPaths: [],
    mitreTechniques: [],
    notes: [],
  };
}
