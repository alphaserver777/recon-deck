"use server";

import { revalidatePath } from "next/cache";
import {
  db,
  createCommandLogEntry,
  updateCommandLogEntry,
  deleteCommandLogEntry,
  createTimelineNote,
  deleteTimelineNote,
  type CommandLogPatch,
} from "@/lib/db";

function validateId(value: unknown, name: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new Error(`Invalid ${name}.`);
  }
  return value;
}

const VALID_STATUSES = ["SUCCESS", "CREDENTIALS", "INFO", "ERROR"] as const;
type EntryStatus = (typeof VALID_STATUSES)[number];

function revalidateTimeline(engagementId: number): void {
  revalidatePath(`/engagements/${engagementId}/timeline`);
  revalidatePath(`/engagements/${engagementId}/map`);
}

export async function addEntryAction(
  engagementId: number,
  hostId: number,
  data: {
    command: string;
    result?: string;
    summary?: string;
    category?: string;
    status?: string;
    link?: string;
    goal?: string;
  },
): Promise<void> {
  const eid = validateId(engagementId, "engagementId");
  const hid = validateId(hostId, "hostId");
  if (!data.command?.trim()) throw new Error("Empty command.");
  const status = VALID_STATUSES.includes(data.status as EntryStatus)
    ? data.status!
    : "INFO";
  createCommandLogEntry(db, {
    engagementId: eid,
    hostId: hid,
    command: data.command,
    result: data.result ?? "",
    summary: data.summary ?? "",
    category: data.category ?? "",
    status,
    link: data.link ?? "",
    goal: data.goal ?? "",
  });
  revalidateTimeline(eid);
}

export async function updateEntryAction(
  engagementId: number,
  entryId: number,
  patch: CommandLogPatch,
): Promise<void> {
  const eid = validateId(engagementId, "engagementId");
  const eid2 = validateId(entryId, "entryId");
  if (patch.status && !VALID_STATUSES.includes(patch.status as EntryStatus)) {
    patch.status = "INFO";
  }
  updateCommandLogEntry(db, eid, eid2, patch);
  revalidateTimeline(eid);
}

export async function deleteEntryAction(
  engagementId: number,
  entryId: number,
): Promise<void> {
  const eid = validateId(engagementId, "engagementId");
  const eid2 = validateId(entryId, "entryId");
  deleteCommandLogEntry(db, eid, eid2);
  revalidateTimeline(eid);
}

export async function addNoteAction(
  engagementId: number,
  body: string,
): Promise<void> {
  const eid = validateId(engagementId, "engagementId");
  if (!body?.trim()) throw new Error("Empty note.");
  createTimelineNote(db, eid, body);
  revalidateTimeline(eid);
}

export async function deleteNoteAction(
  engagementId: number,
  noteId: number,
): Promise<void> {
  const eid = validateId(engagementId, "engagementId");
  const nid = validateId(noteId, "noteId");
  deleteTimelineNote(db, eid, nid);
  revalidateTimeline(eid);
}
