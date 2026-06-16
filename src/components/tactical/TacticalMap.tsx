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
import { IntelPanel } from "./IntelPanel";
import styles from "./TacticalMap.module.css";

const SEV_CLASS: Record<Sev, string> = {
  crit: styles.sevCrit,
  high: styles.sevHigh,
  med: styles.sevMed,
  low: styles.sevLow,
  info: styles.sevInfo,
};
const CELL_SEV_CLASS: Record<Sev, string> = {
  crit: styles.cCrit,
  high: styles.cHigh,
  med: styles.cMed,
  low: styles.cLow,
  info: styles.cInfo,
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
}

// sectors that form the "domain side" the DC graph links to
const DOMAIN_SECTORS = new Set(["COMMAND", "DATABASES", "SERVERS", "ENDPOINTS"]);

export function TacticalMap({ engagementId, engagementName, hosts }: Props) {
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
    const t = { crit: 0, high: 0, med: 0, low: 0 };
    for (const h of hosts) {
      t.crit += h.counts.crit;
      t.high += h.counts.high;
      t.med += h.counts.med;
      t.low += h.counts.low;
    }
    return t;
  }, [hosts]);
  const threat = totals.crit ? "CRITICAL" : totals.high ? "HIGH" : totals.med ? "ELEVATED" : "LOW";

  // /24 subnet prefix = most common first-3-octets
  const subnet = useMemo(() => {
    const counts = new Map<string, number>();
    for (const h of hosts) {
      const pre = h.ip.split(".").slice(0, 3).join(".");
      counts.set(pre, (counts.get(pre) ?? 0) + 1);
    }
    let best = "";
    let bestN = -1;
    for (const [k, n] of counts) if (n > bestN) ((best = k), (bestN = n));
    return best;
  }, [hosts]);

  const hostByOctet = useMemo(() => {
    const m = new Map<number, MapHost>();
    for (const h of hosts) {
      if (h.ip.split(".").slice(0, 3).join(".") !== subnet) continue;
      const oct = Number(h.ip.split(".").pop());
      if (Number.isInteger(oct)) m.set(oct, h);
    }
    return m;
  }, [hosts, subnet]);

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
        <h1 className={styles.title}>
          ◢ TACTICAL <span>MAP</span>
        </h1>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <b>{hosts.length}</b>
            <span>ЦЕЛЕЙ</span>
          </div>
          <div className={styles.stat} style={{ color: "var(--t-crit)" }}>
            <b>{totals.crit}</b>
            <span>CRIT</span>
          </div>
          <div className={styles.stat} style={{ color: "var(--t-high)" }}>
            <b>{totals.high}</b>
            <span>HIGH</span>
          </div>
          <div className={styles.stat} style={{ color: "var(--t-med)" }}>
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
            УГРОЗА: {threat}
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.mapArea}>
          {/* minimap /24 */}
          <div className={styles.minimap}>
            <div className={styles.minimapHead}>
              <b>МИНИ-КАРТА</b>
              <span>{subnet}.0/24 · {hostByOctet.size} живых</span>
            </div>
            <div className={styles.grid24}>
              {Array.from({ length: 256 }, (_, i) => {
                const h = hostByOctet.get(i);
                if (!h) {
                  return <div key={i} className={styles.cell} title={`${subnet}.${i}`} />;
                }
                const sev = topSev(h.counts);
                const cls =
                  h.opStatus === "owned"
                    ? styles.cOwned
                    : CELL_SEV_CLASS[sev];
                return (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.cell} ${styles.cellLive} ${cls} ${
                      h.id === selectedId ? styles.cellSelected : ""
                    }`}
                    title={`${h.ip} — ${h.roleLabel}`}
                    onClick={(e) => onSelect(h, e)}
                  />
                );
              })}
            </div>
          </div>

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

          <div className={styles.legend}>
            <span><i style={{ background: "var(--t-crit)" }} />CRIT</span>
            <span><i style={{ background: "var(--t-high)" }} />HIGH</span>
            <span><i style={{ background: "var(--t-med)" }} />MED</span>
            <span><i style={{ background: "var(--t-low)" }} />LOW</span>
            <span><i style={{ background: "var(--t-owned)" }} />OWNED</span>
            <span style={{ marginLeft: "auto" }}>
              {engagementName} · клик по цели → разведданные · линии = домен ↔ DC
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
  const oct = host.ip.split(".").pop();
  const badge = (n: number, cls: string) => (
    <div className={`${styles.badge} ${n ? cls : styles.bZero}`}>{n || "·"}</div>
  );
  return (
    <button
      type="button"
      ref={innerRef as (el: HTMLButtonElement | null) => void}
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
      <div className={styles.ico}>{host.icon}</div>
      <div className={styles.ip}>
        .{oct} <span className={styles.ipFull}>{host.ip}</span>
      </div>
      <div className={styles.hn}>{host.hostname || " "}</div>
      <div className={styles.ro}>{host.roleLabel}</div>
      <div className={styles.badges}>
        {badge(host.counts.crit, styles.bCrit)}
        {badge(host.counts.high, styles.bHigh)}
        {badge(host.counts.med, styles.bMed)}
        {badge(host.counts.low, styles.bLow)}
      </div>
      {host.priority > 0 && (
        <span className={styles.priStars}>{"★".repeat(host.priority)}</span>
      )}
    </button>
  );
}
