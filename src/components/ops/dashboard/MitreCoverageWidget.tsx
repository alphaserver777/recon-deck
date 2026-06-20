import { WidgetCard } from "./WidgetCard";
import { MOCK_MITRE } from "@/lib/mock-data";

function coverageColor(pct: number) {
  if (pct >= 80) return "var(--accent)";
  if (pct >= 50) return "var(--risk-med)";
  if (pct >= 20) return "var(--risk-high)";
  if (pct > 0) return "var(--risk-crit)";
  return "var(--fg-subtle)";
}

export function MitreCoverageWidget() {
  return (
    <WidgetCard
      title="MITRE ATT&CK COVERAGE"
      gridArea="mitre"
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
          RECON + POST-EXPLOITATION ▾
        </span>
      }
    >
      <div className="flex flex-col gap-2">
        {MOCK_MITRE.map((t) => {
          const color = coverageColor(t.coverage);
          return (
            <div key={t.id} className="flex items-center gap-2" style={{ fontSize: 11 }}>
              <span
                className="mono"
                style={{ width: 46, fontSize: 10, color: "var(--fg-subtle)", flexShrink: 0 }}
              >
                {t.id}
              </span>
              <span style={{ flex: 1, color: "var(--fg-muted)", minWidth: 0 }}>{t.name}</span>
              <span className="mono" style={{ width: 32, textAlign: "right", color, fontSize: 11, fontWeight: 600 }}>
                {t.coverage}%
              </span>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
