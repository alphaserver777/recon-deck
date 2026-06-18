"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { CommandLogEntry, TimelineNote } from "@/lib/db/schema";
import type { CommandLogPatch } from "@/lib/db";
import {
  addEntryAction,
  updateEntryAction,
  deleteEntryAction,
  addNoteAction,
  deleteNoteAction,
} from "../../../app/(app)/engagements/[id]/timeline/actions";
import { RoleIcon } from "./RoleIcon";
import styles from "./Timeline.module.css";

const CATEGORIES = [
  "recon",
  "lateral-movement",
  "credentials",
  "priv-esc",
  "domain",
  "persistence",
  "exfil",
  "c2",
] as const;

const STATUSES = ["SUCCESS", "CREDENTIALS", "INFO", "ERROR"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_DOT: Record<Status, string> = {
  SUCCESS: styles.dotSuccess,
  CREDENTIALS: styles.dotCreds,
  INFO: styles.dotInfo,
  ERROR: styles.dotError,
};
const STATUS_BADGE: Record<Status, string> = {
  SUCCESS: styles.badgeSuccess,
  CREDENTIALS: styles.badgeCreds,
  INFO: styles.badgeInfo,
  ERROR: styles.badgeError,
};

const OP_PHASES = [
  { key: "recon", label: "RECON", pct: 10 },
  { key: "enumeration", label: "ENUMERATION", pct: 25 },
  { key: "exploitation", label: "EXPLOITATION", pct: 45 },
  { key: "post-exploitation", label: "POST-EXPLOIT", pct: 65 },
  { key: "lateral-movement", label: "LATERAL MOV.", pct: 80 },
  { key: "persistence", label: "PERSISTENCE", pct: 92 },
  { key: "complete", label: "COMPLETE", pct: 100 },
] as const;

interface HostLookup {
  id: number;
  ip: string;
  hostname: string | null;
  role: string;
}

interface Props {
  engagementId: number;
  engagementName: string;
  entries: CommandLogEntry[];
  notes: TimelineNote[];
  hosts: HostLookup[];
}

export function Timeline({
  engagementId,
  engagementName,
  entries,
  notes,
  hosts,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [filterHost, setFilterHost] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [phase, setPhase] = useState("recon");

  const hasFilters = filterHost || filterStatus || filterCategory || activeTags.size > 0 || dateFrom || dateTo;

  const hostMap = useMemo(() => {
    const m = new Map<number, HostLookup>();
    for (const h of hosts) m.set(h.id, h);
    return m;
  }, [hosts]);

  const filtered = useMemo(() => {
    let list = entries;
    if (filterHost) list = list.filter((e) => e.host_id === Number(filterHost));
    if (filterStatus) list = list.filter((e) => e.status === filterStatus);
    if (filterCategory) list = list.filter((e) => e.category === filterCategory);
    if (activeTags.size > 0) list = list.filter((e) => activeTags.has(e.category));
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      list = list.filter((e) => new Date(e.ts).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo + "T23:59:59").getTime();
      list = list.filter((e) => new Date(e.ts).getTime() <= to);
    }
    return list;
  }, [entries, filterHost, filterStatus, filterCategory, activeTags, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const s = { total: entries.length, success: 0, creds: 0, errors: 0, info: 0 };
    for (const e of entries) {
      if (e.status === "SUCCESS") s.success++;
      else if (e.status === "CREDENTIALS") s.creds++;
      else if (e.status === "ERROR") s.errors++;
      else s.info++;
    }
    return s;
  }, [entries]);

  const currentPhase = OP_PHASES.find((p) => p.key === phase) ?? OP_PHASES[0];

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilterHost("");
    setFilterStatus("");
    setFilterCategory("");
    setActiveTags(new Set());
    setDateFrom("");
    setDateTo("");
  }, []);

  const enriched = useCallback(() =>
    filtered.map((e) => {
      const host = hostMap.get(e.host_id);
      const dt = new Date(e.ts);
      return {
        ts: e.ts,
        time: dt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        date: dt.toLocaleDateString("ru-RU"),
        command: e.command,
        result: e.result || "",
        summary: e.summary || "",
        status: e.status || "INFO",
        category: e.category || "",
        host_ip: host?.ip ?? "",
        hostname: host?.hostname ?? "",
      };
    }),
  [filtered, hostMap]);

  const download = useCallback((content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const slug = engagementName.replace(/[^a-z0-9]/gi, "_");

  const handleExport = useCallback((fmt: string) => {
    const data = enriched();
    const meta = `Phase: ${currentPhase.label} (${currentPhase.pct}%) — ${data.length} entries — ${new Date().toLocaleString("ru-RU")}`;
    switch (fmt) {
      case "json":
        download(JSON.stringify(data, null, 2), `timeline-${slug}.json`, "application/json");
        break;
      case "csv": {
        const hdr = "Timestamp,Command,Output,Result,Host,IP,Status,Category\n";
        const rows = data.map((r) =>
          [r.ts, r.command, r.result, r.summary, r.hostname, r.host_ip, r.status, r.category]
            .map((v) => `"${v.replace(/"/g, '""')}"`)
            .join(","),
        ).join("\n");
        download(hdr + rows, `timeline-${slug}.csv`, "text/csv");
        break;
      }
      case "md": {
        let md = `# TIMELINE: ${engagementName}\n\n${meta}\n\n`;
        md += "| Timestamp | IN | OUT | Result | Host | Status |\n|---|---|---|---|---|---|\n";
        for (const r of data) md += `| ${r.time} ${r.date} | \`${r.command}\` | ${r.result.slice(0, 60)} | ${r.summary} | ${r.hostname || r.host_ip} | **${r.status}** |\n`;
        download(md, `timeline-${slug}.md`, "text/markdown");
        break;
      }
      case "html": {
        const rows = data.map((r) => `<tr><td>${esc(r.time)}<br><small>${esc(r.date)}</small></td><td style="color:#2de26b;font-family:monospace">${esc(r.command)}</td><td style="color:#888;font-family:monospace">${esc(r.result)}</td><td>${esc(r.summary)}</td><td>${esc(r.hostname || r.host_ip)}</td><td><b>${esc(r.status)}</b></td></tr>`).join("");
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Timeline — ${esc(engagementName)}</title>
<style>*{margin:0;box-sizing:border-box}body{background:#0a0e12;color:#cfe6f5;font-family:monospace;font-size:13px;padding:20px}h1{font-size:16px;color:#39d0ff;letter-spacing:2px;margin-bottom:4px}.meta{font-size:11px;color:#6f8ba0;margin-bottom:16px}table{width:100%;border-collapse:collapse}th{text-align:left;font-size:9px;letter-spacing:2px;color:#6f8ba0;padding:6px 8px;border-bottom:1px solid #1d3447}td{padding:8px;border-bottom:1px solid #11202b;vertical-align:top}</style></head>
<body><h1>TIMELINE: ${esc(engagementName)}</h1><div class="meta">${esc(meta)}</div>
<table><thead><tr><th>TIMESTAMP</th><th>IN</th><th>OUT</th><th>RESULT</th><th>HOST</th><th>STATUS</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
        download(html, `timeline-${slug}.html`, "text/html");
        break;
      }
      case "print": {
        const rows = data.map((r) => `<tr><td>${esc(r.time)}<br><small>${esc(r.date)}</small></td><td style="color:#2de26b;font-family:monospace">${esc(r.command)}</td><td style="color:#888;font-family:monospace">${esc(r.result)}</td><td>${esc(r.summary)}</td><td>${esc(r.hostname || r.host_ip)}</td><td><b>${esc(r.status)}</b></td></tr>`).join("");
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Timeline — ${esc(engagementName)}</title>
<style>*{margin:0;box-sizing:border-box}body{background:#0a0e12;color:#cfe6f5;font-family:monospace;font-size:13px;padding:20px}h1{font-size:16px;color:#39d0ff;letter-spacing:2px;margin-bottom:4px}.meta{font-size:11px;color:#6f8ba0;margin-bottom:16px}table{width:100%;border-collapse:collapse}th{text-align:left;font-size:9px;letter-spacing:2px;color:#6f8ba0;padding:6px 8px;border-bottom:1px solid #1d3447}td{padding:8px;border-bottom:1px solid #11202b;vertical-align:top}@media print{body{background:#fff;color:#222;-webkit-print-color-adjust:exact;print-color-adjust:exact}th{color:#666}td{border-color:#ddd}}</style></head>
<body><h1>TIMELINE: ${esc(engagementName)}</h1><div class="meta">${esc(meta)}</div>
<table><thead><tr><th>TIMESTAMP</th><th>IN</th><th>OUT</th><th>RESULT</th><th>HOST</th><th>STATUS</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
        const w = window.open("", "_blank");
        if (!w) return;
        w.document.write(html);
        w.document.close();
        setTimeout(() => w.print(), 400);
        break;
      }
    }
  }, [enriched, currentPhase, engagementName, slug, download]);

  const handleDelete = useCallback(
    (id: number) => {
      startTransition(() => deleteEntryAction(engagementId, id));
    },
    [engagementId],
  );

  const handleUpdate = useCallback(
    (id: number, patch: CommandLogPatch) => {
      setEditingId(null);
      startTransition(() => updateEntryAction(engagementId, id, patch));
    },
    [engagementId],
  );

  const handleToggleStar = useCallback(
    (id: number, current: boolean) => {
      startTransition(() => updateEntryAction(engagementId, id, { starred: !current }));
    },
    [engagementId],
  );

  return (
    <div className={styles.root} style={{ opacity: pending ? 0.85 : 1 }}>
      <div className={styles.sweep} />
      <div className={styles.scan} />

      <header className={styles.header}>
        <Link href={`/engagements/${engagementId}/map`} className={styles.navBtn}>
          ◂ MAP
        </Link>
        <div className={styles.opName}>
          <span className={styles.opLabel}>TIMELINE:</span> {engagementName}
        </div>
        <div className={styles.headerControls}>
          <button type="button" className={styles.addBtn} onClick={() => setShowForm(true)}>
            + NEW ENTRY
          </button>
          <ExportDropdown onExport={handleExport} />
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.tableArea}>
          {/* progress bar */}
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${currentPhase.pct}%` }} />
              {OP_PHASES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`${styles.phaseMarker} ${phase === p.key ? styles.phaseActive : ""} ${
                    p.pct <= currentPhase.pct ? styles.phaseDone : ""
                  }`}
                  style={{ left: `${p.pct}%` }}
                  onClick={() => setPhase(p.key)}
                  title={p.label}
                >
                  <span className={styles.phaseLabel}>{p.label}</span>
                </button>
              ))}
            </div>
            <div className={styles.progressPct}>{currentPhase.pct}%</div>
          </div>

          <div className={styles.tableHead}>
            <div className={styles.th} />
            <div className={styles.th}>TIMESTAMP</div>
            <div className={styles.th}>GOAL</div>
            <div className={styles.th}>IN</div>
            <div className={styles.th}>OUT</div>
            <div className={styles.th}>RESULT</div>
            <div className={styles.th}>HOST</div>
            <div className={styles.th}>CATEGORY</div>
            <div className={styles.th}>STATUS</div>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.emptyTable}>
              <div className={styles.emptyIcon}>⏱</div>
              <div>НЕТ ЗАПИСЕЙ</div>
              <div style={{ fontSize: 11, color: "var(--t-dim)" }}>
                Нажми + NEW ENTRY чтобы добавить действие
              </div>
            </div>
          ) : (
            filtered.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                host={hostMap.get(entry.host_id) ?? null}
                editing={editingId === entry.id}
                onEdit={() => setEditingId(entry.id)}
                onCancelEdit={() => setEditingId(null)}
                onSave={(patch) => handleUpdate(entry.id, patch)}
                onDelete={() => handleDelete(entry.id)}
                onToggleStar={() => handleToggleStar(entry.id, !!entry.starred)}
              />
            ))
          )}
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.secTitle}>TIMELINE STATS</div>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statVal}>{stats.total}</span>
              <span className={styles.statLabel}>COMMANDS</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statVal} style={{ color: "var(--t-success)" }}>{stats.success}</span>
              <span className={styles.statLabel}>SUCCESS</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statVal} style={{ color: "var(--t-creds)" }}>{stats.creds}</span>
              <span className={styles.statLabel}>CREDENTIALS</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statVal} style={{ color: "var(--t-error)" }}>{stats.errors}</span>
              <span className={styles.statLabel}>ERRORS</span>
            </div>
          </div>

          <div className={styles.secTitle}>
            FILTERS
            {hasFilters && (
              <button type="button" className={styles.clearAll} onClick={clearAllFilters}>
                CLEAR ALL
              </button>
            )}
          </div>
          <div className={styles.filterRow}>
            <select className={styles.filterSelect} value={filterHost} onChange={(e) => setFilterHost(e.target.value)}>
              <option value="">All Hosts</option>
              {hosts.map((h) => (
                <option key={h.id} value={h.id}>{h.hostname || h.ip}</option>
              ))}
            </select>
            <select className={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select className={styles.filterSelect} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className={styles.secTitle}>DATE RANGE</div>
          <div className={styles.dateRange}>
            <div className={styles.dateField}>
              <label className={styles.dateLabel}>FROM</label>
              <input type="date" className={styles.dateInput} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className={styles.dateField}>
              <label className={styles.dateLabel}>TO</label>
              <input type="date" className={styles.dateInput} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className={styles.secTitle}>TAGS</div>
          <div className={styles.tags}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.tagChip} ${activeTags.has(c) ? styles.tagChipOn : ""}`}
                onClick={() => toggleTag(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <NotesPanel
            engagementId={engagementId}
            notes={notes}
            pendingWrap={startTransition}
          />
        </aside>
      </div>

      {showForm && (
        <EntryForm
          engagementId={engagementId}
          hosts={hosts}
          onClose={() => setShowForm(false)}
          pendingWrap={startTransition}
        />
      )}
    </div>
  );
}

const EXPORT_FORMATS = [
  { key: "md", label: "Markdown (.md)" },
  { key: "json", label: "JSON (.json)" },
  { key: "html", label: "HTML (.html)" },
  { key: "csv", label: "CSV (.csv)" },
  { key: "print", label: "Print / PDF..." },
] as const;

function ExportDropdown({ onExport }: { onExport: (fmt: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className={styles.exportWrap} ref={ref}>
      <button type="button" className={styles.exportBtn} onClick={() => setOpen((v) => !v)}>
        Export ▾
      </button>
      {open && (
        <div className={styles.exportMenu}>
          {EXPORT_FORMATS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={styles.exportItem}
              onClick={() => { onExport(f.key); setOpen(false); }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function linkLabel(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname === "/" ? "" : u.pathname;
    const short = host + path;
    return short.length > 45 ? short.slice(0, 42) + "..." : short;
  } catch {
    return url.length > 45 ? url.slice(0, 42) + "..." : url;
  }
}

/* ─── entry row: view / edit modes ─── */

function EntryRow({
  entry,
  host,
  editing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onToggleStar,
}: {
  entry: CommandLogEntry;
  host: HostLookup | null;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (patch: CommandLogPatch) => void;
  onDelete: () => void;
  onToggleStar: () => void;
}) {
  const st = (entry.status || "INFO") as Status;
  const dt = new Date(entry.ts);
  const time = dt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = dt.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });

  const [cmd, setCmd] = useState(entry.command);
  const [out, setOut] = useState(entry.result);
  const [sum, setSum] = useState(entry.summary);
  const [eSt, setESt] = useState(entry.status || "INFO");
  const [eCat, setECat] = useState(entry.category || "");
  const [eLink, setELink] = useState(entry.link || "");
  const [eGoal, setEGoal] = useState(entry.goal || "");

  const save = () => {
    const patch: CommandLogPatch = {};
    if (cmd !== entry.command) patch.command = cmd;
    if (out !== entry.result) patch.result = out;
    if (sum !== entry.summary) patch.summary = sum;
    if (eSt !== (entry.status || "INFO")) patch.status = eSt;
    if (eCat !== (entry.category || "")) patch.category = eCat;
    if (eLink !== (entry.link || "")) patch.link = eLink;
    if (eGoal !== (entry.goal || "")) patch.goal = eGoal;
    if (Object.keys(patch).length > 0) onSave(patch);
    else onCancelEdit();
  };

  if (editing) {
    return (
      <div className={`${styles.entryRow} ${styles.editingRow}`}>
        <div className={styles.cell}>
          <button type="button" className={`${styles.starBtn} ${entry.starred ? styles.starOn : ""}`} onClick={onToggleStar}>
            {entry.starred ? "★" : "☆"}
          </button>
        </div>
        <div className={`${styles.cell} ${styles.tsCell}`}>
          <div className={`${styles.statusDot} ${STATUS_DOT[st] ?? styles.dotInfo}`} />
          <div className={styles.tsText}>
            <span className={styles.tsTime}>{time}</span>
            <span className={styles.tsDate}>{date}</span>
          </div>
        </div>
        <div className={styles.cell}>
          <input className={styles.editInput} value={eGoal} onChange={(e) => setEGoal(e.target.value)} placeholder="Цель команды..." style={{ color: "var(--t-med)" }} />
        </div>
        <div className={styles.cell}>
          <input className={styles.editInput} value={cmd} onChange={(e) => setCmd(e.target.value)} autoFocus />
        </div>
        <div className={styles.cell}>
          <textarea className={styles.editArea} value={out} onChange={(e) => setOut(e.target.value)} rows={2} />
        </div>
        <div className={styles.cell}>
          <input className={styles.editInput} value={sum} onChange={(e) => setSum(e.target.value)} />
          <input className={styles.editInputLink} value={eLink} onChange={(e) => setELink(e.target.value)} placeholder="https://..." />
        </div>
        <div className={`${styles.cell} ${styles.hostBadge}`}>
          <div className={styles.hostHex}>
            <RoleIcon role={host?.role || "host"} size={16} />
          </div>
          <div className={styles.hostInfo}>
            <span className={styles.hostName}>{host?.hostname || "—"}</span>
            <span className={styles.hostIp}>{host?.ip || "?"}</span>
          </div>
        </div>
        <div className={styles.cell}>
          <select className={styles.editSelect} value={eCat} onChange={(e) => setECat(e.target.value)}>
            <option value="">—</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className={styles.cell} style={{ gap: 6 }}>
          <select className={styles.editSelect} value={eSt} onChange={(e) => setESt(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className={styles.editActions}>
            <button type="button" className={styles.editSave} onClick={save}>OK</button>
            <button type="button" className={styles.editCancel} onClick={onCancelEdit}>ESC</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.entryRow} ${entry.starred ? styles.starredRow : ""}`} onDoubleClick={onEdit}>
      <div className={styles.cell}>
        <button type="button" className={`${styles.starBtn} ${entry.starred ? styles.starOn : ""}`} onClick={(e) => { e.stopPropagation(); onToggleStar(); }}>
          {entry.starred ? "★" : "☆"}
        </button>
      </div>
      <div className={`${styles.cell} ${styles.tsCell}`}>
        <div className={`${styles.statusDot} ${STATUS_DOT[st] ?? styles.dotInfo}`} />
        <div className={styles.tsText}>
          <span className={styles.tsTime}>{time}</span>
          <span className={styles.tsDate}>{date}</span>
        </div>
      </div>
      <div className={styles.cell}>
        <div className={styles.goalText}>{entry.goal || "—"}</div>
      </div>
      <div className={styles.cell}>
        <div className={styles.cmdIn}>{entry.command}</div>
      </div>
      <div className={styles.cell}>
        <div className={styles.cmdOut}>{entry.result || "—"}</div>
      </div>
      <div className={styles.cell}>
        <div className={styles.cmdResult}>{entry.summary || "—"}</div>
        {entry.link && (
          <a href={entry.link} target="_blank" rel="noopener noreferrer" className={styles.entryLink} onClick={(e) => e.stopPropagation()}>
            {linkLabel(entry.link)}
          </a>
        )}
      </div>
      <div className={`${styles.cell} ${styles.hostBadge}`}>
        <div className={styles.hostHex}>
          <RoleIcon role={host?.role || "host"} size={16} />
        </div>
        <div className={styles.hostInfo}>
          <span className={styles.hostName}>{host?.hostname || "—"}</span>
          <span className={styles.hostIp}>{host?.ip || "?"}</span>
        </div>
      </div>
      <div className={styles.cell}>
        {entry.category ? (
          <span className={styles.categoryChip}>{entry.category}</span>
        ) : (
          <span style={{ color: "var(--t-dim)" }}>—</span>
        )}
      </div>
      <div className={styles.cell} style={{ alignItems: "center" }}>
        <span className={`${styles.statusBadge} ${STATUS_BADGE[st] ?? styles.badgeInfo}`}>
          {st}
        </span>
      </div>
      <button type="button" className={styles.rowEdit} title="Редактировать (или двойной клик)" onClick={onEdit}>{"✎"}</button>
      <button type="button" className={styles.rowDel} title="Удалить запись" onClick={onDelete}>{"✕"}</button>
    </div>
  );
}

/* ─── notes panel ─── */

function NotesPanel({
  engagementId,
  notes,
  pendingWrap,
}: {
  engagementId: number;
  notes: TimelineNote[];
  pendingWrap: (cb: () => void) => void;
}) {
  const [body, setBody] = useState("");

  const add = () => {
    if (!body.trim()) return;
    pendingWrap(() => addNoteAction(engagementId, body));
    setBody("");
  };

  return (
    <>
      <div className={styles.secTitle}>NOTES ({notes.length})</div>
      {notes.map((n) => {
        const dt = new Date(n.ts);
        return (
          <div key={n.id} className={styles.noteItem}>
            <div className={styles.noteTs}>
              {dt.toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className={styles.noteBody}>{n.body}</div>
            <button
              type="button"
              className={styles.noteDel}
              onClick={() => pendingWrap(() => deleteNoteAction(engagementId, n.id))}
            >
              ✕
            </button>
          </div>
        );
      })}
      <textarea
        className={styles.noteInput}
        placeholder="Добавить заметку..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add();
        }}
      />
      <button type="button" className={styles.noteAdd} onClick={add}>
        + NOTE
      </button>
    </>
  );
}

/* ─── new entry form ─── */

function EntryForm({
  engagementId,
  hosts,
  onClose,
  pendingWrap,
}: {
  engagementId: number;
  hosts: HostLookup[];
  onClose: () => void;
  pendingWrap: (cb: () => void) => void;
}) {
  const [hostId, setHostId] = useState(hosts[0]?.id?.toString() ?? "");
  const [command, setCommand] = useState("");
  const [result, setResult] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<string>("INFO");
  const [link, setLink] = useState("");
  const [goal, setGoal] = useState("");

  const submit = () => {
    if (!command.trim() || !hostId) return;
    pendingWrap(() =>
      addEntryAction(engagementId, Number(hostId), {
        command,
        result,
        summary,
        category,
        status,
        link,
        goal,
      }),
    );
    onClose();
  };

  return (
    <div className={styles.formOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.formPanel}>
        <h3 className={styles.formTitle}>NEW ENTRY</h3>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>HOST</label>
            <select className={styles.formSelect} value={hostId} onChange={(e) => setHostId(e.target.value)}>
              {hosts.map((h) => (
                <option key={h.id} value={h.id}>{h.hostname || h.ip}</option>
              ))}
            </select>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>STATUS</label>
            <select className={styles.formSelect} value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className={`${styles.formField} ${styles.formWide}`}>
            <label className={styles.formLabel}>GOAL</label>
            <input
              className={styles.formInput}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Проверить SMB-доступ с найденными кредами"
              autoFocus
            />
          </div>
          <div className={`${styles.formField} ${styles.formWide}`}>
            <label className={styles.formLabel}>COMMAND (IN)</label>
            <input
              className={styles.formInput}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="nxc smb 10.0.0.1 -u admin -p ..."
            />
          </div>
          <div className={`${styles.formField} ${styles.formWide}`}>
            <label className={styles.formLabel}>OUTPUT (OUT)</label>
            <textarea
              className={`${styles.formInput} ${styles.formArea}`}
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="Сырой вывод команды..."
            />
          </div>
          <div className={`${styles.formField} ${styles.formWide}`}>
            <label className={styles.formLabel}>RESULT (SUMMARY)</label>
            <input
              className={styles.formInput}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Получены креды admin:Password123"
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>CATEGORY</label>
            <select className={styles.formSelect} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">—</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className={`${styles.formField} ${styles.formWide}`}>
            <label className={styles.formLabel}>LINK</label>
            <input
              className={styles.formInput}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://github.com/... или ссылка на ресурс"
            />
          </div>
        </div>
        <div className={styles.formActions}>
          <button type="button" className={styles.formCancel} onClick={onClose}>CANCEL</button>
          <button type="button" className={styles.formSubmit} onClick={submit}>ADD ENTRY</button>
        </div>
      </div>
    </div>
  );
}
