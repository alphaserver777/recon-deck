"use client";

import { useState, useMemo } from "react";
import type { HostTableRow } from "@/lib/ops-views/types";

function scoreColor(s: number): string {
  if (s >= 80) return "var(--risk-crit)";
  if (s >= 50) return "var(--risk-high)";
  if (s >= 20) return "var(--risk-med)";
  return "var(--risk-low)";
}

export function HostsClient({ rows }: { rows: HostTableRow[] }) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(rows[0]?.id ?? null);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.hostname.toLowerCase().includes(q) ||
        r.ip.includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.os.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="flex h-full" style={{ minHeight: 0 }}>
      <div className="flex-1 flex flex-col overflow-hidden" style={{ padding: 16 }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
          <input
            className="mono"
            placeholder="Поиск хостов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--fg)",
              fontSize: 12,
              outline: "none",
            }}
          />
          <span className="mono" style={{ fontSize: 11, color: "var(--fg-subtle)" }}>
            {filtered.length} / {rows.length}
          </span>
        </div>

        <div className="flex-1 overflow-auto" style={{ borderRadius: 8, border: "1px solid var(--border)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-2)", position: "sticky", top: 0, zIndex: 2 }}>
                {["HOSTNAME", "IP", "ROLE", "OS", "RISK", "STATUS", "SERVICES"].map((h) => (
                  <th
                    key={h}
                    className="mono"
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.14em",
                      color: "var(--fg-subtle)",
                      padding: "10px 12px",
                      textAlign: "left",
                      borderBottom: "1px solid var(--border)",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  style={{
                    cursor: "pointer",
                    background: r.id === selectedId ? "var(--bg-3)" : "transparent",
                    borderBottom: "1px solid var(--border)",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { if (r.id !== selectedId) e.currentTarget.style.background = "var(--bg-2)"; }}
                  onMouseLeave={(e) => { if (r.id !== selectedId) e.currentTarget.style.background = "transparent"; }}
                >
                  <td className="mono" style={{ padding: "8px 12px", fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>{r.hostname}</td>
                  <td className="mono" style={{ padding: "8px 12px", fontSize: 11.5, color: "var(--fg)" }}>{r.ip}</td>
                  <td className="mono" style={{ padding: "8px 12px", fontSize: 10.5, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{r.roleLabel}</td>
                  <td style={{ padding: "8px 12px", fontSize: 11, color: "var(--fg-muted)" }}>{r.os}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: scoreColor(r.riskScore) }}>{r.riskScore}</span>
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <span className="mono" style={{
                      fontSize: 9, padding: "2px 6px", borderRadius: 3,
                      background: r.status === "owned" ? "var(--risk-crit)" : r.status === "active" ? "var(--accent)" : "var(--bg-3)",
                      color: r.status === "owned" || r.status === "active" ? "#0a0e14" : "var(--fg-subtle)",
                      fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <div className="flex flex-wrap gap-1">
                      {r.services.slice(0, 4).map((s) => (
                        <span key={s} className="mono" style={{ fontSize: 9, padding: "1px 4px", background: "var(--bg-3)", borderRadius: 2, color: "var(--fg-subtle)" }}>{s}</span>
                      ))}
                      {r.services.length > 4 && <span className="mono" style={{ fontSize: 9, color: "var(--fg-subtle)" }}>+{r.services.length - 4}</span>}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--fg-subtle)" }}>Нет хостов</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <aside style={{
          width: 320,
          background: "var(--bg-1)",
          borderLeft: "1px solid var(--border)",
          padding: 16,
          overflow: "auto",
          flexShrink: 0,
        }}>
          <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>{selected.hostname}</div>
          <div className="mono" style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 8 }}>{selected.ip}</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>{selected.roleLabel}</div>

          <DetailSection label="OS">{selected.os}</DetailSection>
          <DetailSection label="SEGMENT">{selected.segment}</DetailSection>
          <DetailSection label="DOMAIN">{selected.domain || "—"}</DetailSection>

          <DetailSection label="RISK SCORE">
            <div className="flex items-center gap-2">
              <div style={{ flex: 1, height: 4, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(selected.riskScore, 100)}%`, height: "100%", background: scoreColor(selected.riskScore), borderRadius: 99 }} />
              </div>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: scoreColor(selected.riskScore) }}>{selected.riskScore}</span>
            </div>
          </DetailSection>

          {selected.vulns.length > 0 && (
            <DetailSection label={`VULNERABILITIES (${selected.vulns.length})`}>
              <div className="flex flex-col gap-1">
                {selected.vulns.map((v, i) => (
                  <div key={i} className="flex items-center gap-2" style={{ fontSize: 11 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: 99,
                      background: v.severity === "CRITICAL" ? "var(--risk-crit)" : v.severity === "HIGH" ? "var(--risk-high)" : v.severity === "MEDIUM" ? "var(--risk-med)" : "var(--risk-low)",
                      flexShrink: 0,
                    }} />
                    <span style={{ color: "var(--fg-muted)" }}>{v.name}</span>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {selected.creds.length > 0 && (
            <DetailSection label={`CREDENTIALS (${selected.creds.length})`}>
              <div className="flex flex-col gap-1">
                {selected.creds.map((c, i) => (
                  <div key={i} className="mono" style={{ fontSize: 11, color: "var(--fg-muted)" }}>
                    {c.username} <span style={{ color: "var(--fg-subtle)" }}>({c.type})</span>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {selected.notes && (
            <DetailSection label="NOTES">
              <div style={{ fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5, fontStyle: "italic" }}>{selected.notes}</div>
            </DetailSection>
          )}
        </aside>
      )}
    </div>
  );
}

function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: "0.12em", color: "var(--fg-subtle)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--fg)" }}>{children}</div>
    </div>
  );
}
