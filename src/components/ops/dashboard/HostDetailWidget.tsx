import { X } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { MOCK_SELECTED_HOST, scoreColor } from "@/lib/mock-data";

export function HostDetailWidget() {
  const h = MOCK_SELECTED_HOST;
  const color = scoreColor(h.riskScore);

  return (
    <WidgetCard
      title="HOST DETAILS"
      gridArea="host"
      actions={<X size={12} style={{ color: "var(--fg-subtle)", cursor: "pointer" }} />}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="grid place-items-center"
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "var(--accent-soft)",
            border: "1px solid var(--border-cyan)",
            color: "var(--accent)",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          DC
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="mono font-semibold" style={{ fontSize: 14, color: "var(--fg)" }}>
              {h.hostname}
            </span>
            <span
              className="mono"
              style={{
                padding: "1px 8px",
                borderRadius: 3,
                background: "rgba(242,72,79,0.15)",
                border: "1px solid var(--risk-crit)",
                color: "var(--risk-crit)",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              CRITICAL
            </span>
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 2 }}>
            {h.ip}
          </div>
        </div>
      </div>

      {/* Info rows */}
      <div className="flex flex-col gap-2" style={{ fontSize: 11.5 }}>
        <InfoRow label="ROLE" value="Domain Controller" />
        <InfoRow label="OS" value={h.os} />
        <InfoRow label="DOMAIN" value={h.domain} />
      </div>

      {/* Risk score bar */}
      <div className="mt-3">
        <div className="mono flex items-center justify-between" style={{ fontSize: 10, color: "var(--fg-subtle)", marginBottom: 5 }}>
          <span>RISK SCORE</span>
          <span style={{ color }}>{h.riskScore} / 100</span>
        </div>
        <div style={{ position: "relative", width: "100%", height: 6, background: "var(--bg-3)", borderRadius: 99 }}>
          <div style={{ position: "absolute", inset: 0, width: `${h.riskScore}%`, background: color, borderRadius: 99 }} />
        </div>
      </div>

      {/* Attack surface tags */}
      <div className="mt-4">
        <div className="mono" style={{ fontSize: 9.5, color: "var(--fg-subtle)", letterSpacing: "0.14em", marginBottom: 6 }}>
          ATTACK SURFACE
        </div>
        <div className="flex flex-wrap gap-1.5">
          {h.attackSurface.map((tag) => (
            <span
              key={tag}
              className="mono"
              style={{
                padding: "3px 8px",
                borderRadius: 4,
                background: "var(--bg-3)",
                border: "1px solid var(--border)",
                fontSize: 10,
                color: "var(--fg-muted)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Exposures */}
      <div className="mt-4">
        <div className="mono" style={{ fontSize: 9.5, color: "var(--fg-subtle)", letterSpacing: "0.14em", marginBottom: 6 }}>
          EXPOSURES
        </div>
        <div className="flex flex-col gap-1.5">
          {h.exposures.map((exp) => (
            <div key={exp} className="flex items-start gap-2" style={{ fontSize: 11 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--risk-crit)", marginTop: 4, flexShrink: 0 }} />
              <span style={{ color: "var(--fg-muted)" }}>{exp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* High-value users */}
      {h.highValueUsers.length > 0 && (
        <div className="mt-4">
          <div className="mono" style={{ fontSize: 9.5, color: "var(--fg-subtle)", letterSpacing: "0.14em", marginBottom: 6 }}>
            HIGH VALUE USERS
          </div>
          <div className="flex flex-col gap-1.5">
            {h.highValueUsers.map((u) => (
              <div key={u} className="flex items-center gap-2" style={{ fontSize: 11, color: "var(--fg-muted)" }}>
                <span style={{ fontSize: 12 }}>👤</span>
                <span>{u}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetCard>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="mono" style={{ width: 60, fontSize: 9.5, color: "var(--fg-subtle)", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ color: "var(--fg)" }}>{value}</span>
    </div>
  );
}
