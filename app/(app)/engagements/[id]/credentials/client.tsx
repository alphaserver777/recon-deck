"use client";

import { useState, useMemo } from "react";
import { KeyRound } from "lucide-react";
import type { CredentialRow } from "@/lib/ops-views/types";

const TAG_COLORS: Record<string, string> = {
  DA: "var(--risk-crit)",
  KRBTGT: "var(--risk-crit)",
  SERVICE: "var(--risk-high)",
  DBA: "var(--risk-high)",
  "LOCAL ADMIN": "var(--risk-med)",
  USER: "var(--accent)",
  GUEST: "var(--fg-subtle)",
  DB: "var(--risk-med)",
};

export function CredentialsClient({ rows }: { rows: CredentialRow[] }) {
  const [search, setSearch] = useState("");
  const [showSecrets, setShowSecrets] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.username.toLowerCase().includes(q) ||
        r.host.toLowerCase().includes(q) ||
        r.domain.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const stats = useMemo(() => {
    const types = new Map<string, number>();
    for (const r of rows) types.set(r.credType, (types.get(r.credType) ?? 0) + 1);
    return { total: rows.length, active: rows.filter((r) => r.active).length, types };
  }, [rows]);

  return (
    <div style={{ padding: 16, height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-2" style={{ color: "var(--accent)" }}>
          <KeyRound size={18} />
          <span className="mono" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}>
            УЧЕТНЫЕ ДАННЫЕ
          </span>
        </div>
        <div className="flex gap-3 mono" style={{ fontSize: 11, color: "var(--fg-muted)", marginLeft: 12 }}>
          <span>Всего: <b style={{ color: "var(--fg)" }}>{stats.total}</b></span>
          <span>Активных: <b style={{ color: "#22c55e" }}>{stats.active}</b></span>
          {[...stats.types.entries()].map(([type, count]) => (
            <span key={type}>{type}: <b style={{ color: "var(--fg)" }}>{count}</b></span>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowSecrets(!showSecrets)}
            className="mono"
            style={{
              fontSize: 10, padding: "5px 10px", borderRadius: 4,
              background: showSecrets ? "var(--risk-crit)" : "var(--bg-3)",
              border: "1px solid var(--border)",
              color: showSecrets ? "#fff" : "var(--fg-muted)",
              cursor: "pointer", letterSpacing: "0.06em",
            }}
          >
            {showSecrets ? "СКРЫТЬ" : "ПОКАЗАТЬ"} СЕКРЕТЫ
          </button>
          <input
            className="mono"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "5px 10px", width: 180,
              background: "var(--bg-2)", border: "1px solid var(--border)",
              borderRadius: 4, color: "var(--fg)", fontSize: 11, outline: "none",
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto" style={{ borderRadius: 8, border: "1px solid var(--border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-2)", position: "sticky", top: 0, zIndex: 2 }}>
              {["TAG", "USERNAME", "SECRET", "TYPE", "DOMAIN", "HOST", "SOURCE", "DATE"].map((h) => (
                <th key={h} className="mono" style={{
                  fontSize: 9, letterSpacing: "0.14em", color: "var(--fg-subtle)",
                  padding: "10px 10px", textAlign: "left", borderBottom: "1px solid var(--border)", fontWeight: 600,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "7px 10px" }}>
                  <span className="mono" style={{
                    fontSize: 8.5, fontWeight: 700, padding: "2px 5px", borderRadius: 3,
                    color: TAG_COLORS[r.tag] || "var(--fg-subtle)",
                    background: `${TAG_COLORS[r.tag] || "var(--fg-subtle)"}1a`,
                    border: `1px solid ${TAG_COLORS[r.tag] || "var(--fg-subtle)"}33`,
                    letterSpacing: "0.06em",
                  }}>
                    {r.tag}
                  </span>
                </td>
                <td className="mono" style={{ padding: "7px 10px", fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>{r.username}</td>
                <td className="mono" style={{ padding: "7px 10px", fontSize: 11, color: showSecrets ? "#22c55e" : "var(--fg-subtle)", letterSpacing: showSecrets ? 0 : 1.5 }}>
                  {showSecrets ? r.secret : "••••••••"}
                </td>
                <td className="mono" style={{ padding: "7px 10px", fontSize: 10, color: "var(--fg-muted)" }}>{r.credType}</td>
                <td className="mono" style={{ padding: "7px 10px", fontSize: 10, color: "var(--fg-subtle)" }}>{r.domain}</td>
                <td className="mono" style={{ padding: "7px 10px", fontSize: 11, color: "var(--fg-muted)" }}>{r.host}</td>
                <td className="mono" style={{ padding: "7px 10px", fontSize: 10, color: "var(--fg-subtle)" }}>{r.source}</td>
                <td className="mono" style={{ padding: "7px 10px", fontSize: 10, color: "var(--fg-subtle)" }}>
                  {r.foundDate ? new Date(r.foundDate).toLocaleDateString("ru-RU") : "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--fg-subtle)" }}>Нет учётных данных</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
