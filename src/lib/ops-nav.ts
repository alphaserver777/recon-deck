import {
  LayoutDashboard,
  Network,
  Server,
  KeyRound,
  ShieldAlert,
  Route,
  Crosshair,
  Clock,
  StickyNote,
  FileText,
  Settings,
  Crown,
  DoorOpen,
  Spline,
  FolderOpen,
  Building2,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "КОМПАНИЯ", href: "/company", icon: Building2 },
  { label: "ОБЗОР", href: "/dashboard", icon: LayoutDashboard },
  { label: "КАРТА СЕТИ", href: "/map", icon: Network },
  { label: "ХОСТЫ", href: "/hosts", icon: Server },
  { label: "УЧЕТНЫЕ ДАННЫЕ", href: "/credentials", icon: KeyRound },
  { label: "УЯЗВИМОСТИ", href: "/vulnerabilities", icon: ShieldAlert },
  { label: "ПУТИ АТАКИ", href: "/attack-paths", icon: Route },
  { label: "MITRE ATT&CK", href: "/mitre", icon: Crosshair },
  { label: "ХРОНОЛОГИЯ", href: "/timeline", icon: Clock },
  { label: "ФАЙЛЫ", href: "/files", icon: FolderOpen },
  { label: "ОТЧЕТЫ", href: "/reports", icon: FileText },
  { label: "ЗАМЕТКИ", href: "/notes", icon: StickyNote },
  { label: "НАСТРОЙКИ", href: "/settings", icon: Settings },
];

export type OpStat = {
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
};

export const MOCK_OP = {
  name: "CORP.LOCAL",
  date: "D+03 14:21:07",
  status: "IN PROGRESS",
  team: "RED TEAM ALPHA",
  objective: "DOMAIN DOMINANCE",
  progress: 62,
  stats: [
    { key: "hosts", label: "ХОСТЫ", value: 24, icon: Server, color: "var(--accent)" },
    { key: "high", label: "ВЫСОКАЯ ЦЕННОСТЬ", value: 6, icon: Crown, color: "var(--risk-high)" },
    { key: "entry", label: "ТОЧКИ ВХОДА", value: 3, icon: DoorOpen, color: "var(--risk-low)" },
    { key: "creds", label: "УЧЕТНЫЕ ДАННЫЕ", value: 17, icon: KeyRound, color: "var(--risk-med)" },
    { key: "vulns", label: "УЯЗВИМОСТИ", value: 8, icon: ShieldAlert, color: "var(--risk-crit)" },
    { key: "pivots", label: "ПУТИ АТАКИ", value: 4, icon: Spline, color: "var(--accent)" },
  ] satisfies OpStat[],
} as const;
