import { notFound } from "next/navigation";
import { db, getById, listCreds, getNetworkIntel } from "@/lib/db";
import { toCredentialRow } from "@/lib/ops-views/credentials-vm";
import { CredentialsClient } from "./client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CredentialsPage({ params }: PageProps) {
  const { id } = await params;
  const engagementId = Number(id);
  if (!Number.isInteger(engagementId) || engagementId < 1) notFound();

  const eng = getById(db, engagementId);
  if (!eng) notFound();

  const intel = getNetworkIntel(db, engagementId);
  const creds = listCreds(db, engagementId);
  const domain = intel.domain || eng.name;

  const hostMap = new Map(eng.hosts.map((h) => [h.id, h]));
  const rows = creds.map((c) => {
    const host = hostMap.get(c.host_id);
    return toCredentialRow(c, host?.ip ?? "?", host?.hostname ?? null, domain);
  });

  return <CredentialsClient rows={rows} />;
}
