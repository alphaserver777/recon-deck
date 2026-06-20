import "server-only";

import type { Cred } from "@/lib/db/schema";
import type { CredentialRow, CredType, CredTag } from "./types";

function kindToCredType(kind: string): CredType {
  if (kind === "hash") return "NTLM Hash";
  if (kind === "key") return "Certificate";
  return "Cleartext";
}

function inferTag(username: string, service: string | null): CredTag {
  const u = username.toLowerCase();
  if (u === "administrator" || u.includes("admin")) return "DA";
  if (u === "krbtgt") return "KRBTGT";
  if (u.includes("svc") || u.includes("service")) return "SERVICE";
  if (u === "sa" || u.includes("dba") || service === "mssql") return "DBA";
  if (u === "guest") return "GUEST";
  return "USER";
}

export function toCredentialRow(
  cred: Cred,
  hostIp: string,
  hostname: string | null,
  domain: string,
): CredentialRow {
  return {
    id: String(cred.id),
    username: cred.username,
    secret: cred.secret,
    credType: kindToCredType(cred.kind),
    domain,
    host: hostname || hostIp,
    source: cred.service ?? "unknown",
    foundDate: cred.created_at,
    reuseCount: 0,
    active: cred.validated === "valid" || cred.validated === "untested",
    tag: inferTag(cred.username, cred.service),
  };
}
