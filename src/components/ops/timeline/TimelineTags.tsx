import type { TimelineCategory } from "@/lib/ops-views/types";

type Props = {
  categories: TimelineCategory[];
  activeTags: Set<string>;
  onToggle: (tag: string) => void;
};

const TAG_COLORS: Record<TimelineCategory, string> = {
  recon: "#3b82f6",
  "lateral-movement": "#f2484f",
  credentials: "#ff7a18",
  "priv-esc": "#ffd400",
  domain: "#22d3ee",
  persistence: "#a855f7",
  exfil: "#ef4444",
  c2: "#6366f1",
};

export function TimelineTags({ categories, activeTags, onToggle }: Props) {
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
        TAGS
      </div>
      <div className="flex flex-wrap gap-2" style={{ padding: "12px 14px" }}>
        {categories.map((cat) => {
          const active = activeTags.has(cat);
          const color = TAG_COLORS[cat];
          return (
            <button
              key={cat}
              onClick={() => onToggle(cat)}
              className="mono"
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                fontSize: 9.5,
                letterSpacing: "0.08em",
                cursor: "pointer",
                border: `1px solid ${active ? color : "var(--border)"}`,
                background: active ? `${color}22` : "var(--bg-3)",
                color: active ? color : "var(--fg-subtle)",
                transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
