import "server-only";

import type { CommandLogEntry, TimelineNote } from "@/lib/db/schema";
import type { TimelineLogEntry, TimelineNoteEntry, TimelineStatus, TimelineCategory } from "./types";

export function toTimelineLogEntry(
  cmd: CommandLogEntry,
  hostLabel: string,
): TimelineLogEntry {
  return {
    id: cmd.id,
    ts: cmd.ts,
    target: hostLabel,
    command: cmd.command,
    output: cmd.result,
    summary: cmd.summary,
    status: (cmd.status || "INFO") as TimelineStatus,
    category: (cmd.category || "recon") as TimelineCategory,
    hostId: String(cmd.host_id),
    starred: !!cmd.starred,
  };
}

export function toTimelineNoteEntry(note: TimelineNote): TimelineNoteEntry {
  return {
    id: note.id,
    ts: note.ts,
    text: note.body,
    author: "operator",
  };
}
