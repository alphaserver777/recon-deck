/**
 * Types ported from ops-panel mock-data.ts.
 * These define the shapes that ops-panel components expect.
 * View-model mappers in this directory convert recon-deck DB types to these.
 */

export type HostRole =
  | "domain-controller"
  | "server"
  | "workstation"
  | "iot"
  | "entry-point";

export type MockHost = {
  id: string;
  hostname: string;
  ip: string;
  role: HostRole;
  os: string;
  domain: string;
  riskScore: number;
  attackSurface: string[];
  exposures: string[];
  highValueUsers: string[];
  /** SVG position for the static network map (0-1 normalized). */
  mapX: number;
  mapY: number;
};

export type EntryPoint = {
  ip: string;
  port: number;
  protocol: string;
  label: string;
};

export type TimelineEvent = {
  time: string;
  label: string;
  color: string;
};

export type PivotPath = {
  id: number;
  nodes: string[];
  probability: number;
};

export type MitreTechnique = {
  id: string;
  name: string;
  coverage: number;
};

export type Objective = {
  label: string;
  checked: boolean;
};

export type TopTarget = {
  hostname: string;
  score: number;
};

export type ChartSegment = {
  label: string;
  value: number;
  color: string;
};

export type CredStat = {
  label: string;
  value: number;
  icon: string;
};

export type MapEdge = {
  from: string;
  to: string;
  type: "trust" | "connection" | "pivot";
};

export type SectorKey =
  | "COMMAND"
  | "DATABASES"
  | "MGMT"
  | "SERVERS"
  | "ENDPOINTS"
  | "NETWORK"
  | "IOT";

export type SectorDef = {
  key: SectorKey;
  title: string;
  desc: string;
};

export type MapRoleKey =
  | "dc"
  | "mssql"
  | "ilo"
  | "ipmi"
  | "backup"
  | "printer"
  | "camera"
  | "windows"
  | "host"
  | "exchange";

export const MAP_ROLE_COLORS: Record<string, string> = {
  dc: "#e74c3c",
  mssql: "#ff7a18",
  ilo: "#9b59b6",
  ipmi: "#9b59b6",
  backup: "#3498db",
  printer: "#95a5a6",
  camera: "#95a5a6",
  windows: "#48bfe3",
  host: "#48bfe3",
  exchange: "#f39c12",
};

export const MAP_ROLE_LABELS: Record<string, string> = {
  dc: "Domain Controller",
  mssql: "Database Server",
  ilo: "iLO / BMC",
  ipmi: "IPMI / BMC",
  backup: "Backup Server",
  printer: "Printer",
  camera: "Camera / NVR",
  windows: "Workstation",
  host: "Server",
  exchange: "Exchange Server",
};

export function mapRiskColor(score: number): string {
  if (score >= 80) return "var(--risk-crit)";
  if (score >= 40) return "var(--risk-high)";
  if (score >= 10) return "var(--risk-med)";
  return "var(--risk-low)";
}

export function topSev(counts: SevCounts): string {
  if (counts.crit > 0) return "crit";
  if (counts.high > 0) return "high";
  if (counts.med > 0) return "med";
  if (counts.low > 0) return "low";
  return "info";
}

export type OpStatus = "recon" | "active" | "owned" | "dismissed";

export type SevCounts = {
  crit: number;
  high: number;
  med: number;
  low: number;
};

export type MapHostFull = {
  id: string;
  hostname: string;
  ip: string;
  role: MapRoleKey;
  sector: SectorKey;
  os: string;
  osIcon: string;
  opStatus: OpStatus;
  priority: number;
  riskScore: number;
  counts: SevCounts;
  ports: number[];
  notes: string;
};

export type HostSegment = "SERVER_NET" | "DMZ" | "DEV_NET" | "WORKSTATIONS" | "IOT_NET" | "MGMT_NET";

export type HostAvailability = "online" | "offline";

export type HostVuln = {
  name: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
};

export type HostCred = {
  username: string;
  type: "password" | "hash" | "token";
};

export type HostTableRow = {
  id: string;
  hostname: string;
  ip: string;
  role: string;
  roleLabel: string;
  badge?: string;
  os: string;
  segment: HostSegment;
  riskScore: number;
  availability: HostAvailability;
  lastScan: string;
  services: string[];
  vulns: HostVuln[];
  creds: HostCred[];
  status: string;
  notes: string;
  domain: string;
};

export type TimelineStatus = "SUCCESS" | "CREDENTIALS" | "INFO" | "ERROR";

export type TimelineCategory =
  | "recon"
  | "lateral-movement"
  | "credentials"
  | "priv-esc"
  | "domain"
  | "persistence"
  | "exfil"
  | "c2";

export const TIMELINE_STATUS_COLORS: Record<string, string> = {
  SUCCESS: "#22c55e",
  CREDENTIALS: "var(--risk-high)",
  INFO: "var(--accent)",
  ERROR: "var(--risk-crit)",
};

export type TimelineLogEntry = {
  id: number;
  ts: string;
  target: string;
  command: string;
  output: string;
  summary: string;
  status: TimelineStatus;
  category: TimelineCategory;
  hostId: string;
  starred: boolean;
};

export type TimelineNoteEntry = {
  id: number;
  ts: string;
  text: string;
  author: string;
};

export type CredType = "NTLM Hash" | "Cleartext" | "Kerberos" | "Certificate";

export type CredTag = "DA" | "KRBTGT" | "SERVICE" | "USER" | "LOCAL ADMIN" | "DBA" | "GUEST" | "DB";

export type CredentialRow = {
  id: string;
  username: string;
  secret: string;
  credType: CredType;
  domain: string;
  host: string;
  source: string;
  foundDate: string;
  reuseCount: number;
  active: boolean;
  tag: CredTag;
};

export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type CompanyStatus = "recon" | "active" | "compromised" | "completed";

export type Company = {
  id: string;
  name: string;
  whiteIp: string;
  vpnLogin: string;
  vpnPassword: string;
  budget: number;
  szi: string[];
  savz: string[];
  notes: string;
  domain: string;
  industry: string;
  employeeCount: number;
  riskLevel: RiskLevel;
  status: CompanyStatus;
  hostsDiscovered: number;
  credsFound: number;
  vulnsFound: number;
  entryPoints: number;
  highValueTargets: number;
  attackPaths: number;
  progress: number;
  startDate: string;
};

