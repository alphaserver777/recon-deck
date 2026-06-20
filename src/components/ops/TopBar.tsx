"use client";

import {
  Server,
  Crown,
  DoorOpen,
  KeyRound,
  ShieldAlert,
  Spline,
} from "lucide-react";
import { useEngagement } from "@/lib/engagement-context";

export function TopBar() {
  const eng = useEngagement();

  const dayCounter = `D+${String(
    Math.max(0, Math.floor((Date.now() - new Date(eng.startDate).getTime()) / 86400000)),
  ).padStart(2, "0")}`;

  const stats = [
    { key: "hosts", label: "ХОСТЫ", value: eng.hostCount, icon: Server, color: "var(--accent)" },
    { key: "high", label: "ВЫСОКАЯ ЦЕННОСТЬ", value: eng.highValueCount, icon: Crown, color: "var(--risk-high)" },
    { key: "entry", label: "ТОЧКИ ВХОДА", value: eng.entryPointCount, icon: DoorOpen, color: "var(--risk-low)" },
    { key: "creds", label: "УЧЕТНЫЕ ДАННЫЕ", value: eng.credCount, icon: KeyRound, color: "var(--risk-med)" },
    { key: "vulns", label: "УЯЗВИМОСТИ", value: eng.vulnCount, icon: ShieldAlert, color: "var(--risk-crit)" },
    { key: "pivots", label: "ПУТИ АТАКИ", value: eng.attackPathCount, icon: Spline, color: "var(--accent)" },
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
      <div className="flex flex-col leading-tight" style={{ minWidth: 180 }}>
        <span
          className="mono font-semibold"
          style={{ fontSize: 13, color: "var(--fg)", letterSpacing: "0.04em" }}
        >
          ОПЕРАЦИЯ:{" "}
          <span style={{ color: "var(--accent)" }}>{eng.name}</span>
        </span>
        <span
          className="mono"
          style={{ fontSize: 10.5, color: "var(--fg-subtle)", letterSpacing: "0.08em" }}
        >
          {eng.domain ? `${eng.domain} · ` : ""}{dayCounter}
        </span>
      </div>

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
                  style={{ fontSize: 15, color: "var(--fg)" }}
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
    </header>
  );
}
