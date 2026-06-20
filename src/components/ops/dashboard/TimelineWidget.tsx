import { WidgetCard } from "./WidgetCard";
import { MOCK_TIMELINE } from "@/lib/mock-data";

export function TimelineWidget() {
  return (
    <WidgetCard
      title="TIMELINE"
      gridArea="timeline"
      actions={
        <span
          className="mono"
          style={{
            padding: "2px 8px",
            borderRadius: 4,
            border: "1px solid var(--border)",
            background: "var(--bg-3)",
            fontSize: 9,
            color: "var(--fg-subtle)",
          }}
        >
          SHOW: ALL ▾
        </span>
      }
    >
      <div className="flex flex-col gap-2.5">
        {MOCK_TIMELINE.map((ev, i) => {
          const [title, sub] = ev.label.split("\n");
          return (
            <div key={i} className="flex items-start gap-2.5">
              <span
                className="mono"
                style={{ fontSize: 10, color: "var(--fg-subtle)", width: 50, flexShrink: 0, marginTop: 2 }}
              >
                {ev.time}
              </span>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 99,
                  background: ev.color,
                  marginTop: 4,
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, color: "var(--fg)", fontWeight: 500 }}>{title}</div>
                {sub && (
                  <div className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)", marginTop: 1 }}>
                    {sub}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
