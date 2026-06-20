import "server-only";

import type { NetworkIntel } from "@/lib/db/schema";
import type { MapDefense } from "@/lib/tactical";
import type { Company, RiskLevel, CompanyStatus } from "./types";

export function toCompanyView(
  engagementId: number,
  engagementName: string,
  createdAt: string,
  vpnIp: string | null,
  intel: NetworkIntel,
  defenses: MapDefense[],
  hostCount: number,
  credCount: number,
  findingsCount: number,
  portCount: number,
  highValueCount: number,
): Company {
  return {
    id: String(engagementId),
    name: intel.organization || engagementName,
    whiteIp: vpnIp ?? "",
    vpnLogin: intel.vpn_login,
    vpnPassword: intel.vpn_password,
    budget: Number(intel.budget) || 0,
    szi: defenses.filter((d) => d.category !== "savz").map((d) => d.product),
    savz: defenses.filter((d) => d.category === "savz").map((d) => d.product),
    notes: intel.notes,
    domain: intel.domain,
    industry: intel.industry,
    employeeCount: intel.employee_count,
    riskLevel: (intel.risk_level?.toUpperCase() as RiskLevel) || "MEDIUM",
    status: (intel.op_status as CompanyStatus) || "recon",
    hostsDiscovered: hostCount,
    credsFound: credCount,
    vulnsFound: findingsCount,
    entryPoints: portCount,
    highValueTargets: highValueCount,
    attackPaths: 0,
    progress: intel.progress,
    startDate: createdAt,
  };
}
