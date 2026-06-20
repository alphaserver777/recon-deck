import { MapRoleIcon } from "./MapRoleIcon";
import type { MapHostFull } from "@/lib/mock-data";
import { MAP_ROLE_COLORS, mapRiskColor, topSev } from "@/lib/mock-data";

const SEV_BORDER: Record<string, string> = {
  crit: "var(--risk-crit)",
  high: "var(--risk-high)",
  med: "var(--risk-med)",
  low: "var(--risk-low)",
  info: "var(--risk-info)",
};

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  recon: { background: "#16222e", color: "var(--fg-subtle)" },
  active: { background: "var(--accent)", color: "#04121b" },
  owned: { background: "#b06bff", color: "#150a24" },
  dismissed: { background: "#1b2530", color: "#4a5d6c" },
};

type Props = {
  host: MapHostFull;
  selected: boolean;
  onSelect: (host: MapHostFull) => void;
  blipRef: (el: HTMLDivElement | null) => void;
};

export function HostBlip({ host, selected, onSelect, blipRef }: Props) {
  const sev = topSev(host.counts);
  const sevColor = SEV_BORDER[sev];
  const roleColor = MAP_ROLE_COLORS[host.role];
  const rc = mapRiskColor(host.riskScore);
  const isDismissed = host.opStatus === "dismissed";
  const isOwned = host.opStatus === "owned";

  return (
    <div
      ref={blipRef}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(host)}
      style={{
        width: 152,
        border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
        borderBottom: `3px solid ${isOwned ? "#b06bff" : sevColor}`,
        borderRadius: 6,
        background: selected ? "#11212e" : "var(--bg-2)",
        padding: "12px 8px 10px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        transition: "all 0.15s",
        opacity: isDismissed ? 0.4 : 1,
        filter: isDismissed ? "grayscale(0.7)" : "none",
        boxShadow: selected ? "0 0 0 1px var(--accent), 0 0 22px rgba(34,211,238,0.3)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.background = "#11212e";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.5)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.transform = "";
          e.currentTarget.style.background = "var(--bg-2)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {/* Severity glow for crit/high */}
      {(sev === "crit" || sev === "high") && (
        <div
          style={{
            position: "absolute",
            right: -20,
            top: -20,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${sevColor}, transparent 70%)`,
            opacity: 0.35,
            animation: "pulse 1.4s infinite",
          }}
        />
      )}

      {/* Status chip */}
      <span
        className="mono"
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          fontSize: 8,
          letterSpacing: "0.08em",
          padding: "1px 5px",
          borderRadius: 2,
          textTransform: "uppercase",
          ...STATUS_STYLES[host.opStatus],
        }}
      >
        {host.opStatus}
      </span>

      {/* Hexagonal role icon */}
      <div
        style={{
          width: 50,
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          background: roleColor,
          color: "#fff",
          flexShrink: 0,
          marginBottom: 4,
          filter: `drop-shadow(0 0 6px ${roleColor})`,
        }}
      >
        <MapRoleIcon role={host.role} size={26} />
      </div>

      {/* Hostname */}
      <div
        className="mono"
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--accent)",
          letterSpacing: "0.5px",
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {host.hostname}
      </div>

      {/* IP */}
      <div
        className="mono"
        style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)" }}
      >
        {host.ip}
      </div>

      {/* OS */}
      <div
        className="mono flex items-center gap-1"
        style={{ fontSize: 9, color: "var(--fg-muted)", whiteSpace: "nowrap" }}
      >
        <span>{host.osIcon}</span> {host.os}
      </div>

      {/* Risk score */}
      <div
        className="mono"
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: rc,
          marginTop: 2,
        }}
      >
        RISK: {host.riskScore}
      </div>

      {/* Priority stars */}
      {host.priority > 0 && (
        <span
          style={{
            position: "absolute",
            bottom: 6,
            right: 7,
            fontSize: 9,
            color: "var(--risk-high)",
            letterSpacing: -1,
          }}
        >
          {"★".repeat(host.priority)}
        </span>
      )}
    </div>
  );
}
