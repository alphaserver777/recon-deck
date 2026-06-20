import { WidgetCard } from "./WidgetCard";
import { MOCK_PIVOT_PATHS } from "@/lib/mock-data";

export function PivotPathsWidget() {
  return (
    <WidgetCard title="PIVOT PATHS" gridArea="pivot">
      <div className="flex flex-col gap-4">
        {MOCK_PIVOT_PATHS.map((p) => {
          const barColor =
            p.probability >= 70
              ? "var(--accent)"
              : p.probability >= 50
                ? "var(--risk-med)"
                : "var(--risk-high)";
          return (
            <div key={p.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="mono"
                  style={{ fontSize: 9.5, color: "var(--fg-subtle)", letterSpacing: "0.1em" }}
                >
                  PATH #{p.id}
                </span>
                <span className="mono" style={{ fontSize: 9.5, color: "var(--fg-subtle)" }}>
                  PROBABILITY
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Node chain */}
                <div className="flex items-center gap-1 flex-1">
                  {p.nodes.map((node, i) => (
                    <div key={node} className="flex items-center gap-1">
                      <span
                        className="mono"
                        style={{
                          padding: "3px 8px",
                          borderRadius: 5,
                          background: "var(--bg-3)",
                          border: "1px solid var(--border)",
                          fontSize: 10,
                          fontWeight: 600,
                          color: "var(--fg)",
                        }}
                      >
                        {node}
                      </span>
                      {i < p.nodes.length - 1 && (
                        <span style={{ color: "var(--fg-subtle)", fontSize: 11 }}>→</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Probability */}
                <span
                  className="mono font-bold"
                  style={{ fontSize: 16, color: barColor, width: 42, textAlign: "right" }}
                >
                  {p.probability}%
                </span>
              </div>

              {/* Bar */}
              <div
                style={{
                  marginTop: 5,
                  width: "100%",
                  height: 4,
                  background: "var(--bg-3)",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${p.probability}%`,
                    height: "100%",
                    background: barColor,
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
