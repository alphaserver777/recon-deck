import { WidgetCard } from "./WidgetCard";
import {
  MOCK_HOSTS,
  MOCK_EDGES,
  ROLE_COLORS,
  type MockHost,
  type MapEdge,
} from "@/lib/mock-data";

const W = 700;
const H = 420;
const S = 20;

function edgeStyle(type: MapEdge["type"]) {
  switch (type) {
    case "trust":
      return { stroke: "var(--fg-subtle)", strokeDasharray: "none", strokeWidth: 1.2 };
    case "connection":
      return { stroke: "var(--fg-subtle)", strokeDasharray: "6 4", strokeWidth: 1 };
    case "pivot":
      return { stroke: "var(--risk-crit)", strokeDasharray: "4 3", strokeWidth: 1.5 };
  }
}

function NodeIcon({ role, color }: { role: MockHost["role"]; color: string }) {
  switch (role) {
    case "domain-controller":
      return (
        <g>
          {/* Shield shape */}
          <path
            d="M0,-16 L14,-8 L14,6 C14,12 0,18 0,18 C0,18 -14,12 -14,6 L-14,-8 Z"
            fill="var(--bg-2)"
            stroke={color}
            strokeWidth={2}
          />
          {/* Crown icon inside */}
          <path
            d="M-7,4 L-7,-2 L-3.5,-5 L0,-1 L3.5,-5 L7,-2 L7,4 Z"
            fill={color}
            opacity={0.85}
          />
          <line x1={-7} y1={5} x2={7} y2={5} stroke={color} strokeWidth={1.5} />
        </g>
      );
    case "server":
      return (
        <g>
          {/* Hexagon */}
          <polygon
            points="0,-17 15,-8.5 15,8.5 0,17 -15,8.5 -15,-8.5"
            fill="var(--bg-2)"
            stroke={color}
            strokeWidth={2}
          />
          {/* Server rack lines inside */}
          <rect x={-7} y={-8} width={14} height={4} rx={1} fill="none" stroke={color} strokeWidth={1} />
          <rect x={-7} y={-2} width={14} height={4} rx={1} fill="none" stroke={color} strokeWidth={1} />
          <rect x={-7} y={4} width={14} height={4} rx={1} fill="none" stroke={color} strokeWidth={1} />
          <circle cx={4} cy={-6} r={1} fill={color} />
          <circle cx={4} cy={0} r={1} fill={color} />
          <circle cx={4} cy={6} r={1} fill={color} />
        </g>
      );
    case "workstation":
      return (
        <g>
          {/* Pentagon */}
          <polygon
            points="0,-17 16,-5 10,15 -10,15 -16,-5"
            fill="var(--bg-2)"
            stroke={color}
            strokeWidth={2}
          />
          {/* Monitor icon inside */}
          <rect x={-8} y={-9} width={16} height={11} rx={1.5} fill="none" stroke={color} strokeWidth={1.2} />
          <line x1={0} y1={2} x2={0} y2={6} stroke={color} strokeWidth={1.2} />
          <line x1={-4} y1={6} x2={4} y2={6} stroke={color} strokeWidth={1.2} />
        </g>
      );
    case "entry-point":
      return (
        <g>
          {/* Outer pulse rings */}
          <circle cx={0} cy={0} r={22} fill="none" stroke={color} strokeWidth={0.8} opacity={0.15}>
            <animate attributeName="r" from="18" to="28" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={0} cy={0} r={18} fill="none" stroke={color} strokeWidth={0.8} opacity={0.25}>
            <animate attributeName="r" from="16" to="24" dur="2s" begin="0.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.4" to="0" dur="2s" begin="0.7s" repeatCount="indefinite" />
          </circle>
          {/* Diamond/router shape */}
          <polygon
            points="0,-16 16,0 0,16 -16,0"
            fill="var(--bg-2)"
            stroke={color}
            strokeWidth={2}
          />
          {/* Globe/network icon inside */}
          <circle cx={0} cy={0} r={6} fill="none" stroke={color} strokeWidth={1} />
          <ellipse cx={0} cy={0} rx={3} ry={6} fill="none" stroke={color} strokeWidth={0.8} />
          <line x1={-6} y1={0} x2={6} y2={0} stroke={color} strokeWidth={0.8} />
        </g>
      );
    case "iot":
      return (
        <g>
          <circle cx={0} cy={0} r={16} fill="var(--bg-2)" stroke={color} strokeWidth={2} />
          <circle cx={0} cy={2} r={3} fill={color} opacity={0.7} />
          <path d="M-5,-4 A7,7 0 0,1 5,-4" fill="none" stroke={color} strokeWidth={1.2} />
          <path d="M-9,-8 A12,12 0 0,1 9,-8" fill="none" stroke={color} strokeWidth={1} />
        </g>
      );
  }
}

export function NetworkMapWidget() {
  const hostMap = new Map(MOCK_HOSTS.map((h) => [h.id, h]));

  return (
    <WidgetCard title="NETWORK MAP" gridArea="map" noPad>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", height: "100%" }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid background */}
          <defs>
            <pattern id="grid" width={40} height={40} patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="var(--border)"
                strokeWidth={0.5}
                opacity={0.4}
              />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#grid)" />

          {/* Edges */}
          {MOCK_EDGES.map((e, i) => {
            const from = hostMap.get(e.from);
            const to = hostMap.get(e.to);
            if (!from || !to) return null;
            const style = edgeStyle(e.type);
            return (
              <line
                key={`e-${i}`}
                x1={from.mapX * W}
                y1={from.mapY * H}
                x2={to.mapX * W}
                y2={to.mapY * H}
                {...style}
                opacity={0.7}
              />
            );
          })}

          {/* Nodes */}
          {MOCK_HOSTS.map((h) => {
            const cx = h.mapX * W;
            const cy = h.mapY * H;
            const color = ROLE_COLORS[h.role];
            return (
              <g key={h.id}>
                {/* Glow behind node */}
                <circle cx={cx} cy={cy} r={S + 8} fill={color} opacity={0.06} />

                {/* Icon shape (translated to node center) */}
                <g transform={`translate(${cx}, ${cy})`}>
                  <NodeIcon role={h.role} color={color} />
                </g>

                {/* Hostname */}
                <text
                  x={cx}
                  y={cy + S + 10}
                  textAnchor="middle"
                  fill="var(--fg)"
                  fontSize={9}
                  fontWeight={600}
                  fontFamily="var(--font-mono)"
                >
                  {h.hostname}
                </text>
                {/* IP */}
                <text
                  x={cx}
                  y={cy + S + 20}
                  textAnchor="middle"
                  fill="var(--fg-subtle)"
                  fontSize={7}
                  fontFamily="var(--font-mono)"
                >
                  {h.ip}
                </text>
                {/* Risk score or ENTRY POINT label */}
                {h.role === "entry-point" ? (
                  <text
                    x={cx}
                    y={cy + S + 30}
                    textAnchor="middle"
                    fill={color}
                    fontSize={7}
                    fontWeight={700}
                    fontFamily="var(--font-mono)"
                    letterSpacing="0.08em"
                  >
                    ENTRY POINT
                  </text>
                ) : h.riskScore > 0 ? (
                  <text
                    x={cx}
                    y={cy + S + 30}
                    textAnchor="middle"
                    fill={color}
                    fontSize={7.5}
                    fontWeight={700}
                    fontFamily="var(--font-mono)"
                  >
                    RISK: {h.riskScore}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        {/* Legend (bottom-left overlay) */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 12,
            display: "flex",
            flexDirection: "column",
            gap: 5,
            fontSize: 9.5,
            color: "var(--fg-muted)",
            background: "rgba(10,14,20,0.8)",
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid var(--border)",
          }}
        >
          <LegendItem shape="shield" color="var(--risk-crit)" label="DOMAIN CONTROLLER" />
          <LegendItem shape="hex" color="#4ade80" label="SERVER" />
          <LegendItem shape="pent" color="var(--risk-low)" label="WORKSTATION" />
          <LegendItem shape="diamond" color="var(--risk-med)" label="IOT / OTHER" />
          <LegendItem shape="diamond" color="var(--risk-crit)" label="ENTRY POINT" />
          <div className="flex items-center gap-1.5 mt-1">
            <svg width={20} height={6}><line x1={0} y1={3} x2={20} y2={3} stroke="var(--fg-subtle)" strokeWidth={1.2} /></svg>
            <span>TRUST / RELATION</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width={20} height={6}><line x1={0} y1={3} x2={20} y2={3} stroke="var(--fg-subtle)" strokeWidth={1} strokeDasharray="4 3" /></svg>
            <span>NETWORK CONNECTION</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width={20} height={6}><line x1={0} y1={3} x2={20} y2={3} stroke="var(--risk-crit)" strokeWidth={1.5} strokeDasharray="4 3" /></svg>
            <span>PIVOT PATH</span>
          </div>
        </div>

        {/* Zoom controls placeholder */}
        <div
          className="mono flex items-center gap-1"
          style={{
            position: "absolute",
            bottom: 10,
            right: 12,
            fontSize: 11,
            color: "var(--fg-subtle)",
          }}
        >
          <ZoomBtn>−</ZoomBtn>
          <span style={{ padding: "0 4px" }}>100%</span>
          <ZoomBtn>+</ZoomBtn>
          <ZoomBtn>⤢</ZoomBtn>
        </div>
      </div>
    </WidgetCard>
  );
}

function LegendItem({ shape, color, label }: { shape: string; color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <svg width={12} height={12} viewBox="0 0 12 12">
        {shape === "shield" && (
          <path d="M6,1 L11,4 L11,7 C11,9 6,11 6,11 C6,11 1,9 1,7 L1,4 Z" fill={color} opacity={0.8} />
        )}
        {shape === "hex" && (
          <polygon points="6,1 11,3.5 11,8.5 6,11 1,8.5 1,3.5" fill={color} opacity={0.8} />
        )}
        {shape === "pent" && (
          <polygon points="6,1 11,4.5 9,10.5 3,10.5 1,4.5" fill={color} opacity={0.8} />
        )}
        {shape === "diamond" && (
          <polygon points="6,1 11,6 6,11 1,6" fill={color} opacity={0.8} />
        )}
      </svg>
      <span>{label}</span>
    </div>
  );
}

function ZoomBtn({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        width: 24,
        height: 24,
        display: "inline-grid",
        placeItems: "center",
        background: "var(--bg-3)",
        border: "1px solid var(--border)",
        borderRadius: 4,
        cursor: "default",
      }}
    >
      {children}
    </span>
  );
}
