"use client";

import { WidgetCard } from "./WidgetCard";
import { DonutChart, DonutLegend } from "./DonutChart";
import type { DashboardData } from "@/lib/ops-views/dashboard-vm";
import type {
  ChartSegment,
  EntryPoint,
  TopTarget,
  TimelineEvent,
  Objective,
  CredStat,
  MockHost,
  PivotPath,
  MitreTechnique,
} from "@/lib/ops-views/types";
import { Globe, KeyRound, Lock, Hash, ShieldCheck } from "lucide-react";

function scoreColor(s: number): string {
  if (s >= 80) return "var(--risk-crit)";
  if (s >= 50) return "var(--risk-high)";
  if (s >= 20) return "var(--risk-med)";
  return "var(--risk-low)";
}

export function DashboardClient({ data }: { data: DashboardData }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 280px 200px",
        gridTemplateRows: "minmax(180px, 1fr) minmax(180px, 1fr) minmax(200px, auto) minmax(180px, auto)",
        gridTemplateAreas: `
          "map     map     map     host    obj"
          "map     map     map     host    targets"
          "entry   timeline pivot   mitre   notes"
          "risk    role    os      creds   creds"
        `,
        gap: 12,
        padding: 16,
        height: "100%",
        minHeight: 0,
      }}
    >
      <NetworkMapWidget hosts={data.selectedHost ? [data.selectedHost] : []} />
      <HostDetailWidget host={data.selectedHost} />
      <ObjectivesWidget objectives={data.objectives} />
      <TopTargetsWidget targets={data.topTargets} />
      <EntryPointsWidget entryPoints={data.entryPoints} />
      <TimelineWidget events={data.timelineEvents} />
      <PivotPathsWidget paths={data.pivotPaths} />
      <MitreCoverageWidget techniques={data.mitreTechniques} />
      <NotesWidget notes={data.notes} />
      <RiskDistWidget segments={data.riskDist} />
      <HostsByRoleWidget segments={data.hostsByRole} />
      <OsDistWidget segments={data.osDist} />
      <CredsOverviewWidget stats={data.credStats} />
    </div>
  );
}

function NetworkMapWidget({ hosts }: { hosts: MockHost[] }) {
  return (
    <WidgetCard title="NETWORK MAP" gridArea="map" noPad>
      <div className="relative w-full h-full" style={{ background: "var(--bg-0)", minHeight: 200 }}>
        <svg width="100%" height="100%" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="300" cy="150" r="120" fill="url(#glow)" />
          {hosts.length === 0 && (
            <text x="300" y="155" textAnchor="middle" fill="var(--fg-subtle)" fontSize="12" fontFamily="var(--font-mono)">
              НЕТ ХОСТОВ
            </text>
          )}
          {hosts.map((h, i) => {
            const angle = (i / Math.max(hosts.length, 1)) * Math.PI * 2 - Math.PI / 2;
            const cx = 300 + Math.cos(angle) * 80;
            const cy = 150 + Math.sin(angle) * 80;
            return (
              <g key={h.id}>
                <circle cx={cx} cy={cy} r="6" fill="var(--accent)" opacity="0.8" />
                <text x={cx} y={cy + 16} textAnchor="middle" fill="var(--fg-muted)" fontSize="8" fontFamily="var(--font-mono)">
                  {h.hostname}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </WidgetCard>
  );
}

function HostDetailWidget({ host }: { host: MockHost | null }) {
  if (!host) {
    return (
      <WidgetCard title="HOST DETAIL" gridArea="host">
        <div style={{ color: "var(--fg-subtle)", fontSize: 12, textAlign: "center", paddingTop: 30 }}>
          Нет данных
        </div>
      </WidgetCard>
    );
  }
  return (
    <WidgetCard title="HOST DETAIL" gridArea="host">
      <div className="flex flex-col gap-2" style={{ fontSize: 12 }}>
        <div className="mono font-semibold" style={{ color: "var(--accent)", fontSize: 14 }}>{host.hostname}</div>
        <div style={{ color: "var(--fg-muted)" }}>{host.ip}</div>
        <div style={{ color: "var(--fg-subtle)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{host.role}</div>
        <div style={{ color: "var(--fg-muted)", fontSize: 11 }}>{host.os}</div>
        {host.domain && <div className="mono" style={{ color: "var(--fg-subtle)", fontSize: 10 }}>{host.domain}</div>}
        <div className="mt-1">
          <div className="mono" style={{ fontSize: 9, color: "var(--fg-subtle)", letterSpacing: "0.1em" }}>RISK SCORE</div>
          <div className="flex items-center gap-2 mt-1">
            <div style={{ flex: 1, height: 4, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(host.riskScore, 100)}%`, height: "100%", background: scoreColor(host.riskScore), borderRadius: 99 }} />
            </div>
            <span className="mono font-bold" style={{ color: scoreColor(host.riskScore), fontSize: 13 }}>{host.riskScore}</span>
          </div>
        </div>
        {host.attackSurface.length > 0 && (
          <div className="mt-1">
            <div className="mono" style={{ fontSize: 9, color: "var(--fg-subtle)", letterSpacing: "0.1em", marginBottom: 4 }}>ATTACK SURFACE</div>
            <div className="flex flex-wrap gap-1">
              {host.attackSurface.map((tag: string) => (
                <span key={tag} className="mono" style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: "var(--bg-3)", color: "var(--fg-muted)" }}>{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}

function ObjectivesWidget({ objectives }: { objectives: Objective[] }) {
  return (
    <WidgetCard title="OBJECTIVES" gridArea="obj">
      {objectives.length === 0 ? (
        <div style={{ color: "var(--fg-subtle)", fontSize: 11 }}>Нет целей</div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {objectives.map((o: Objective) => (
            <label key={o.label} className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 11.5 }}>
              <span style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${o.checked ? "var(--accent)" : "var(--border)"}`, background: o.checked ? "var(--accent-soft)" : "transparent", display: "grid", placeItems: "center", color: "var(--accent)", fontSize: 10 }}>
                {o.checked && "✓"}
              </span>
              <span style={{ color: o.checked ? "var(--fg-muted)" : "var(--fg)", textDecoration: o.checked ? "line-through" : "none" }}>{o.label}</span>
            </label>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

function TopTargetsWidget({ targets }: { targets: TopTarget[] }) {
  return (
    <WidgetCard title="TOP TARGETS" gridArea="targets">
      <div className="flex flex-col gap-2">
        {targets.map((t: TopTarget, i: number) => {
          const color = scoreColor(t.score);
          return (
            <div key={t.hostname} className="flex items-center gap-2" style={{ fontSize: 12 }}>
              <span className="mono font-semibold" style={{ width: 18, color: "var(--fg-subtle)", fontSize: 11 }}>{i + 1}.</span>
              <span className="mono font-semibold" style={{ flex: 1, color }}>{t.hostname}</span>
              <span className="mono font-bold" style={{ color, fontSize: 13 }}>{t.score}</span>
            </div>
          );
        })}
        {targets.length === 0 && <div style={{ color: "var(--fg-subtle)", fontSize: 11 }}>Нет данных</div>}
      </div>
    </WidgetCard>
  );
}

function EntryPointsWidget({ entryPoints }: { entryPoints: EntryPoint[] }) {
  return (
    <WidgetCard title="ENTRY POINTS" gridArea="entry">
      <div className="flex flex-col gap-2">
        {entryPoints.map((ep: EntryPoint) => (
          <div key={`${ep.ip}:${ep.port}`} className="flex items-center gap-2.5" style={{ fontSize: 12 }}>
            <Globe size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
            <span className="mono" style={{ color: "var(--fg)" }}>{ep.ip}:{ep.port}</span>
            <span className="mono" style={{ color: "var(--fg-subtle)", fontSize: 10 }}>{ep.protocol}</span>
            <span style={{ marginLeft: "auto", color: "var(--fg-muted)", fontSize: 11 }}>{ep.label}</span>
          </div>
        ))}
        {entryPoints.length === 0 && <div style={{ color: "var(--fg-subtle)", fontSize: 11 }}>Нет точек входа</div>}
      </div>
    </WidgetCard>
  );
}

function TimelineWidget({ events }: { events: TimelineEvent[] }) {
  return (
    <WidgetCard title="TIMELINE" gridArea="timeline">
      <div className="flex flex-col gap-2">
        {events.map((ev: TimelineEvent, i: number) => (
          <div key={i} className="flex items-start gap-2.5" style={{ fontSize: 11.5 }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: ev.color, flexShrink: 0, marginTop: 4 }} />
            <div>
              <span className="mono" style={{ color: "var(--fg-subtle)", fontSize: 10 }}>{ev.time}</span>
              <div style={{ color: "var(--fg-muted)" }}>{ev.label}</div>
            </div>
          </div>
        ))}
        {events.length === 0 && <div style={{ color: "var(--fg-subtle)", fontSize: 11 }}>Нет событий</div>}
      </div>
    </WidgetCard>
  );
}

function PivotPathsWidget({ paths }: { paths: PivotPath[] }) {
  return (
    <WidgetCard title="PIVOT PATHS" gridArea="pivot">
      {paths.length === 0 ? (
        <div style={{ color: "var(--fg-subtle)", fontSize: 11 }}>Нет путей атаки</div>
      ) : (
        <div className="flex flex-col gap-3">
          {paths.map((p: PivotPath) => (
            <div key={p.id}>
              <div className="flex items-center gap-1.5" style={{ fontSize: 11 }}>
                {p.nodes.map((node: string, i: number) => (
                  <span key={i}>
                    <span className="mono font-semibold" style={{ color: i === p.nodes.length - 1 ? "var(--risk-crit)" : "var(--fg)" }}>{node}</span>
                    {i < p.nodes.length - 1 && <span style={{ color: "var(--fg-subtle)", margin: "0 2px" }}>→</span>}
                  </span>
                ))}
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--risk-high)", marginTop: 2 }}>{p.probability}%</div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

function MitreCoverageWidget({ techniques }: { techniques: MitreTechnique[] }) {
  return (
    <WidgetCard title="MITRE ATT&CK" gridArea="mitre">
      {techniques.length === 0 ? (
        <div style={{ color: "var(--fg-subtle)", fontSize: 11 }}>Нет данных</div>
      ) : (
        <div className="flex flex-col gap-2">
          {techniques.map((t: MitreTechnique) => (
            <div key={t.id}>
              <div className="flex items-center justify-between" style={{ fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: "var(--fg-muted)" }}>{t.name}</span>
                <span className="mono" style={{ color: "var(--fg-subtle)", fontSize: 10 }}>{t.coverage}%</span>
              </div>
              <div style={{ height: 3, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${t.coverage}%`, height: "100%", background: "var(--accent)", borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

function NotesWidget({ notes }: { notes: string[] }) {
  return (
    <WidgetCard title="NOTES" gridArea="notes">
      {notes.length === 0 ? (
        <div style={{ color: "var(--fg-subtle)", fontSize: 11 }}>Нет заметок</div>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((n: string, i: number) => (
            <div key={i} style={{ fontSize: 11, color: "var(--fg-muted)", padding: "4px 0", borderBottom: "1px solid var(--border)" }}>{n}</div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

function RiskDistWidget({ segments }: { segments: ChartSegment[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  return (
    <WidgetCard title="RISK SCORE DISTRIBUTION" gridArea="risk">
      <div className="flex items-center gap-4">
        <DonutChart segments={segments} size={110} centerLabel={String(total)} centerSub="TOTAL" />
        <DonutLegend segments={segments} />
      </div>
    </WidgetCard>
  );
}

function HostsByRoleWidget({ segments }: { segments: ChartSegment[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  return (
    <WidgetCard title="HOSTS BY ROLE" gridArea="role">
      <div className="flex items-center gap-4">
        <DonutChart segments={segments} size={110} centerLabel={String(total)} centerSub="HOSTS" />
        <DonutLegend segments={segments} />
      </div>
    </WidgetCard>
  );
}

function OsDistWidget({ segments }: { segments: ChartSegment[] }) {
  return (
    <WidgetCard title="OS DISTRIBUTION" gridArea="os">
      <div className="flex items-center gap-4">
        <DonutChart segments={segments} size={110} />
        <DonutLegend segments={segments} />
      </div>
    </WidgetCard>
  );
}

const CRED_ICONS: Record<string, React.ReactNode> = {
  "🔑": <KeyRound size={16} />,
  "📝": <Lock size={16} />,
  "#️⃣": <Hash size={16} />,
};

function CredsOverviewWidget({ stats }: { stats: CredStat[] }) {
  return (
    <WidgetCard title="CREDENTIALS OVERVIEW" gridArea="creds">
      <div className="flex gap-4">
        {stats.map((c: CredStat) => (
          <div
            key={c.label}
            className="flex items-center gap-3"
            style={{
              flex: 1,
              padding: "10px 12px",
              background: "var(--bg-3)",
              borderRadius: 6,
              border: "1px solid var(--border)",
            }}
          >
            <span style={{ color: "var(--accent)" }}>{CRED_ICONS[c.icon] || <ShieldCheck size={16} />}</span>
            <div>
              <div className="mono font-bold" style={{ fontSize: 18, color: "var(--fg)" }}>{c.value}</div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: "0.1em", color: "var(--fg-subtle)" }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
