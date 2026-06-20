import { Globe } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { MOCK_ENTRY_POINTS } from "@/lib/mock-data";

export function EntryPointsWidget() {
  return (
    <WidgetCard title="ENTRY POINTS" gridArea="entry">
      <div className="flex flex-col gap-3">
        {MOCK_ENTRY_POINTS.map((ep) => (
          <div key={ep.ip} className="flex items-center gap-2.5">
            <Globe size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <div className="mono font-semibold" style={{ fontSize: 12, color: "var(--fg)" }}>
                {ep.ip}
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)", marginTop: 1 }}>
                {ep.protocol}
                {ep.port > 0 && ` (${ep.port})`}
              </div>
            </div>
            <span
              className="mono"
              style={{
                padding: "2px 8px",
                borderRadius: 3,
                background: "rgba(242,72,79,0.12)",
                border: "1px solid var(--risk-crit)",
                color: "var(--risk-crit)",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              {ep.label}
            </span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
