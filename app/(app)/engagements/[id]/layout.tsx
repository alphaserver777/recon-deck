import { notFound } from "next/navigation";
import {
  db,
  getById,
  listCreds,
  listFindings,
  getNetworkIntel,
} from "@/lib/db";
import { OpsNav } from "@/components/ops/OpsNav";
import { TopBar } from "@/components/ops/TopBar";
import { EngagementProvider, type EngagementCtx } from "@/lib/engagement-context";
import type { CompanyStatus } from "@/lib/ops-views/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export default async function EngagementLayout({ params, children }: Props) {
  const { id } = await params;
  const engagementId = Number(id);
  if (!Number.isInteger(engagementId) || engagementId < 1) notFound();

  const eng = getById(db, engagementId);
  if (!eng) notFound();

  const intel = getNetworkIntel(db, engagementId);
  const creds = listCreds(db, engagementId);
  const findings = listFindings(db, engagementId);

  const hostCount = eng.hosts.length;
  const highValueCount = eng.hosts.filter(
    (h) => h.priority >= 2 || findings.some((f) => f.severity === "critical" || f.severity === "high"),
  ).length;

  const entryPorts = new Set([21, 22, 80, 443, 445, 3389, 8080, 8443]);
  let entryPointCount = 0;
  for (const p of eng.ports) {
    if (entryPorts.has(p.port)) entryPointCount++;
  }

  const ctx: EngagementCtx = {
    id: engagementId,
    name: intel.organization || eng.name,
    domain: intel.domain,
    vpnIp: eng.vpn_ip ?? null,
    status: (intel.op_status as CompanyStatus) || "recon",
    progress: intel.progress,
    startDate: eng.created_at,
    hostCount,
    highValueCount,
    entryPointCount,
    credCount: creds.length,
    vulnCount: findings.length,
    attackPathCount: 0,
  };

  return (
    <EngagementProvider value={ctx}>
      <div className="flex h-screen w-full overflow-hidden">
        <OpsNav />
        <div className="flex flex-1 flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto" style={{ background: "var(--bg-0)" }}>
            {children}
          </main>
        </div>
      </div>
    </EngagementProvider>
  );
}
