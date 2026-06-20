import { notFound } from "next/navigation";
import {
  db,
  getById,
  listCreds,
  listFindings,
  listDefenses,
  listCommandLog,
  getNetworkIntel,
} from "@/lib/db";
import {
  buildMapHost,
  sortMapHosts,
  findingsFor,
  type MapPort,
  type MapCred,
  type MapCmd,
  type MapDefense,
  type TacticalFinding,
} from "@/lib/tactical";
import { toHostTableRows } from "@/lib/ops-views/hosts-vm";
import { HostsClient } from "./client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HostsPage({ params }: PageProps) {
  const { id } = await params;
  const engagementId = Number(id);
  if (!Number.isInteger(engagementId) || engagementId < 1) notFound();

  const eng = getById(db, engagementId);
  if (!eng) notFound();

  const intel = getNetworkIntel(db, engagementId);
  const allCreds = listCreds(db, engagementId);
  const allFindings = listFindings(db, engagementId);
  const allDefenses = listDefenses(db, engagementId);
  const commands = listCommandLog(db, engagementId);

  const mapHosts = eng.hosts.map((h) => {
    const hostPorts = eng.ports.filter((p) => p.host_id === h.id);
    const portNumbers = hostPorts.map((p) => p.port);
    const derived = findingsFor(portNumbers, h.os_name);
    const manual: TacticalFinding[] = allFindings
      .filter((f) => f.port_id && hostPorts.some((p) => p.id === f.port_id))
      .map((f) => ({
        sev: f.severity as TacticalFinding["sev"],
        title: f.title,
        detail: f.description,
        next: "",
      }));

    const ports: MapPort[] = hostPorts.map((p) => ({
      port: p.port, protocol: p.protocol, service: p.service, product: p.product, version: p.version,
    }));
    const creds: MapCred[] = allCreds.filter((c) => c.host_id === h.id).map((c) => ({
      id: c.id, service: c.service, port: c.port, username: c.username, secret: c.secret, kind: c.kind, validated: c.validated,
    }));
    const cmdLog: MapCmd[] = commands.filter((c) => c.host_id === h.id).map((c) => ({
      id: c.id, portId: c.port_id, command: c.command, result: c.result, ts: c.ts,
    }));
    const defenses: MapDefense[] = allDefenses.filter((d) => d.host_id === h.id || d.host_id === null).map((d) => ({
      id: d.id, category: d.category, product: d.product, detail: d.detail,
    }));

    return buildMapHost({
      id: h.id, ip: h.ip, hostname: h.hostname, osName: h.os_name, state: h.state,
      priority: h.priority, opStatus: h.op_status, notes: h.notes,
      iconOverride: h.icon ?? "", sectorOverride: h.sector ?? "",
      ports, manualFindings: [...derived, ...manual], creds, commandLog: cmdLog, defenses,
    });
  });

  const sorted = sortMapHosts(mapHosts);
  const domain = intel.domain || eng.name;
  const rows = toHostTableRows(sorted, domain);

  return <HostsClient rows={rows} />;
}
