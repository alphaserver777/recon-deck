import type { ChartSegment } from "@/lib/mock-data";

const R = 40;
const STROKE = 12;
const C = 2 * Math.PI * R;

export function DonutChart({
  segments,
  size = 120,
  centerLabel,
  centerSub,
}: {
  segments: ChartSegment[];
  size?: number;
  centerLabel?: string;
  centerSub?: string;
}) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  let offset = 0;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      {segments.map((seg) => {
        const pct = total > 0 ? seg.value / total : 0;
        const dash = pct * C;
        const gap = C - dash;
        const cur = offset;
        offset += dash;
        return (
          <circle
            key={seg.label}
            cx={50}
            cy={50}
            r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth={STROKE}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-cur}
            strokeLinecap="butt"
            transform="rotate(-90 50 50)"
          />
        );
      })}
      {/* background ring */}
      <circle
        cx={50}
        cy={50}
        r={R}
        fill="none"
        stroke="var(--bg-3)"
        strokeWidth={STROKE}
        style={{ opacity: 0.3 }}
      />
      {centerLabel && (
        <text
          x={50}
          y={centerSub ? 47 : 50}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--fg)"
          fontSize={18}
          fontWeight={700}
          fontFamily="var(--font-mono)"
        >
          {centerLabel}
        </text>
      )}
      {centerSub && (
        <text
          x={50}
          y={60}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--fg-subtle)"
          fontSize={7}
          fontFamily="var(--font-mono)"
          letterSpacing="0.1em"
        >
          {centerSub}
        </text>
      )}
    </svg>
  );
}

export function DonutLegend({ segments }: { segments: ChartSegment[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {segments.map((s) => (
        <div key={s.label} className="flex items-center gap-2" style={{ fontSize: 11 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: s.color,
              flexShrink: 0,
            }}
          />
          <span style={{ color: "var(--fg-muted)", flex: 1 }}>{s.label}</span>
          <span className="mono" style={{ color: "var(--fg)" }}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}
