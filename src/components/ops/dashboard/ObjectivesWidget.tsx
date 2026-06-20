import { WidgetCard } from "./WidgetCard";
import { MOCK_OBJECTIVES } from "@/lib/mock-data";

export function ObjectivesWidget() {
  return (
    <WidgetCard title="OBJECTIVES" gridArea="obj">
      <div className="flex flex-col gap-2">
        {MOCK_OBJECTIVES.map((o) => (
          <label
            key={o.label}
            className="flex items-center gap-2.5"
            style={{ fontSize: 12, color: "var(--fg-muted)", cursor: "default" }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                border: `1.5px solid ${o.checked ? "var(--accent)" : "var(--border)"}`,
                background: o.checked ? "var(--accent-soft)" : "transparent",
                display: "inline-grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              {o.checked && (
                <svg width={9} height={9} viewBox="0 0 10 10">
                  <polyline
                    points="2,5 4.5,7.5 8,3"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span style={{ color: o.checked ? "var(--accent)" : "var(--fg-muted)" }}>
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </WidgetCard>
  );
}
