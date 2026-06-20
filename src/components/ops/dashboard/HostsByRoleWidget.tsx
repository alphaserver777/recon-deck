import { WidgetCard } from "./WidgetCard";
import { DonutChart, DonutLegend } from "./DonutChart";
import { HOSTS_BY_ROLE } from "@/lib/mock-data";

export function HostsByRoleWidget() {
  return (
    <WidgetCard title="HOSTS BY ROLE" gridArea="role">
      <div className="flex items-center gap-4">
        <DonutChart segments={HOSTS_BY_ROLE} size={110} />
        <DonutLegend segments={HOSTS_BY_ROLE} />
      </div>
    </WidgetCard>
  );
}
