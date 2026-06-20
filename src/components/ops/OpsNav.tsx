"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bug } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { useNavFilter } from "@/lib/nav-filter-context";
import { useCompany } from "@/lib/company-context";
import { COMPANY_STATUS_COLORS, COMPANY_STATUS_LABELS } from "@/lib/company-data";

const NAV_WIDTH = 230;

export function OpsNav() {
  const pathname = usePathname();
  const { content: filterContent } = useNavFilter();
  const { selected } = useCompany();

  const statusColor = selected ? COMPANY_STATUS_COLORS[selected.status] : "var(--fg-subtle)";
  const statusLabel = selected ? COMPANY_STATUS_LABELS[selected.status] : "—";
  const objective = selected
    ? selected.status === "active" ? "DOMAIN DOMINANCE"
      : selected.status === "recon" ? "RECONNAISSANCE"
      : selected.status === "completed" ? "COMPLETED"
      : "IN PROGRESS"
    : "—";

  return (
    <aside
      className="flex h-screen shrink-0 flex-col"
      style={{
        width: NAV_WIDTH,
        background: "var(--bg-1)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-2.5 px-4"
        style={{ height: 64, borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="grid place-items-center"
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: "var(--accent-soft)",
            border: "1px solid var(--border-cyan)",
            color: "var(--accent)",
          }}
        >
          <Bug size={18} />
        </div>
        <div className="leading-tight">
          <div
            className="font-semibold"
            style={{ fontSize: 13, letterSpacing: "0.04em", color: "var(--fg)" }}
          >
            RED TEAM OPS
          </div>
          <div
            className="mono"
            style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "var(--fg-subtle)" }}
          >
            ADVERSARY VIEW
          </div>
        </div>
      </div>

      {/* Nav list */}
      <nav className={filterContent ? "shrink-0 px-2.5 py-3" : "flex-1 overflow-y-auto px-2.5 py-3"}>
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3"
                  style={{
                    padding: "8px 10px",
                    borderRadius: 6,
                    borderLeft: `2px solid ${active ? "var(--accent)" : "transparent"}`,
                    background: active ? "var(--bg-3)" : "transparent",
                    color: active ? "var(--accent)" : "var(--fg-muted)",
                    fontSize: 12.5,
                    fontWeight: active ? 600 : 500,
                    textDecoration: "none",
                  }}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Page-specific filter slot */}
      {filterContent && (
        <div className="flex-1 overflow-y-auto px-2.5" style={{ borderTop: "1px solid var(--border)" }}>
          {filterContent}
        </div>
      )}

      {/* Operation status card */}
      <div className="px-2.5 pb-3 shrink-0">
        <div
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "12px 12px 14px",
          }}
        >
          <div
            className="mono"
            style={{ fontSize: 9.5, letterSpacing: "0.16em", color: "var(--fg-subtle)" }}
          >
            OPERATION STATUS
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 99,
                background: statusColor,
                boxShadow: `0 0 8px ${statusColor}`,
              }}
            />
            <span
              className="font-semibold"
              style={{ fontSize: 11.5, color: statusColor, letterSpacing: "0.04em" }}
            >
              {statusLabel}
            </span>
          </div>

          <StatusRow label="TEAM" value="RED TEAM ALPHA" />
          <StatusRow label="OBJECTIVE" value={objective} />

          <div className="mt-3">
            <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
              <span
                className="mono"
                style={{ fontSize: 9.5, letterSpacing: "0.14em", color: "var(--fg-subtle)" }}
              >
                PROGRESS
              </span>
              <span
                className="mono"
                style={{ fontSize: 10.5, color: "var(--fg-muted)" }}
              >
                {selected?.progress ?? 0}%
              </span>
            </div>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 4,
                background: "var(--bg-3)",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${selected?.progress ?? 0}%`,
                  background: statusColor,
                  borderRadius: 99,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2.5">
      <div
        className="mono"
        style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--fg-subtle)" }}
      >
        {label}
      </div>
      <div
        className="font-medium"
        style={{ fontSize: 11.5, color: "var(--fg)", marginTop: 1 }}
      >
        {value}
      </div>
    </div>
  );
}
