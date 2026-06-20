import { WidgetCard } from "./WidgetCard";
import { DonutChart, DonutLegend } from "./DonutChart";
import { OS_DISTRIBUTION } from "@/lib/mock-data";

export function OsDistWidget() {
  return (
    <WidgetCard title="OS DISTRIBUTION" gridArea="os">
      <div className="flex items-center gap-4">
        <DonutChart segments={OS_DISTRIBUTION} size={110} />
        <DonutLegend segments={OS_DISTRIBUTION} />
      </div>
    </WidgetCard>
  );
}
