import { Star, Server, Shield, Monitor, Globe, Cpu } from "lucide-react";
import type { TimelineLogEntry, MockHost, HostRole } from "@/lib/mock-data";
import { TIMELINE_STATUS_COLORS } from "@/lib/mock-data";

type Props = {
  entry: TimelineLogEntry;
  host: MockHost | undefined;
  onToggleStar: (id: number) => void;
};

const ROLE_ICONS: Record<HostRole, React.ReactNode> = {
  "domain-controller": <Shield size={16} />,
  server: <Server size={16} />,
  workstation: <Monitor size={16} />,
  "entry-point": <Globe size={16} />,
  iot: <Cpu size={16} />,
};

const STATUS_BG: Record<string, string> = {
  SUCCESS: "rgba(34,197,94,0.12)",
  CREDENTIALS: "rgba(255,122,24,0.12)",
  INFO: "rgba(59,130,246,0.12)",
  ERROR: "rgba(242,72,79,0.12)",
};

export function TimelineEntry({ entry, host, onToggleStar }: Props) {
  const dt = new Date(entry.ts);
  const time = dt.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const date = dt.toLocaleDateString("ru-RU");
  const statusColor = TIMELINE_STATUS_COLORS[entry.status];

  return (
    <div
      className="tl-row"
      style={{
        display: "grid",
        gridTemplateColumns: "26px 76px minmax(120px,0.7fr) 1fr 1fr 1fr 130px 110px",
        gap: 0,
        padding: "14px 0",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-2)",
        transition: "background 0.1s",
        position: "relative",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-3)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-2)")}
    >
      {/* Status dot with vertical line */}
      <div className="flex flex-col items-center" style={{ position: "relative" }}>
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            width: 1,
            background: "var(--border)",
            transform: "translateX(-50%)",
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: statusColor,
            boxShadow: `0 0 8px ${statusColor}80`,
            position: "relative",
            zIndex: 1,
            marginTop: 4,
            flexShrink: 0,
          }}
        />
      </div>

      {/* Timestamp */}
      <div className="mono" style={{ padding: "0 8px" }}>
        <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>{time}</div>
        <div style={{ fontSize: 9.5, color: "var(--fg-subtle)", marginTop: 2 }}>{date}</div>
      </div>

      {/* ЦЕЛЬ column */}
      <div style={{ padding: "0 10px", minWidth: 0 }}>
        <span
          className="mono"
          style={{
            fontSize: 9,
            color: "var(--fg-subtle)",
            letterSpacing: "0.1em",
            display: "block",
            marginBottom: 3,
          }}
        >
          ЦЕЛЬ
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--risk-med)",
            fontWeight: 600,
            lineHeight: 1.45,
            wordBreak: "break-word",
          }}
        >
          {entry.target}
        </span>
      </div>

      {/* IN column */}
      <div style={{ padding: "0 10px", minWidth: 0 }}>
        <span
          className="mono"
          style={{
            fontSize: 9,
            color: "var(--fg-subtle)",
            letterSpacing: "0.1em",
            display: "block",
            marginBottom: 3,
          }}
        >
          IN
        </span>
        <code
          className="mono"
          style={{
            fontSize: 11,
            color: "#2de26b",
            wordBreak: "break-all",
            lineHeight: 1.5,
          }}
        >
          {entry.command}
        </code>
      </div>

      {/* OUT column */}
      <div style={{ padding: "0 10px", minWidth: 0 }}>
        <span
          className="mono"
          style={{
            fontSize: 9,
            color: "var(--fg-subtle)",
            letterSpacing: "0.1em",
            display: "block",
            marginBottom: 3,
          }}
        >
          OUT
        </span>
        <code
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--fg-muted)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            lineHeight: 1.45,
          }}
        >
          {entry.output.length > 200 ? entry.output.slice(0, 200) + "..." : entry.output}
        </code>
      </div>

      {/* RESULT column */}
      <div style={{ padding: "0 10px", minWidth: 0 }}>
        <span
          className="mono"
          style={{
            fontSize: 9,
            color: "var(--fg-subtle)",
            letterSpacing: "0.1em",
            display: "block",
            marginBottom: 3,
          }}
        >
          RESULT
        </span>
        <span style={{ fontSize: 11.5, color: "var(--fg)", lineHeight: 1.5 }}>
          {entry.summary}
        </span>
      </div>

      {/* Host card */}
      <div style={{ padding: "0 6px" }}>
        <div
          className="flex items-center gap-2"
          style={{
            padding: "8px 10px",
            background: "var(--bg-3)",
            border: "1px solid var(--border)",
            borderRadius: 6,
          }}
        >
          <span style={{ color: "var(--fg-subtle)", flexShrink: 0 }}>
            {host ? ROLE_ICONS[host.role] : <Server size={16} />}
          </span>
          <div className="mono" style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "var(--fg)", fontWeight: 600 }}>
              {host?.hostname ?? "???"}
            </div>
            <div style={{ fontSize: 9, color: "var(--fg-subtle)" }}>
              {host?.ip ?? ""}
            </div>
          </div>
        </div>
      </div>

      {/* Status badge + star */}
      <div className="flex flex-col items-center gap-2" style={{ padding: "0 8px" }}>
        <span
          className="mono"
          style={{
            display: "inline-block",
            padding: "5px 12px",
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: statusColor,
            background: STATUS_BG[entry.status],
            border: `1px solid ${statusColor}33`,
            width: "100%",
            textAlign: "center",
          }}
        >
          {entry.status}
        </span>
        <button
          onClick={() => onToggleStar(entry.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            color: entry.starred ? "var(--risk-med)" : "var(--border)",
          }}
        >
          <Star size={13} fill={entry.starred ? "var(--risk-med)" : "none"} />
        </button>
      </div>
    </div>
  );
}
