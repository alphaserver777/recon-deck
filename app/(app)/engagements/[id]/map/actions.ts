"use server";

/**
 * Server actions for the tactical map (fork).
 *
 * Operator mutations: per-host priority/status/notes, credential CRUD, and
 * command-log entries. All delegate to the repo layer and revalidate the map
 * route so the RSC tree re-renders with persisted state. Mirrors the pattern
 * in ../actions.ts (validateId guard, revalidatePath).
 */

import { revalidatePath } from "next/cache";
import {
  db,
  setHostPriority,
  setHostStatus,
  setHostNotes,
  createCred,
  updateCred,
  deleteCred,
  createCommandLogEntry,
  deleteCommandLogEntry,
  type OpStatus,
  type CredKind,
  type CredValidated,
} from "@/lib/db";

function validateId(value: unknown, name: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new Error(`Invalid ${name}.`);
  }
  return value;
}

function revalidateMap(engagementId: number): void {
  revalidatePath(`/engagements/${engagementId}/map`);
}

const OP_STATUSES: OpStatus[] = ["recon", "active", "owned", "dismissed"];
const CRED_KINDS: CredKind[] = ["pass", "hash", "key"];
const CRED_VALIDATED: CredValidated[] = ["untested", "valid", "invalid"];

// --- host ops --------------------------------------------------------------

export async function setPriorityAction(
  engagementId: number,
  hostId: number,
  priority: number,
): Promise<void> {
  const eid = validateId(engagementId, "engagementId");
  const hid = validateId(hostId, "hostId");
  setHostPriority(db, eid, hid, Number(priority) || 0);
  revalidateMap(eid);
}

export async function setStatusAction(
  engagementId: number,
  hostId: number,
  status: string,
): Promise<void> {
  const eid = validateId(engagementId, "engagementId");
  const hid = validateId(hostId, "hostId");
  if (!OP_STATUSES.includes(status as OpStatus)) {
    throw new Error("Invalid status.");
  }
  setHostStatus(db, eid, hid, status as OpStatus);
  revalidateMap(eid);
}

export async function setNotesAction(
  engagementId: number,
  hostId: number,
  notes: string,
): Promise<void> {
  const eid = validateId(engagementId, "engagementId");
  const hid = validateId(hostId, "hostId");
  setHostNotes(db, eid, hid, typeof notes === "string" ? notes : "");
  revalidateMap(eid);
}

// --- credentials -----------------------------------------------------------

export async function addCredAction(
  engagementId: number,
  hostId: number,
  data: {
    service?: string;
    port?: number | null;
    username?: string;
    secret?: string;
    kind?: string;
    validated?: string;
  },
): Promise<void> {
  const eid = validateId(engagementId, "engagementId");
  const hid = validateId(hostId, "hostId");
  createCred(db, {
    engagementId: eid,
    hostId: hid,
    service: data.service ?? null,
    port: data.port ?? null,
    username: data.username ?? "",
    secret: data.secret ?? "",
    kind: CRED_KINDS.includes(data.kind as CredKind)
      ? (data.kind as CredKind)
      : "pass",
    validated: CRED_VALIDATED.includes(data.validated as CredValidated)
      ? (data.validated as CredValidated)
      : "untested",
  });
  revalidateMap(eid);
}

export async function updateCredAction(
  engagementId: number,
  credId: number,
  patch: { validated?: string; username?: string; secret?: string },
): Promise<void> {
  const eid = validateId(engagementId, "engagementId");
  const cid = validateId(credId, "credId");
  updateCred(db, eid, cid, {
    username: patch.username,
    secret: patch.secret,
    validated: CRED_VALIDATED.includes(patch.validated as CredValidated)
      ? (patch.validated as CredValidated)
      : undefined,
  });
  revalidateMap(eid);
}

export async function deleteCredAction(
  engagementId: number,
  credId: number,
): Promise<void> {
  const eid = validateId(engagementId, "engagementId");
  const cid = validateId(credId, "credId");
  deleteCred(db, eid, cid);
  revalidateMap(eid);
}

// --- command log -----------------------------------------------------------

export async function addCommandAction(
  engagementId: number,
  hostId: number,
  command: string,
  result: string,
): Promise<void> {
  const eid = validateId(engagementId, "engagementId");
  const hid = validateId(hostId, "hostId");
  if (typeof command !== "string" || !command.trim()) {
    throw new Error("Empty command.");
  }
  createCommandLogEntry(db, {
    engagementId: eid,
    hostId: hid,
    command,
    result: typeof result === "string" ? result : "",
  });
  revalidateMap(eid);
}

export async function deleteCommandAction(
  engagementId: number,
  entryId: number,
): Promise<void> {
  const eid = validateId(engagementId, "engagementId");
  const cid = validateId(entryId, "entryId");
  deleteCommandLogEntry(db, eid, cid);
  revalidateMap(eid);
}
