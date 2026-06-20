import { MapRoleIcon } from "./MapRoleIcon";
import type { MapHostFull } from "@/lib/ops-views/types";
import { MAP_ROLE_COLORS, MAP_ROLE_LABELS, mapRiskColor } from "@/lib/ops-views/types";

const SEV_COLORS: Record<string, string> = {
  crit: "var(--risk-crit)",
  high: "var(--risk-high)",
  med: "var(--risk-med)",
  low: "var(--risk-low)",
};

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  recon: { background: "#16222e", color: "var(--fg-subtle)" },
  active: { background: "var(--accent)", color: "#04121b" },
  owned: { background: "#b06bff", color: "#150a24" },
  dismissed: { background: "#1b2530", color: "#4a5d6c" },
};

export function IntelPanel({ host }: { host: MapHostFull | null }) {
  if (!host) {
    return (
      <div
        style={{
          borderLeft: "1px solid var(--border)",
          background: "var(--bg-1)",
          padding: 14,
          overflow: "auto",
        }}
      >
        <div
          className="mono"
          style={{
            color: "var(--fg-subtle)",
            textAlign: "center",
            marginTop: 60,
            lineHeight: 1.7,
            fontSize: 11,
            letterSpacing: "0.1em",
          }}
        >
          SELECT A HOST
          <br />
          TO VIEW INTEL
        </div>
      </div>
    );
  }

  const roleColor = MAP_ROLE_COLORS[host.role];
  const rc = mapRiskColor(host.riskScore);

  return (
    <div
      style={{
        borderLeft: "1px solid var(--border)",
        background: "var(--bg-1)",
        padding: 14,
        overflow: "auto",
      }}
    >
      {/* Host header */}
      <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            background: roleColor,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <MapRoleIcon role={host.role} size={18} />
        </div>
        <div>
          <h2 className="mono" style={{ margin: 0, fontSize: 16, color: "#fff", fontWeight: 700 }}>
            {host.ip}
          </h2>
          <div className="mono" style={{ fontSize: 11, color: "var(--accent)" }}>
            {host.hostname} · {MAP_ROLE_LABELS[host.role]}
          </div>
        </div>
      </div>

      {/* OS line */}
      <div
        className="mono flex items-center gap-1.5"
        style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 10 }}
      >
        <span>{host.osIcon}</span> {host.os}
      </div>

      {/* Status + Risk */}
      <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
        <span
          className="mono"
          style={{
            fontSize: 9,
            letterSpacing: "0.08em",
            padding: "2px 8px",
            borderRadius: 3,
            textTransform: "uppercase",
            fontWeight: 700,
            ...STATUS_STYLES[host.opStatus],
          }}
        >
          {host.opStatus}
        </span>
        <span
          className="mono"
          style={{ fontSize: 11, fontWeight: 700, color: rc, letterSpacing: "0.08em" }}
        >
          RISK: {host.riskScore}
        </span>
        {host.priority > 0 && (
          <span style={{ fontSize: 11, color: "var(--risk-high)" }}>
            {"★".repeat(host.priority)}
          </span>
        )}
      </div>

      {/* Section: Severity Counts */}
      <SectionTitle>SEVERITY</SectionTitle>
      <div className="flex gap-2" style={{ marginBottom: 10 }}>
        {(["crit", "high", "med", "low"] as const).map((sev) => (
          <div
            key={sev}
            className="mono"
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 10,
              fontWeight: 700,
              padding: "4px 0",
              borderRadius: 2,
              background: host.counts[sev] > 0 ? SEV_COLORS[sev] : "#16222e",
              color: host.counts[sev] > 0 ? "#0a0e14" : "#3a566b",
            }}
          >
            {host.counts[sev]}
          </div>
        ))}
      </div>

      {/* Section: Ports */}
      <SectionTitle>PORTS ({host.ports.length})</SectionTitle>
      <div className="flex flex-wrap gap-1" style={{ marginBottom: 10 }}>
        {host.ports.map((p) => (
          <span
            key={p}
            className="mono"
            style={{
              fontSize: 10,
              background: "var(--bg-3)",
              border: "1px solid var(--border)",
              borderRadius: 3,
              padding: "1px 6px",
              color: "var(--fg-muted)",
            }}
          >
            {p}
          </span>
        ))}
      </div>

      {/* Section: Notes */}
      {host.notes && (
        <>
          <SectionTitle>NOTES</SectionTitle>
          <div
            style={{
              fontSize: 11,
              color: "var(--fg-muted)",
              lineHeight: 1.5,
              padding: "6px 10px",
              background: "var(--bg-2)",
              borderLeft: "3px solid var(--accent-dim)",
              borderRadius: "0 4px 4px 0",
            }}
          >
            {host.notes}
          </div>
        </>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mono"
      style={{
        letterSpacing: "0.14em",
        fontSize: 10,
        color: "var(--fg-subtle)",
        borderBottom: "1px solid var(--border)",
        paddingBottom: 4,
        margin: "14px 0 8px",
      }}
    >
      {children}
    </div>
  );
}
