import { notFound } from "next/navigation";
import {
  db,
  getById,
  listCreds,
  listFindings,
  listDefenses,
  getNetworkIntel,
} from "@/lib/db";
import { toCompanyView } from "@/lib/ops-views/company-vm";
import { CompanyClient } from "./client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyPage({ params }: PageProps) {
  const { id } = await params;
  const engagementId = Number(id);
  if (!Number.isInteger(engagementId) || engagementId < 1) notFound();

  const eng = getById(db, engagementId);
  if (!eng) notFound();

  const intel = getNetworkIntel(db, engagementId);
  const defenses = listDefenses(db, engagementId);
  const creds = listCreds(db, engagementId);
  const findings = listFindings(db, engagementId);

  const highValueCount = eng.hosts.filter((h) => h.priority >= 2).length;
  const entryPorts = new Set([21, 22, 80, 443, 445, 3389, 8080, 8443]);
  let portCount = 0;
  for (const p of eng.ports) if (entryPorts.has(p.port)) portCount++;

  const defenseMapped = defenses.map((d) => ({
    id: d.id,
    category: d.category,
    product: d.product,
    detail: d.detail,
  }));

  const company = toCompanyView(
    engagementId,
    eng.name,
    eng.created_at,
    eng.vpn_ip ?? null,
    intel,
    defenseMapped,
    eng.hosts.length,
    creds.length,
    findings.length,
    portCount,
    highValueCount,
  );

  return <CompanyClient company={company} />;
}
