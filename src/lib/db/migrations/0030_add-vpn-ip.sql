ALTER TABLE engagements ADD COLUMN vpn_ip TEXT DEFAULT NULL;
CREATE INDEX engagements_vpn_ip_idx ON engagements(vpn_ip);
