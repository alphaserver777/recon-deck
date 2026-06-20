import { WidgetCard } from "./WidgetCard";
import { MOCK_TOP_TARGETS, scoreColor } from "@/lib/mock-data";

export function TopTargetsWidget() {
  return (
    <WidgetCard title="TOP TARGETS" gridArea="targets">
      <div className="flex flex-col gap-2">
        {MOCK_TOP_TARGETS.map((t, i) => {
          const color = scoreColor(t.score);
          return (
            <div
              key={t.hostname}
              className="flex items-center gap-2"
              style={{ fontSize: 12 }}
            >
              <span
                className="mono font-semibold"
                style={{ width: 18, color: "var(--fg-subtle)", fontSize: 11 }}
              >
                {i + 1}.
              </span>
              <span
                className="mono font-semibold"
                style={{ flex: 1, color }}
              >
                {t.hostname}
              </span>
              <span
                className="mono font-bold"
                style={{ color, fontSize: 13 }}
              >
                {t.score}
              </span>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
