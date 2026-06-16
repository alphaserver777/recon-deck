-- Operator credential store + command execution log (fork: tactical-map).
--
-- creds        — credentials harvested during the engagement, host-scoped and
--                optionally tied to a service/port. `kind` separates a
--                cleartext password from a hash or key; `validated` records
--                whether it was actually confirmed against the target.
-- command_log  — what was actually run against a host/port and what came back.
--                Distinct from `port_commands` (runnable templates imported
--                from AutoRecon): this is execution *history* with results.
--
-- Both are operator-owned and cascade-delete with their engagement/host, so a
-- rescan / re-import never touches them.
CREATE TABLE creds (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  engagement_id INTEGER NOT NULL,
  host_id       INTEGER NOT NULL,
  service       TEXT,
  port          INTEGER,
  username      TEXT NOT NULL DEFAULT '',
  secret        TEXT NOT NULL DEFAULT '',
  kind          TEXT NOT NULL DEFAULT 'pass',
  validated     TEXT NOT NULL DEFAULT 'untested',
  created_at    TEXT NOT NULL,
  FOREIGN KEY (engagement_id) REFERENCES engagements(id) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (host_id)       REFERENCES hosts(id)       ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX creds_engagement_id_idx ON creds (engagement_id);
--> statement-breakpoint
CREATE INDEX creds_host_id_idx ON creds (host_id);
--> statement-breakpoint
CREATE TABLE command_log (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  engagement_id INTEGER NOT NULL,
  host_id       INTEGER NOT NULL,
  port_id       INTEGER,
  command       TEXT NOT NULL,
  result        TEXT NOT NULL DEFAULT '',
  ts            TEXT NOT NULL,
  FOREIGN KEY (engagement_id) REFERENCES engagements(id) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (host_id)       REFERENCES hosts(id)       ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (port_id)       REFERENCES ports(id)       ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX command_log_engagement_id_idx ON command_log (engagement_id);
--> statement-breakpoint
CREATE INDEX command_log_host_id_idx ON command_log (host_id);
