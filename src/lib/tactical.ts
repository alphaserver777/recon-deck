/**
 * Tactical-map derivation logic (fork) — pure, framework-agnostic, no DB/React.
 *
 * Ported from the project's `tools/triage.py` so the tactical map ranks and
 * classifies hosts the same way the CLI triage does: derive a role + sector +
 * icon from open ports / OS, and a list of severity-tagged findings (with a
 * "next step") from port-based rules + EOL-OS detection.
 *
 * This runs over recon-deck's own host/port data, so the map shows severity
 * even before the operator records any manual findings; manual `findings` rows
 * layer on top in the page loader.
 */

export type Sev = "crit" | "high" | "med" | "low" | "info";

export const SEV_WEIGHT: Record<Sev, number> = {
  crit: 4,
  high: 3,
  med: 2,
  low: 1,
  info: 0,
};

export type SectorKey =
  | "COMMAND"
  | "DATABASES"
  | "MGMT"
  | "SERVERS"
  | "ENDPOINTS"
  | "NETWORK"
  | "IOT";

export interface SectorDef {
  key: SectorKey;
  title: string;
  desc: string;
}

/** Display order = battlefield priority (command center first). */
export const SECTORS: SectorDef[] = [
  { key: "COMMAND", title: "КОМАНДНЫЙ ЦЕНТР", desc: "Контроллеры домена / AD" },
  { key: "DATABASES", title: "БАЗЫ ДАННЫХ", desc: "MSSQL / хранилища" },
  { key: "MGMT", title: "УПРАВЛЕНИЕ", desc: "iLO / IPMI / BMC" },
  { key: "SERVERS", title: "СЕРВЕРЫ", desc: "Backup / прикладные" },
  { key: "ENDPOINTS", title: "ЭНДПОИНТЫ", desc: "Рабочие станции Windows" },
  { key: "NETWORK", title: "ПЕРИМЕТР / СЕТЬ", desc: "Шлюзы / firewall / Linux" },
  { key: "IOT", title: "IoT / ПЕРИФЕРИЯ", desc: "Камеры / принтеры / NVR" },
];

export type RoleKey =
  | "dc"
  | "mssql"
  | "ilo"
  | "ipmi"
  | "backup"
  | "printer"
  | "camera"
  | "windows"
  | "host";

export interface RoleDef {
  key: RoleKey;
  label: string;
  sector: SectorKey;
  icon: string;
}

export const ROLES: Record<RoleKey, RoleDef> = {
  dc: { key: "dc", label: "Domain Controller", sector: "COMMAND", icon: "👑" },
  mssql: { key: "mssql", label: "MSSQL-сервер", sector: "DATABASES", icon: "🗄️" },
  ilo: { key: "ilo", label: "HP iLO (управление)", sector: "MGMT", icon: "🛰️" },
  ipmi: { key: "ipmi", label: "IPMI/BMC", sector: "MGMT", icon: "🔧" },
  backup: { key: "backup", label: "Backup (NDMP/Veritas?)", sector: "SERVERS", icon: "💾" },
  printer: { key: "printer", label: "Принтер/МФУ", sector: "IOT", icon: "🖨️" },
  camera: { key: "camera", label: "IP-камера", sector: "IOT", icon: "📹" },
  windows: { key: "windows", label: "Windows-хост", sector: "ENDPOINTS", icon: "🖥️" },
  host: { key: "host", label: "хост", sector: "NETWORK", icon: "📡" },
};

const EOL_RE =
  /Windows (Server )?(2000|2003|2008|XP|Vista|NT)\b|Windows 7\b/i;

export interface TacticalPort {
  port: number;
  service?: string | null;
  product?: string | null;
  version?: string | null;
}

export interface TacticalFinding {
  sev: Sev;
  title: string;
  detail: string;
  next: string;
}

/** Classify the host role from its open ports + OS string. Mirrors role_of(). */
export function roleOf(ports: number[], osName: string | null): RoleKey {
  const ps = new Set(ports);
  if (ps.has(88) && ps.has(389) && ps.has(445)) return "dc";
  if (ps.has(17990) || ps.has(17988)) return "ilo";
  if (ps.has(623)) return "ipmi";
  if (ps.has(9100) || ps.has(515) || ps.has(631)) return "printer";
  if (ps.has(554)) return "camera";
  if (ps.has(1433) || ps.has(2288) || ps.has(61195)) return "mssql";
  if (ps.has(10000)) return "backup";
  const os = (osName ?? "").toLowerCase();
  if (os.includes("ilo")) return "ilo";
  if (os.includes("windows")) return "windows";
  return "host";
}

/**
 * Derive severity-tagged findings from open ports + OS. Mirrors findings_for()
 * port rules + EOL-OS rule from triage.py. Vuln-script findings (state=VULNERABLE)
 * aren't available in recon-deck's normalized schema, so this covers the
 * port/OS-derived layer; manual `findings` rows are merged separately.
 */
export function findingsFor(
  ports: number[],
  osName: string | null,
): TacticalFinding[] {
  const ps = new Set(ports);
  const F: TacticalFinding[] = [];

  if (osName && EOL_RE.test(osName)) {
    F.push({
      sev: "high",
      title: "EOL / устаревшая ОС",
      detail: osName,
      next: "вне поддержки — высокий риск, изолировать/мигрировать",
    });
  }
  if (ps.has(1433) || ps.has(2288) || ps.has(61195)) {
    F.push({ sev: "high", title: "MSSQL доступен", detail: "ms-sql-s", next: "nxc mssql / mssqlclient; brute sa" });
  }
  if (ps.has(17990) || ps.has(17988)) {
    F.push({ sev: "high", title: "HP iLO веб-консоль", detail: "iLO mgmt", next: "дефолт-креды; CVE по версии iLO" });
  }
  if (ps.has(623)) {
    F.push({ sev: "high", title: "IPMI/BMC", detail: "asf-rmcp 623", next: "ipmi dump hashes (CVE-2013-4786)" });
  }
  if (ps.has(10000)) {
    F.push({ sev: "med", title: "NDMP/Backup (10000)", detail: "ndmp", next: "проверить Veritas Backup Exec" });
  }
  if (ps.has(3389)) {
    F.push({ sev: "med", title: "RDP открыт", detail: "ms-wbt-server", next: "проверить NLA; brute по найденным юзерам" });
  }
  if (ps.has(5985) || ps.has(5986)) {
    F.push({ sev: "med", title: "WinRM открыт", detail: "winrm", next: "evil-winrm при наличии кредов" });
  }
  if (ps.has(445)) {
    F.push({ sev: "med", title: "SMB (445)", detail: "microsoft-ds", next: "nxc smb --shares; проверить signing/ms17-010" });
  }
  if (ps.has(161)) {
    F.push({ sev: "med", title: "SNMP", detail: "snmp/161", next: "onesixtyone + snmpwalk public/private" });
  }
  if (ps.has(9100) || ps.has(515) || ps.has(631)) {
    F.push({ sev: "low", title: "Сетевой принтер", detail: "jetdirect/ipp", next: "snmp дамп; PRET" });
  }
  if (ps.has(554)) {
    F.push({ sev: "low", title: "RTSP/камера", detail: "rtsp 554", next: "rtsp-url-brute; дефолт-креды" });
  }

  // dedup by (sev,title), sort by severity desc
  const seen = new Set<string>();
  const uniq = F.filter((f) => {
    const k = f.sev + "|" + f.title;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  uniq.sort((a, b) => SEV_WEIGHT[b.sev] - SEV_WEIGHT[a.sev]);
  return uniq;
}

export interface SevCounts {
  crit: number;
  high: number;
  med: number;
  low: number;
}

export function countBySeverity(findings: { sev: Sev }[]): SevCounts {
  const c: SevCounts = { crit: 0, high: 0, med: 0, low: 0 };
  for (const f of findings) {
    if (f.sev === "crit") c.crit++;
    else if (f.sev === "high") c.high++;
    else if (f.sev === "med") c.med++;
    else if (f.sev === "low") c.low++;
  }
  return c;
}

/** Map recon-deck's finding severity enum onto the tactical Sev scale. */
export function normalizeSeverity(s: string): Sev {
  switch (s) {
    case "critical":
      return "crit";
    case "high":
      return "high";
    case "medium":
      return "med";
    case "low":
      return "low";
    default:
      return "info";
  }
}

// ---------------------------------------------------------------------------
// View-model assembled by the map page loader and consumed by the client view.
// Plain serialisable shapes only (no DB row types) so it crosses the RSC
// boundary cleanly.
// ---------------------------------------------------------------------------

export interface MapPort {
  port: number;
  protocol: string;
  service: string | null;
  product: string | null;
  version: string | null;
}

export interface MapCred {
  id: number;
  service: string | null;
  port: number | null;
  username: string;
  secret: string;
  kind: string;
  validated: string;
}

export interface MapCmd {
  id: number;
  portId: number | null;
  command: string;
  result: string;
  ts: string;
}

export interface MapHost {
  id: number;
  ip: string;
  hostname: string | null;
  osName: string | null;
  state: string | null;
  priority: number;
  opStatus: string;
  notes: string;
  role: RoleKey;
  roleLabel: string;
  sector: SectorKey;
  icon: string;
  ports: MapPort[];
  findings: TacticalFinding[];
  counts: SevCounts;
  maxsev: number;
  creds: MapCred[];
  commandLog: MapCmd[];
}

export interface BuildMapHostInput {
  id: number;
  ip: string;
  hostname: string | null;
  osName: string | null;
  state: string | null;
  priority: number;
  opStatus: string;
  notes: string;
  ports: MapPort[];
  /** Manual findings (from recon-deck `findings` table) already mapped to Sev. */
  manualFindings: TacticalFinding[];
  creds: MapCred[];
  commandLog: MapCmd[];
}

/** Assemble a full tactical view-model for one host. Pure. */
export function buildMapHost(input: BuildMapHostInput): MapHost {
  const portNums = input.ports.map((p) => p.port);
  const role = roleOf(portNums, input.osName);
  const def = ROLES[role];

  // derived (port/OS) findings + operator-entered manual findings, deduped
  const derived = findingsFor(portNums, input.osName);
  const merged: TacticalFinding[] = [...derived];
  const seen = new Set(merged.map((f) => f.sev + "|" + f.title));
  for (const f of input.manualFindings) {
    const k = f.sev + "|" + f.title;
    if (!seen.has(k)) {
      seen.add(k);
      merged.push(f);
    }
  }
  merged.sort((a, b) => SEV_WEIGHT[b.sev] - SEV_WEIGHT[a.sev]);

  const counts = countBySeverity(merged);
  const maxsev = merged.reduce((m, f) => Math.max(m, SEV_WEIGHT[f.sev]), 0);

  return {
    id: input.id,
    ip: input.ip,
    hostname: input.hostname,
    osName: input.osName,
    state: input.state,
    priority: input.priority,
    opStatus: input.opStatus,
    notes: input.notes,
    role,
    roleLabel: def.label,
    sector: def.sector,
    icon: def.icon,
    ports: input.ports.sort((a, b) => a.port - b.port),
    findings: merged,
    counts,
    maxsev,
    creds: input.creds,
    commandLog: input.commandLog,
  };
}

/**
 * Sort hosts for the map: dismissed last, then by max severity, then manual
 * priority, then crit/high counts, then IP. Owned hosts keep their rank (they
 * stay visible as conquered territory) but render with a distinct colour.
 */
export function sortMapHosts(hosts: MapHost[]): MapHost[] {
  const lastOctet = (ip: string) => {
    const n = Number(ip.split(".").pop());
    return Number.isFinite(n) ? n : 0;
  };
  return [...hosts].sort((a, b) => {
    const ad = a.opStatus === "dismissed" ? 1 : 0;
    const bd = b.opStatus === "dismissed" ? 1 : 0;
    if (ad !== bd) return ad - bd;
    if (b.maxsev !== a.maxsev) return b.maxsev - a.maxsev;
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (b.counts.crit !== a.counts.crit) return b.counts.crit - a.counts.crit;
    if (b.counts.high !== a.counts.high) return b.counts.high - a.counts.high;
    return lastOctet(a.ip) - lastOctet(b.ip);
  });
}

/** Top-of-map severity label for a host's findings. */
export function topSev(counts: SevCounts): Sev {
  if (counts.crit) return "crit";
  if (counts.high) return "high";
  if (counts.med) return "med";
  if (counts.low) return "low";
  return "info";
}
