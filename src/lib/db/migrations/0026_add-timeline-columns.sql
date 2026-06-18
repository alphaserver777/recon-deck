-- Migration 0026: extend command_log for timeline + add timeline_notes table.
ALTER TABLE command_log ADD COLUMN category TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE command_log ADD COLUMN status TEXT NOT NULL DEFAULT 'INFO';
--> statement-breakpoint
ALTER TABLE command_log ADD COLUMN summary TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
CREATE TABLE timeline_notes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  engagement_id INTEGER NOT NULL,
  body        TEXT NOT NULL DEFAULT '',
  ts          TEXT NOT NULL,
  FOREIGN KEY (engagement_id) REFERENCES engagements(id) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX timeline_notes_engagement_id_idx ON timeline_notes(engagement_id);
