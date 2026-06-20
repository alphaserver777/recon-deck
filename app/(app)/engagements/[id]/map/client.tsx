"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { MapHostFull, SectorDef, SectorKey } from "@/lib/ops-views/types";
import { MAP_ROLE_COLORS, MAP_ROLE_LABELS } from "@/lib/ops-views/types";
import { HostBlip } from "@/components/ops/map/HostBlip";
import { MapRoleIcon } from "@/components/ops/map/MapRoleIcon";
import { IntelPanel } from "@/components/ops/map/IntelPanel";

const SECTORS: SectorDef[] = [
  { key: "COMMAND", title: "КОМАНДНЫЙ ЦЕНТР", desc: "Контроллеры домена / AD" },
  { key: "DATABASES", title: "БАЗЫ ДАННЫХ", desc: "MSSQL / хранилища" },
  { key: "MGMT", title: "УПРАВЛЕНИЕ", desc: "iLO / IPMI / BMC" },
  { key: "SERVERS", title: "СЕРВЕРЫ", desc: "Backup / прикладные" },
  { key: "ENDPOINTS", title: "ЭНДПОИНТЫ", desc: "Рабочие станции Windows" },
  { key: "NETWORK", title: "ПЕРИМЕТР / СЕТЬ", desc: "Шлюзы / firewall / Linux" },
  { key: "IOT", title: "IoT / ПЕРИФЕРИЯ", desc: "Камеры / принтеры / NVR" },
];

const DOMAIN_SECTORS = new Set<SectorKey>(["COMMAND", "DATABASES", "SERVERS", "ENDPOINTS"]);

export function MapClient({ hosts, engagementName }: { hosts: MapHostFull[]; engagementName: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(hosts[0]?.id ?? null);
  const selected = useMemo(() => hosts.find((h) => h.id === selectedId) ?? null, [hosts, selectedId]);

  const totals = useMemo(() => {
    const t = { crit: 0, high: 0, med: 0, low: 0, ports: 0 };
    for (const h of hosts) {
      t.crit += h.counts.crit;
      t.high += h.counts.high;
      t.med += h.counts.med;
      t.low += h.counts.low;
      t.ports += h.ports.length;
    }
    return t;
  }, [hosts]);
  const highValue = hosts.filter((h) => h.counts.crit > 0 || h.counts.high > 0).length;
  const threat = totals.crit ? "CRITICAL" : totals.high ? "HIGH" : totals.med ? "ELEVATED" : "LOW";

  const sectorGroups = useMemo(
    () => SECTORS.map((s) => ({ def: s, hosts: hosts.filter((h) => h.sector === s.key) })).filter((g) => g.hosts.length > 0),
    [hosts],
  );

  const onSelect = useCallback((h: MapHostFull) => setSelectedId(h.id), []);

  const sectorsRef = useRef<HTMLDivElement>(null);
  const blipRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const recomputeLines = useCallback(() => {
    const container = sectorsRef.current;
    if (!container) return;
    const base = container.getBoundingClientRect();
    setSvgSize({ w: container.scrollWidth, h: container.scrollHeight });
    const dcs = hosts.filter((h) => h.role === "dc");
    const targets = hosts.filter((h) => h.role !== "dc" && DOMAIN_SECTORS.has(h.sector));
    const center = (id: string) => {
      const el = blipRefs.current.get(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
    };
    const out: typeof lines = [];
    for (const dc of dcs) {
      const c1 = center(dc.id);
      if (!c1) continue;
      for (const t of targets) {
        const c2 = center(t.id);
        if (!c2) continue;
        out.push({ x1: c1.x, y1: c1.y, x2: c2.x, y2: c2.y });
      }
    }
    setLines(out);
  }, [hosts]);

  useLayoutEffect(() => { recomputeLines(); }, [recomputeLines]);
  useEffect(() => {
    window.addEventListener("resize", recomputeLines);
    return () => window.removeEventListener("resize", recomputeLines);
  }, [recomputeLines]);

  const setBlipRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) blipRefs.current.set(id, el);
    else blipRefs.current.delete(id);
  }, []);

  return (
    <div
      style={{
        position: "relative", height: "100%",
        display: "grid", gridTemplateColumns: "1fr 340px", overflow: "hidden",
        backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
        backgroundSize: "34px 34px",
      }}
    >
      <div style={{ position: "absolute", left: "50%", top: "30%", width: "140vmax", height: "140vmax", transform: "translate(-50%, -50%)", pointerEvents: "none", zIndex: 0, background: "conic-gradient(from 0deg, rgba(34,211,238,0.09) 0deg, transparent 40deg, transparent 360deg)", borderRadius: "50%", animation: "sweep 8s linear infinite", opacity: 0.5 }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.13) 3px, rgba(0,0,0,0.13) 4px)" }} />

      <div style={{ overflow: "auto", padding: 14, position: "relative", zIndex: 2 }}>
        <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 14 }}>
          <StatBox label="HOSTS" value={hosts.length} />
          <StatBox label="HIGH VALUE" value={highValue} color="var(--risk-high)" />
          <StatBox label="PORTS" value={totals.ports} />
          <StatBox label="CRIT" value={totals.crit} color="var(--risk-crit)" />
          <StatBox label="HIGH" value={totals.high} color="var(--risk-high)" />
          <StatBox label="MED" value={totals.med} color="var(--risk-med)" />
          <div className="mono" style={{ padding: "5px 12px", border: `1px solid ${threat === "LOW" ? "var(--risk-low)" : "var(--risk-crit)"}`, borderRadius: 3, color: threat === "LOW" ? "var(--risk-low)" : "var(--risk-crit)", letterSpacing: "0.14em", fontWeight: 700, fontSize: 11, textShadow: threat !== "LOW" ? "0 0 8px rgba(242,72,79,0.5)" : "none", animation: threat !== "LOW" ? "pulse 1.6s infinite" : "none", marginLeft: "auto" }}>
            {threat}
          </div>
        </div>

        <div ref={sectorsRef} style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2, overflow: "visible" }} width={svgSize.w} height={svgSize.h} viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}>
            {lines.map((l, i) => (
              <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="var(--accent)" strokeWidth={1} strokeDasharray="4 6" opacity={0.35} style={{ animation: "dash 1s linear infinite" }} />
            ))}
          </svg>

          {sectorGroups.map((g) => (
            <div key={g.def.key} style={{ border: "1px solid var(--border)", borderRadius: 6, background: "rgba(11,19,27,0.6)", padding: 10, position: "relative", ...(g.hosts.length > 4 ? { gridColumn: "1 / -1" } : {}) }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: 3, height: "100%", background: "linear-gradient(var(--accent), transparent)", opacity: 0.5, borderRadius: "6px 0 0 6px" }} />
              <div className="flex items-baseline gap-2" style={{ margin: "0 0 9px 4px" }}>
                <b className="mono" style={{ letterSpacing: "0.14em", color: "#bfe6ff", fontSize: 12 }}>{g.def.title}</b>
                <span className="mono" style={{ fontSize: 9, color: "var(--fg-subtle)", letterSpacing: "0.08em" }}>{g.def.desc}</span>
                <span className="mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--fg-subtle)" }}>{g.hosts.length} цел.</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 152px)", gap: 10 }}>
                {g.hosts.map((h) => (
                  <HostBlip key={h.id} host={h} selected={h.id === selectedId} onSelect={onSelect} blipRef={setBlipRef(h.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2" style={{ marginTop: 12, padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 6, background: "rgba(11,19,27,0.6)" }}>
          {Object.entries(MAP_ROLE_COLORS).map(([role, color]) => (
            <div key={role} className="flex items-center gap-2" style={{ fontSize: 10, letterSpacing: "0.08em", color: "var(--fg-subtle)", whiteSpace: "nowrap" }}>
              <span style={{ width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", background: color, color: "#fff", flexShrink: 0 }}>
                <MapRoleIcon role={role as any} size={11} />
              </span>
              <span className="mono">{MAP_ROLE_LABELS[role] || role}</span>
            </div>
          ))}
        </div>

        <div className="mono flex items-center gap-4" style={{ marginTop: 10, fontSize: 10, color: "var(--fg-subtle)" }}>
          {[{ label: "CRIT", color: "var(--risk-crit)" }, { label: "HIGH", color: "var(--risk-high)" }, { label: "MED", color: "var(--risk-med)" }, { label: "LOW", color: "var(--risk-low)" }, { label: "OWNED", color: "#b06bff" }].map((s) => (
            <span key={s.label} className="flex items-center gap-1">
              <i style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: s.color }} />
              {s.label}
            </span>
          ))}
          <span style={{ marginLeft: "auto" }}>{engagementName}</span>
        </div>
      </div>

      <IntelPanel host={selected} />

      <style>{`
        @keyframes sweep { to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.7; } }
        @keyframes dash { to { stroke-dashoffset: -10; } }
      `}</style>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="mono flex items-center gap-2" style={{ padding: "4px 10px", border: "1px solid var(--border)", borderRadius: 3, background: "rgba(13,20,28,0.8)", whiteSpace: "nowrap", color: color ?? "var(--fg)" }}>
      <b style={{ fontSize: 17 }}>{value}</b>
      <span style={{ fontSize: 8, letterSpacing: "0.08em", color: "var(--fg-subtle)" }}>{label}</span>
    </div>
  );
}
