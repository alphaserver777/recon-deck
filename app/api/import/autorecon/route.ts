/**
 * POST /api/import/autorecon — AutoRecon zip upload ingress route (Phase 5).
 *
 * Accepts multipart/form-data with a .zip file containing an AutoRecon
 * results/<ip>/ directory structure. Extracts _full_tcp_nmap.xml via the
 * Phase 2 parser, walks per-port service files, parses _manual_commands.txt,
 * and persists a fully populated engagement via createFromScan.
 *
 * Error surface:
 *   400  missing file, non-zip, invalid form data
 *   413  file exceeds 50 MB limit (D-11)
 *   422  zip parse/import error (D-09 actionable messages)
 *   500  database error
 *
 * D-16: Separate from POST /api/scan (different content type, different pipeline).
 * D-17: jszip used server-side only (this route runs in Node, never client).
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { importAutoRecon } from "@/lib/importer/autorecon";
import { db, createFromScan, findEngagementBySubnet, rescanEngagement, engagements } from "@/lib/db";
import { eq } from "drizzle-orm";
import { parseNmapXml } from "@/lib/parser";

// D-11: 50 MB max upload size (typical AutoRecon zips are 2-25 MB)
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  // Pre-parse size check via Content-Length header (fast reject for honest clients).
  const contentLength = parseInt(
    request.headers.get("content-length") ?? "0",
    10,
  );
  if (contentLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "File exceeds 50 MB limit." },
      { status: 413 },
    );
  }

  // Parse multipart form data.
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid request. Expected multipart/form-data with a zip file." },
      { status: 400 },
    );
  }

  // Extract and validate file. FormDataEntryValue is `string | File | null`,
  // so a non-File entry (e.g. a posted text field named "file") would
  // previously pass the null check and then crash on `file.name.endsWith(...)`
  // with a generic 500. The instanceof guard narrows to File and surfaces
  // the same actionable 400 as a missing field (ME-01).
  const fileEntry = formData.get("file");
  if (!fileEntry || typeof fileEntry === "string") {
    return NextResponse.json(
      { error: "No file provided. Expected a .zip upload." },
      { status: 400 },
    );
  }
  const file = fileEntry;

  // Validate file type (defense in depth — client also checks).
  if (!file.name.endsWith(".zip") && file.type !== "application/zip") {
    return NextResponse.json(
      { error: "Only .zip files are accepted." },
      { status: 400 },
    );
  }

  // Post-parse size check (Content-Length can be spoofed or absent).
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "File exceeds 50 MB limit." },
      { status: 413 },
    );
  }

  // Extract ArrayBuffer and run importer.
  const buffer = await file.arrayBuffer();

  let importResult;
  try {
    importResult = await importAutoRecon(buffer, file.name);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 422 },
    );
  }

  // Upsert: if ?subnet= is provided, find existing engagement and rescan it
  // instead of creating a new one. Operator data (creds/notes/defenses/sector)
  // is preserved — only host/port scan data is refreshed.
  const subnet = request.nextUrl.searchParams.get("subnet");
  const vpnIp = request.nextUrl.searchParams.get("vpn_ip");
  const existingId = subnet ? findEngagementBySubnet(db, subnet, vpnIp) : null;

  let resultId: number;
  try {
    if (existingId) {
      rescanEngagement(db, existingId, importResult.scan, file.name);
      resultId = existingId;
      if (vpnIp) {
        db.update(engagements).set({ vpn_ip: vpnIp }).where(eq(engagements.id, resultId)).run();
      }
    } else {
      const created = createFromScan(db, importResult.scan, file.name, {
        arFiles: importResult.arFiles,
        arCommands: importResult.arCommands,
        arArtifacts: importResult.arArtifacts,
      });
      resultId = created.id;
      if (subnet) {
        const { renameEngagement } = await import("@/lib/db");
        const label = vpnIp ? `${subnet} (via ${vpnIp})` : subnet;
        renameEngagement(db, resultId, label);
      }
      if (vpnIp) {
        db.update(engagements).set({ vpn_ip: vpnIp }).where(eq(engagements.id, resultId)).run();
      }
    }
  } catch (err) {
    console.error("import/autorecon failed:", err);
    return NextResponse.json(
      { error: "Failed to save engagement. Please try again." },
      { status: 500 },
    );
  }

  revalidatePath("/", "layout");
  if (existingId) revalidatePath(`/engagements/${existingId}`);
  return NextResponse.json({ id: resultId, upserted: !!existingId });
}
