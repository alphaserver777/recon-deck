"use client";

import {
  Search,
  Bell,
  User,
  EllipsisVertical,
  Server,
  Crown,
  DoorOpen,
  KeyRound,
  ShieldAlert,
  Spline,
} from "lucide-react";
import { useCompany } from "@/lib/company-context";

export function TopBar() {
  const { selected } = useCompany();

  const dayCounter = selected
    ? `D+${String(Math.max(0, Math.floor((Date.now() - new Date(selected.startDate).getTime()) / 86400000))).padStart(2, "0")}`
    : "—";

  const stats = selected
    ? [
        { key: "hosts", label: "ХОСТЫ", value: selected.hostsDiscovered, icon: Server, color: "var(--accent)" },
        { key: "high", label: "ВЫСОКАЯ ЦЕННОСТЬ", value: selected.highValueTargets, icon: Crown, color: "var(--risk-high)" },
        { key: "entry", label: "ТОЧКИ ВХОДА", value: selected.entryPoints, icon: DoorOpen, color: "var(--risk-low)" },
        { key: "creds", label: "УЧЕТНЫЕ ДАННЫЕ", value: selected.credsFound, icon: KeyRound, color: "var(--risk-med)" },
        { key: "vulns", label: "УЯЗВИМОСТИ", value: selected.vulnsFound, icon: ShieldAlert, color: "var(--risk-crit)" },
        { key: "pivots", label: "ПУТИ АТАКИ", value: selected.attackPaths, icon: Spline, color: "var(--accent)" },
      ]
    : [
        { key: "hosts", label: "ХОСТЫ", value: "—", icon: Server, color: "var(--fg-subtle)" },
        { key: "high", label: "ВЫСОКАЯ ЦЕННОСТЬ", value: "—", icon: Crown, color: "var(--fg-subtle)" },
        { key: "entry", label: "ТОЧКИ ВХОДА", value: "—", icon: DoorOpen, color: "var(--fg-subtle)" },
        { key: "creds", label: "УЧЕТНЫЕ ДАННЫЕ", value: "—", icon: KeyRound, color: "var(--fg-subtle)" },
        { key: "vulns", label: "УЯЗВИМОСТИ", value: "—", icon: ShieldAlert, color: "var(--fg-subtle)" },
        { key: "pivots", label: "ПУТИ АТАКИ", value: "—", icon: Spline, color: "var(--fg-subtle)" },
      ];

  return (
    <header
      className="flex shrink-0 items-center gap-6 px-5"
      style={{
        height: 64,
        background: "var(--bg-1)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Operation context */}
      <div className="flex flex-col leading-tight" style={{ minWidth: 180 }}>
        <span
          className="mono font-semibold"
          style={{ fontSize: 13, color: "var(--fg)", letterSpacing: "0.04em" }}
        >
          ОПЕРАЦИЯ:{" "}
          <span style={{ color: selected ? "var(--accent)" : "var(--fg-subtle)" }}>
            {selected?.name ?? "—"}
          </span>
        </span>
        <span
          className="mono"
          style={{ fontSize: 10.5, color: "var(--fg-subtle)", letterSpacing: "0.08em" }}
        >
          {selected ? `${selected.domain} · ${dayCounter}` : "НЕТ АКТИВНОЙ ЦЕЛИ"}
        </span>
      </div>

      {/* Stat counters */}
      <div className="flex flex-1 items-center gap-1.5 overflow-x-auto">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.key}
              className="flex items-center gap-2.5"
              style={{
                padding: "6px 12px",
                borderRadius: 7,
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
              }}
            >
              <Icon size={16} style={{ color: s.color, flexShrink: 0 }} />
              <div className="leading-none">
                <div
                  className="mono font-semibold"
                  style={{ fontSize: 15, color: selected ? "var(--fg)" : "var(--fg-subtle)" }}
                >
                  {s.value}
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 8.5,
                    letterSpacing: "0.1em",
                    color: "var(--fg-subtle)",
                    marginTop: 2,
                  }}
                >
                  {s.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-1">
        <IconButton ariaLabel="Search"><Search size={16} /></IconButton>
        <IconButton ariaLabel="Alerts"><Bell size={16} /></IconButton>
        <IconButton ariaLabel="Account"><User size={16} /></IconButton>
        <IconButton ariaLabel="More"><EllipsisVertical size={16} /></IconButton>
      </div>
    </header>
  );
}

function IconButton({ children, ariaLabel }: { children: React.ReactNode; ariaLabel: string }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={`${ariaLabel} (в разработке)`}
      className="grid place-items-center"
      style={{
        width: 34, height: 34, borderRadius: 7,
        background: "transparent", border: "1px solid transparent",
        color: "var(--fg-muted)", cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
