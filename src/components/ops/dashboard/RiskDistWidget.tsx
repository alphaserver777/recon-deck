import { WidgetCard } from "./WidgetCard";
import { DonutChart, DonutLegend } from "./DonutChart";
import { RISK_DISTRIBUTION } from "@/lib/mock-data";

export function RiskDistWidget() {
  const total = RISK_DISTRIBUTION.reduce((s, d) => s + d.value, 0);
  return (
    <WidgetCard title="RISK SCORE DISTRIBUTION" gridArea="risk">
      <div className="flex items-center gap-4">
        <DonutChart
          segments={RISK_DISTRIBUTION}
          size={110}
          centerLabel={String(total)}
          centerSub="TOTAL"
        />
        <DonutLegend segments={RISK_DISTRIBUTION} />
      </div>
    </WidgetCard>
  );
}
