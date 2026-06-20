ALTER TABLE network_intel ADD COLUMN vpn_login TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE network_intel ADD COLUMN vpn_password TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE network_intel ADD COLUMN industry TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE network_intel ADD COLUMN employee_count INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE network_intel ADD COLUMN progress INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE network_intel ADD COLUMN risk_level TEXT NOT NULL DEFAULT 'medium';
--> statement-breakpoint
ALTER TABLE network_intel ADD COLUMN op_status TEXT NOT NULL DEFAULT 'recon';
