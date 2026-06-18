import { notFound } from "next/navigation";
import {
  db,
  getById,
  listCommandLog,
  listTimelineNotes,
} from "@/lib/db";
import { Timeline } from "@/components/tactical/Timeline";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TimelinePage({ params }: PageProps) {
  const { id } = await params;
  const engagementId = Number(id);
  if (!Number.isInteger(engagementId) || engagementId < 1) notFound();

  const eng = getById(db, engagementId);
  if (!eng) notFound();

  const entries = listCommandLog(db, engagementId);
  const notes = listTimelineNotes(db, engagementId);

  const hostsLookup = eng.hosts.map((h) => ({
    id: h.id,
    ip: h.ip,
    hostname: h.hostname,
    role: "",
  }));

  return (
    <Timeline
      engagementId={engagementId}
      engagementName={eng.name}
      entries={entries}
      notes={notes}
      hosts={hostsLookup}
    />
  );
}
