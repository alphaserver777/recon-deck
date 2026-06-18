"use client";

/**
 * Tactical map (fork) — client "command view".
 *
 * Renders the engagement's hosts as severity-coloured blips grouped into
 * sectors, an operation graph linking the DC to domain hosts, a /24 minimap,
 * and a capture reticle on select. The editable intel drawer lives in
 * <IntelPanel>, which calls the map server actions to persist operator data.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  SECTORS,
  topSev,
  type MapHost,
  type Sev,
} from "@/lib/tactical";
import type { MapDefense } from "@/lib/tactical";
import { IntelPanel } from "./IntelPanel";
import { NetworkBrief } from "./NetworkBrief";
import styles from "./TacticalMap.module.css";

import { RoleIcon, ROLE_COLOR } from "./RoleIcon";

export interface NetworkIntelView {
  organization: string;
  domain: string;
  scope: string;
  budget: string;
  notes: string;
}

const SEV_CLASS: Record<Sev, string> = {
  crit: styles.sevCrit,
  high: styles.sevHigh,
  med: styles.sevMed,
  low: styles.sevLow,
  info: styles.sevInfo,
};
const STATUS_CLASS: Record<string, string> = {
  recon: styles.stRecon,
  active: styles.stActive,
  owned: styles.stOwned,
  dismissed: styles.stDismissed,
};

interface Props {
  engagementId: number;
  engagementName: string;
  hosts: MapHost[];
  networkIntel: NetworkIntelView;
  networkDefenses: MapDefense[];
}

// sectors that form the "domain side" the DC graph links to
const DOMAIN_SECTORS = new Set(["COMMAND", "DATABASES", "SERVERS", "ENDPOINTS"]);

export function TacticalMap({
  engagementId,
  engagementName,
  hosts,
  networkIntel,
  networkDefenses,
}: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(
    hosts.length ? hosts[0].id : null,
  );
  const [reticle, setReticle] = useState<{ x: number; y: number; key: number } | null>(null);

  const selected = useMemo(
    () => hosts.find((h) => h.id === selectedId) ?? null,
    [hosts, selectedId],
  );

  // totals + threat
  const totals = useMemo(() => {
    const t = { crit: 0, high: 0, med: 0, low: 0, creds: 0, ports: 0 };
    for (const h of hosts) {
      t.crit += h.counts.crit;
      t.high += h.counts.high;
      t.med += h.counts.med;
      t.low += h.counts.low;
      t.creds += h.creds.length;
      t.ports += h.ports.length;
    }
    return t;
  }, [hosts]);
  const highValue = hosts.filter(h => h.maxsev >= 3).length;
  const threat = totals.crit ? "CRITICAL" : totals.high ? "HIGH" : totals.med ? "ELEVATED" : "LOW";

  const onSelect = useCallback((h: MapHost, ev?: React.MouseEvent) => {
    if (ev) {
      setReticle({ x: ev.clientX, y: ev.clientY, key: Date.now() });
      window.setTimeout(() => setReticle(null), 560);
    }
    setSelectedId(h.id);
  }, []);

  // sectors with hosts
  const sectorGroups = SECTORS.map((s) => ({
    def: s,
    hosts: hosts.filter((h) => h.sector === s.key),
  })).filter((g) => g.hosts.length > 0);

  // DC operation graph -------------------------------------------------------
  const sectorsRef = useRef<HTMLDivElement>(null);
  const blipRefs = useRef<Map<number, HTMLElement>>(new Map());
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const recomputeLines = useCallback(() => {
    const container = sectorsRef.current;
    if (!container) return;
    const base = container.getBoundingClientRect();
    setSvgSize({ w: container.scrollWidth, h: container.scrollHeight });
    const dcs = hosts.filter((h) => h.role === "dc");
    const targets = hosts.filter(
      (h) => h.role !== "dc" && DOMAIN_SECTORS.has(h.sector),
    );
    const center = (id: number) => {
      const el = blipRefs.current.get(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
    };
    const out: { x1: number; y1: number; x2: number; y2: number }[] = [];
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

  useLayoutEffect(() => {
    recomputeLines();
  }, [recomputeLines]);

  useEffect(() => {
    const onResize = () => recomputeLines();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [recomputeLines]);

  const setBlipRef = (id: number) => (el: HTMLElement | null) => {
    if (el) blipRefs.current.set(id, el);
    else blipRefs.current.delete(id);
  };

  return (
    <div className={styles.root}>
      <div className={styles.sweep} />
      <div className={styles.scan} />

      <header className={styles.header}>
        <Link href={`/engagements/${engagementId}`} className={styles.back}>
          ◂ КАРТОЧКИ
        </Link>
        <Link href={`/engagements/${engagementId}/timeline`} className={styles.back}>
          ⏱ TIMELINE
        </Link>
        <div className={styles.opName}>
          <span className={styles.opLabel}>OPERATION:</span> {engagementName}
        </div>
        <div className={styles.stats}>
          <div className={styles.statBox}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="1" width="10" height="14" rx="1.5"/><line x1="5.5" y1="4" x2="10.5" y2="4"/><line x1="5.5" y1="7" x2="10.5" y2="7"/></svg>
            <b>{hosts.length}</b>
            <span>HOSTS</span>
          </div>
          <div className={styles.statBox} style={{ color: "var(--t-high)" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" stroke="none"><path d="M8 1l2 5h5l-4 3.5 1.5 5.5L8 11.5 3.5 15 5 9.5 1 6h5z"/></svg>
            <b>{highValue}</b>
            <span>HIGH VALUE</span>
          </div>
          <div className={styles.statBox} style={{ color: "#f4a261" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="12" height="9" rx="1"/><circle cx="8" cy="8.5" r="2"/></svg>
            <b>{totals.creds}</b>
            <span>CREDS</span>
          </div>
          <div className={styles.statBox}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="8" y1="11" x2="8" y2="14"/><line x1="2" y1="8" x2="5" y2="8"/><line x1="11" y1="8" x2="14" y2="8"/></svg>
            <b>{totals.ports}</b>
            <span>PORTS</span>
          </div>
          <div className={styles.statBox} style={{ color: "var(--t-crit)" }}>
            <b>{totals.crit}</b>
            <span>CRIT</span>
          </div>
          <div className={styles.statBox} style={{ color: "var(--t-high)" }}>
            <b>{totals.high}</b>
            <span>HIGH</span>
          </div>
          <div className={styles.statBox} style={{ color: "var(--t-med)" }}>
            <b>{totals.med}</b>
            <span>MED</span>
          </div>
          <div
            className={styles.threat}
            style={
              threat === "LOW"
                ? { color: "var(--t-low)", borderColor: "var(--t-low)", animation: "none", textShadow: "none" }
                : undefined
            }
          >
            {threat}
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.mapArea}>
          {/* operation brief (replaces minimap) */}
          <NetworkBrief
            engagementId={engagementId}
            intel={networkIntel}
            defenses={networkDefenses}
            hostCount={hosts.length}
          />

          {/* sectors with operation graph overlay */}
          <div className={styles.sectors} ref={sectorsRef}>
            <svg
              className={styles.graph}
              width={svgSize.w}
              height={svgSize.h}
              viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
            >
              {lines.map((l, i) => (
                <line
                  key={i}
                  className={styles.graphLine}
                  x1={l.x1}
                  y1={l.y1}
                  x2={l.x2}
                  y2={l.y2}
                />
              ))}
            </svg>

            {sectorGroups.map((g) => (
              <div
                key={g.def.key}
                className={`${styles.sector} ${g.hosts.length > 4 ? styles.sectorFull : ""}`}
              >
                <div className={styles.shead}>
                  <b>{g.def.title}</b>
                  <span>{g.def.desc}</span>
                  <span className={styles.scnt}>{g.hosts.length} цел.</span>
                </div>
                <div className={styles.blips}>
                  {g.hosts.map((h) => (
                    <Blip
                      key={h.id}
                      host={h}
                      selected={h.id === selectedId}
                      onSelect={onSelect}
                      innerRef={setBlipRef(h.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* role legend */}
          <div className={styles.roleLegend}>
            {Object.entries(ROLE_COLOR).filter(([k]) => !["ipmi"].includes(k)).map(([role, color]) => (
              <div key={role} className={styles.roleLegendItem}>
                <span className={styles.roleLegendHex} style={{ background: color }}><RoleIcon role={role} size={11} /></span>
                <span>{role === "dc" ? "DOMAIN CTRL" : role === "mssql" ? "DATABASE" : role === "ilo" ? "iLO / IPMI" : role === "backup" ? "BACKUP" : role === "printer" ? "PRINTER" : role === "camera" ? "CAMERA" : role === "windows" ? "WORKSTATION" : "SERVER"}</span>
              </div>
            ))}
            <div className={styles.roleLegendSep} />
            <div className={styles.roleLegendItem}>
              <span className={styles.roleLegendLine} />
              <span>NETWORK CONN</span>
            </div>
            <div className={styles.roleLegendItem}>
              <span className={styles.roleLegendLineDash} />
              <span>DOMAIN LINK</span>
            </div>
          </div>

          <div className={styles.legend}>
            <span><i style={{ background: "var(--t-crit)" }} />CRIT</span>
            <span><i style={{ background: "var(--t-high)" }} />HIGH</span>
            <span><i style={{ background: "var(--t-med)" }} />MED</span>
            <span><i style={{ background: "var(--t-low)" }} />LOW</span>
            <span><i style={{ background: "var(--t-owned)" }} />OWNED</span>
            <span style={{ marginLeft: "auto" }}>
              {engagementName} · клик по цели → разведданные
            </span>
          </div>
        </div>

        <IntelPanel engagementId={engagementId} host={selected} />
      </div>

      {reticle && (
        <div
          key={reticle.key}
          className={styles.reticle}
          style={{ left: reticle.x, top: reticle.y }}
        />
      )}
    </div>
  );
}


function riskScore(h: MapHost): number {
  return h.counts.crit * 40 + h.counts.high * 20 + h.counts.med * 8 + h.counts.low * 2;
}
function riskColor(score: number): string {
  if (score >= 80) return "var(--t-crit)";
  if (score >= 40) return "var(--t-high)";
  if (score >= 10) return "var(--t-med)";
  return "var(--t-low)";
}

function Blip({
  host,
  selected,
  onSelect,
  innerRef,
}: {
  host: MapHost;
  selected: boolean;
  onSelect: (h: MapHost, ev?: React.MouseEvent) => void;
  innerRef: (el: HTMLElement | null) => void;
}) {
  const sev = topSev(host.counts);
  const score = riskScore(host);
  const rc = riskColor(score);
  const roleColor = ROLE_COLOR[host.role] || "#48bfe3";
  return (
    <div
      role="button"
      tabIndex={0}
      ref={innerRef}
      className={[
        styles.blip,
        SEV_CLASS[sev],
        selected ? styles.selected : "",
        host.opStatus === "owned" ? styles.isOwned : "",
        host.opStatus === "dismissed" ? styles.isDismissed : "",
      ].join(" ")}
      onClick={(e) => onSelect(host, e)}
    >
      <span className={`${styles.statusChip} ${STATUS_CLASS[host.opStatus] ?? ""}`}>
        {host.opStatus}
      </span>
      <div className={styles.icoLarge} style={{ background: roleColor }}>
        <RoleIcon role={host.role} size={26} />
      </div>
      <div className={styles.blipName}>{host.hostname || host.roleLabel}</div>
      <div className={styles.blipIp}>{host.ip}</div>
      {host.osShortStr && (
        <div className={styles.blipOs}>
          <span>{host.osIconStr}</span> {host.osShortStr}
        </div>
      )}
      <div className={styles.blipRisk} style={{ color: rc }}>
        RISK: {score}
      </div>
      {host.priority > 0 && (
        <span className={styles.priStars}>{"★".repeat(host.priority)}</span>
      )}
    </div>
  );
}
