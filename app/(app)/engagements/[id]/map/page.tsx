/**
 * Tactical map (fork) — network-wide "command view" for an engagement.
 *
 * RSC loader: assembles a per-host tactical view-model (role/sector/severity
 * from tactical.ts + operator creds/command-log/notes/priority/status) and
 * hands it to the client <TacticalMap>. All operator data is persisted in the
 * DB, so it survives AutoRecon re-imports.
 */

import { notFound } from "next/navigation";
import {
  db,
  getById,
  listFindings,
  listCreds,
  listCommandLog,
  getNetworkIntel,
  listDefenses,
} from "@/lib/db";
import {
  buildMapHost,
  sortMapHosts,
  normalizeSeverity,
  type MapHost,
  type MapDefense,
  type TacticalFinding,
} from "@/lib/tactical";
import { TacticalMap } from "@/components/tactical/TacticalMap";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MapPage({ params }: PageProps) {
  const { id } = await params;
  const engagementId = Number(id);
  if (!Number.isInteger(engagementId) || engagementId < 1) notFound();

  const eng = getById(db, engagementId);
  if (!eng) notFound();

  const findings = listFindings(db, engagementId);
  const creds = listCreds(db, engagementId);
  const cmdlog = listCommandLog(db, engagementId);
  const networkIntel = getNetworkIntel(db, engagementId);
  const allDefenses = listDefenses(db, engagementId);
  const mapDefense = (d: (typeof allDefenses)[number]): MapDefense => ({
    id: d.id,
    category: d.category,
    product: d.product,
    detail: d.detail,
  });
  const networkDefenses = allDefenses
    .filter((d) => d.host_id === null)
    .map(mapDefense);

  const hosts: MapHost[] = eng.hosts.map((h) => {
    const hostPorts = eng.ports
      .filter((p) => p.host_id === h.id && p.state === "open")
      .map((p) => ({
        port: p.port,
        protocol: p.protocol,
        service: p.service,
        product: p.product,
        version: p.version,
      }));

    // manual findings for this host: port-level (port belongs to host) +
    // engagement-level (port_id null) findings get attached to the primary host
    const hostPortIds = new Set(
      eng.ports.filter((p) => p.host_id === h.id).map((p) => p.id),
    );
    const manual: TacticalFinding[] = findings
      .filter(
        (f) =>
          (f.port_id !== null && hostPortIds.has(f.port_id)) ||
          (f.port_id === null && h.is_primary),
      )
      .map((f) => ({
        sev: normalizeSeverity(f.severity),
        title: f.title,
        detail: f.cve ? `CVE ${f.cve}` : f.description.slice(0, 60),
        next: f.description || "ручная находка",
      }));

    return buildMapHost({
      id: h.id,
      ip: h.ip,
      hostname: h.hostname,
      osName: h.os_name,
      state: h.state,
      priority: h.priority,
      opStatus: h.op_status,
      notes: h.notes,
      iconOverride: h.icon,
      ports: hostPorts,
      manualFindings: manual,
      defenses: allDefenses.filter((d) => d.host_id === h.id).map(mapDefense),
      creds: creds
        .filter((c) => c.host_id === h.id)
        .map((c) => ({
          id: c.id,
          service: c.service,
          port: c.port,
          username: c.username,
          secret: c.secret,
          kind: c.kind,
          validated: c.validated,
        })),
      commandLog: cmdlog
        .filter((c) => c.host_id === h.id)
        .map((c) => ({
          id: c.id,
          portId: c.port_id,
          command: c.command,
          result: c.result,
          ts: c.ts,
        })),
    });
  });

  const sorted = sortMapHosts(hosts);

  return (
    <TacticalMap
      engagementId={engagementId}
      engagementName={eng.name}
      hosts={sorted}
      networkIntel={{
        organization: networkIntel.organization,
        domain: networkIntel.domain,
        scope: networkIntel.scope,
        budget: networkIntel.budget,
        notes: networkIntel.notes,
      }}
      networkDefenses={networkDefenses}
    />
  );
}
