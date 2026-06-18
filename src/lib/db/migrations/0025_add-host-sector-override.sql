-- Tactical map: manual sector/role override (drag-and-drop between sectors).
-- Empty = auto-derived from ports/OS (roleOf). Operator-owned (rescan-safe).
ALTER TABLE hosts ADD COLUMN sector TEXT NOT NULL DEFAULT '';
