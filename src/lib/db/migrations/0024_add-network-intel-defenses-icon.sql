-- Tactical map iteration 2 (fork): network brief, security controls, host icons.
--
-- network_intel — one row per engagement: operator-recorded network-wide intel
--                 (organisation, AD domain, in-scope routes, budget, notes).
-- defenses       — discovered defensive products (САВЗ/EDR/FW/SIEM/DLP/IPS/…).
--                 host_id NULL = network-level control.
-- hosts.icon     — per-host icon override for the map (empty = role default).
--
-- All operator-owned: the AutoRecon importer never writes these, so a re-import
-- refreshes scan facts while this intel persists.
ALTER TABLE hosts ADD COLUMN icon TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
CREATE TABLE network_intel (
  engagement_id INTEGER PRIMARY KEY,
  organization  TEXT NOT NULL DEFAULT '',
  domain        TEXT NOT NULL DEFAULT '',
  scope         TEXT NOT NULL DEFAULT '',
  budget        TEXT NOT NULL DEFAULT '',
  notes         TEXT NOT NULL DEFAULT '',
  updated_at    TEXT NOT NULL,
  FOREIGN KEY (engagement_id) REFERENCES engagements(id) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE defenses (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  engagement_id INTEGER NOT NULL,
  host_id       INTEGER,
  category      TEXT NOT NULL DEFAULT 'other',
  product       TEXT NOT NULL DEFAULT '',
  detail        TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL,
  FOREIGN KEY (engagement_id) REFERENCES engagements(id) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (host_id)       REFERENCES hosts(id)       ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX defenses_engagement_id_idx ON defenses (engagement_id);
--> statement-breakpoint
CREATE INDEX defenses_host_id_idx ON defenses (host_id);
