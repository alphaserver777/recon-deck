-- Tactical-map operator fields on hosts (fork: tactical-map).
--
-- Three additive, operator-owned columns. These are deliberately NOT
-- scan-derived: the AutoRecon importer / rescan path only writes
-- ip / hostname / state / os_name / os_accuracy / scanned_at, so these
-- survive a re-import unchanged (the whole point of the tactical map —
-- re-recon refreshes facts, operator intel persists).
--
--   priority   0=none, 1=low, 2=high, 3=critical — manual ranking that the
--              tactical map can sort/colour by, on top of derived severity.
--   op_status  recon | active | owned | dismissed — operation state, drives
--              blip colour and ordering.
--   notes      host-level markdown scratchpad (port_notes is port-scoped).
ALTER TABLE hosts ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE hosts ADD COLUMN op_status TEXT NOT NULL DEFAULT 'recon';
--> statement-breakpoint
ALTER TABLE hosts ADD COLUMN notes TEXT NOT NULL DEFAULT '';
