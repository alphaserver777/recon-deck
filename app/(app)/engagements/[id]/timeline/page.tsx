import { notFound } from "next/navigation";
import {
  db,
  getById,
  listCommandLog,
  listTimelineNotes,
} from "@/lib/db";
import { toTimelineLogEntry, toTimelineNoteEntry } from "@/lib/ops-views/timeline-vm";
import { TimelineClient } from "./client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TimelinePage({ params }: PageProps) {
  const { id } = await params;
  const engagementId = Number(id);
  if (!Number.isInteger(engagementId) || engagementId < 1) notFound();

  const eng = getById(db, engagementId);
  if (!eng) notFound();

  const rawEntries = listCommandLog(db, engagementId);
  const rawNotes = listTimelineNotes(db, engagementId);

  const hostMap = new Map(eng.hosts.map((h) => [h.id, h]));
  const entries = rawEntries.map((cmd) => {
    const host = hostMap.get(cmd.host_id);
    return toTimelineLogEntry(cmd, host?.hostname || host?.ip || "?");
  });
  const notes = rawNotes.map(toTimelineNoteEntry);

  const hosts = eng.hosts.map((h) => ({
    id: String(h.id),
    hostname: h.hostname ?? h.ip,
    ip: h.ip,
  }));

  return <TimelineClient entries={entries} notes={notes} hosts={hosts} />;
}
