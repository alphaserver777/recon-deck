"use client";

import { useCallback, useMemo, useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import type { TimelineLogEntry, TimelineNoteEntry, TimelineCategory } from "@/lib/ops-views/types";
import { TimelineEntry } from "@/components/ops/timeline/TimelineEntry";
import { TimelineStats } from "@/components/ops/timeline/TimelineStats";
import { TimelineFilters } from "@/components/ops/timeline/TimelineFilters";
import { TimelineTags } from "@/components/ops/timeline/TimelineTags";
import { TimelineNotes } from "@/components/ops/timeline/TimelineNotes";

const PAGE_SIZE = 20;

const CATEGORIES: TimelineCategory[] = [
  "recon", "lateral-movement", "credentials", "priv-esc",
  "domain", "persistence", "exfil", "c2",
];

interface HostLookup {
  id: string;
  hostname: string;
  ip: string;
}

interface Props {
  entries: TimelineLogEntry[];
  notes: TimelineNoteEntry[];
  hosts: HostLookup[];
}

export function TimelineClient({ entries, notes, hosts }: Props) {
  const [filterHost, setFilterHost] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showDropdown, setShowDropdown] = useState("");

  const hasFilters = !!filterHost || !!filterStatus || !!filterCategory || activeTags.size > 0 || !!dateFrom || !!dateTo;

  const hostMap = useMemo(() => new Map(hosts.map((h) => [h.id, h])), [hosts]);

  const filtered = useMemo(() => {
    let list = entries;
    if (filterHost) list = list.filter((e) => e.hostId === filterHost);
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

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilterHost(""); setFilterStatus(""); setFilterCategory("");
    setActiveTags(new Set()); setDateFrom(""); setDateTo("");
  }, []);

  const toggleStar = useCallback((_id: number) => {
    // TODO: wire to server action updateEntryAction
  }, []);

  const handleExport = useCallback((fmt: string) => {
    setShowDropdown("");
    const data = filtered.map((e) => {
      const host = hostMap.get(e.hostId);
      const dt = new Date(e.ts);
      return {
        ts: e.ts,
        time: dt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        date: dt.toLocaleDateString("ru-RU"),
        command: e.command, output: e.output, summary: e.summary,
        status: e.status, category: e.category,
        hostname: host?.hostname ?? "", ip: host?.ip ?? "",
      };
    });
    let content: string, filename: string, mime: string;
    switch (fmt) {
      case "json":
        content = JSON.stringify(data, null, 2); filename = "timeline.json"; mime = "application/json"; break;
      case "csv": {
        const hdr = "Timestamp,Command,Output,Result,Host,IP,Status,Category\n";
        const rows = data.map((r) => [r.ts, r.command, r.output, r.summary, r.hostname, r.ip, r.status, r.category].map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
        content = hdr + rows; filename = "timeline.csv"; mime = "text/csv"; break;
      }
      default: return;
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }, [filtered, hostMap]);

  return (
    <div className="flex h-full" style={{ padding: 16, gap: 16, overflow: "hidden" }}>
      <div className="flex-1 flex flex-col" style={{ minWidth: 0, overflow: "hidden" }}>
        <div className="flex items-center justify-between shrink-0" style={{ padding: "12px 16px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px 8px 0 0", borderBottom: "none" }}>
          <h1 className="mono" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", color: "var(--accent)", margin: 0 }}>OPERATION TIMELINE</h1>
          <div className="flex items-center gap-3">
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowDropdown(showDropdown === "export" ? "" : "export")} className="mono flex items-center gap-1.5" style={{ padding: "5px 10px", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--fg-muted)", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer" }}>
                <Download size={12} /> EXPORT
              </button>
              {showDropdown === "export" && (
                <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden", zIndex: 50, minWidth: 120 }}>
                  {["JSON", "CSV"].map((fmt) => (
                    <button key={fmt} onClick={() => handleExport(fmt.toLowerCase())} className="mono block w-full text-left" style={{ padding: "8px 14px", fontSize: 10.5, color: "var(--fg-muted)", background: "transparent", border: "none", cursor: "pointer", letterSpacing: "0.08em" }}>
                      {fmt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ border: "1px solid var(--border)", borderRadius: "0 0 8px 8px" }}>
          {visible.map((entry) => (
            <TimelineEntry key={entry.id} entry={entry} host={hostMap.get(entry.hostId)} onToggleStar={toggleStar} />
          ))}
          {hasMore && (
            <button onClick={() => setVisibleCount((c) => c + PAGE_SIZE)} className="mono w-full flex items-center justify-center gap-2" style={{ padding: 14, background: "var(--bg-3)", border: "none", borderTop: "1px solid var(--border)", color: "var(--accent)", fontSize: 11, letterSpacing: "0.12em", cursor: "pointer" }}>
              <Download size={13} style={{ transform: "rotate(180deg)" }} /> LOAD MORE ({filtered.length - visibleCount} remaining)
            </button>
          )}
          {filtered.length === 0 && (
            <div className="mono" style={{ padding: 40, textAlign: "center", color: "var(--fg-subtle)", fontSize: 12, letterSpacing: "0.1em" }}>
              НЕТ ЗАПИСЕЙ
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 shrink-0 overflow-y-auto" style={{ width: 270 }}>
        <TimelineStats stats={stats} />
        <TimelineFilters
          hosts={hosts as any}
          filterHost={filterHost} filterStatus={filterStatus} filterCategory={filterCategory}
          dateFrom={dateFrom} dateTo={dateTo}
          onFilterHost={setFilterHost} onFilterStatus={setFilterStatus} onFilterCategory={setFilterCategory}
          onDateFrom={setDateFrom} onDateTo={setDateTo}
          onApply={() => {}} onClear={clearFilters} hasFilters={hasFilters}
          categories={CATEGORIES}
        />
        <TimelineTags categories={CATEGORIES} activeTags={activeTags} onToggle={toggleTag} />
        <TimelineNotes notes={notes} />
      </div>
    </div>
  );
}
