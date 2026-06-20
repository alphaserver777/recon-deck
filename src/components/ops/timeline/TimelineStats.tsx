import { TIMELINE_STATUS_COLORS } from "@/lib/mock-data";
import { CircleCheck, KeyRound, XCircle, Info } from "lucide-react";

type Stats = {
  total: number;
  success: number;
  creds: number;
  errors: number;
  info: number;
};

export function TimelineStats({ stats }: { stats: Stats }) {
  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 8,
      }}
    >
      <div
        className="mono"
        style={{
          padding: "10px 14px",
          fontSize: 10.5,
          letterSpacing: "0.14em",
          color: "var(--fg-subtle)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        TIMELINE STATS
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
          padding: "10px 12px",
        }}
      >
        {/* Commands - spans full width */}
        <StatCell
          icon={<div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />}
          label="COMMANDS"
          value={stats.total}
          color="var(--accent)"
        />
        <StatCell
          icon={<CircleCheck size={14} />}
          label="SUCCESS"
          value={stats.success}
          color={TIMELINE_STATUS_COLORS.SUCCESS}
        />
        <StatCell
          icon={<KeyRound size={14} />}
          label="CREDENTIALS"
          value={stats.creds}
          color={TIMELINE_STATUS_COLORS.CREDENTIALS}
        />
        <StatCell
          icon={<XCircle size={14} />}
          label="ERRORS"
          value={stats.errors}
          color={TIMELINE_STATUS_COLORS.ERROR}
        />
        <StatCell
          icon={<Info size={14} />}
          label="INFO"
          value={stats.info}
          color={TIMELINE_STATUS_COLORS.INFO}
          colSpan
        />
      </div>
    </div>
  );
}

function StatCell({
  icon,
  label,
  value,
  color,
  colSpan,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  colSpan?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2"
      style={{
        padding: "8px 10px",
        borderRadius: 4,
        ...(colSpan ? { gridColumn: "1 / -1" } : {}),
      }}
    >
      <span style={{ color, flexShrink: 0 }}>{icon}</span>
      <div>
        <div
          className="mono"
          style={{ fontSize: 9, color: "var(--fg-subtle)", letterSpacing: "0.1em" }}
        >
          {label}
        </div>
        <div className="mono font-bold" style={{ fontSize: 18, color, lineHeight: 1.2 }}>
          {value}
        </div>
      </div>
    </div>
  );
}
