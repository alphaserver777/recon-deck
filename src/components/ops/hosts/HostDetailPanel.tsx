import { X, Terminal, Shield, Key, User } from "lucide-react";
import type { HostTableRow } from "@/lib/mock-data";
import { scoreColor } from "@/lib/mock-data";
import { MapRoleIcon } from "@/components/map/MapRoleIcon";
import type { MapRoleKey } from "@/lib/mock-data";

const VULN_COLORS: Record<string, string> = {
  CRITICAL: "var(--risk-crit)",
  HIGH: "var(--risk-high)",
  MEDIUM: "var(--risk-med)",
  LOW: "var(--risk-low)",
};

const ROLE_TO_MAP: Record<string, MapRoleKey> = {
  dc: "dc",
  mssql: "mssql",
  exchange: "exchange",
  backup: "backup",
  windows: "windows",
  camera: "camera",
  printer: "printer",
  host: "host",
  ilo: "ilo",
};

const ROLE_HEX_COLOR: Record<string, string> = {
  dc: "#e63946",
  mssql: "#f4a261",
  exchange: "#a855f7",
  backup: "#2a9d8f",
  windows: "#4895ef",
  camera: "#6c757d",
  printer: "#6c757d",
  host: "#48bfe3",
  ilo: "#457b9d",
};

export function HostDetailPanel({
  host,
  onClose,
}: {
  host: HostTableRow | null;
  onClose: () => void;
}) {
  if (!host) return null;

  const rc = scoreColor(host.riskScore);
  const mapRole = ROLE_TO_MAP[host.role] ?? "host";
  const hexColor = ROLE_HEX_COLOR[host.role] ?? "#48bfe3";
  const riskPct = Math.min(host.riskScore, 100);

  const sevLabel =
    host.riskScore >= 90
      ? "CRITICAL"
      : host.riskScore >= 70
        ? "HIGH"
        : host.riskScore >= 40
          ? "MEDIUM"
          : "LOW";

  return (
    <div
      className="flex flex-col shrink-0 overflow-y-auto"
      style={{
        width: 310,
        background: "var(--bg-1)",
        borderLeft: "1px solid var(--border)",
        padding: 0,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          className="mono"
          style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--fg-subtle)" }}
        >
          ПОДРОБНОСТИ ХОСТА
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--fg-subtle)",
            cursor: "pointer",
            padding: 2,
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Host identity */}
        <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              background: hexColor,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            <MapRoleIcon role={mapRole} size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-2">
              <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
                {host.hostname}
              </span>
              <span
                className="mono"
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 3,
                  color: rc,
                  background: `${rc}1a`,
                  border: `1px solid ${rc}33`,
                  letterSpacing: "0.08em",
                }}
              >
                {sevLabel}
              </span>
            </div>
            <div className="mono" style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>
              {host.ip}
            </div>
          </div>
        </div>

        {/* Properties */}
        <div className="flex flex-col gap-2" style={{ marginBottom: 16 }}>
          <PropRow label="Роль" value={host.roleLabel} />
          <PropRow label="ОС" value={host.os} />
          {host.domain && <PropRow label="Домен" value={host.domain} />}
          <PropRow label="Сегмент" value={host.segment} />
          <div className="flex items-center justify-between" style={{ padding: "4px 0" }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)", letterSpacing: "0.1em" }}>
              Уровень риска
            </span>
            <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: rc }}>
              {host.riskScore} / 100
            </span>
          </div>
          <div
            style={{
              height: 3,
              background: "var(--bg-3)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div style={{ width: `${riskPct}%`, height: "100%", background: rc, borderRadius: 2 }} />
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center justify-between" style={{ padding: "4px 0", marginBottom: 4 }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)", letterSpacing: "0.1em" }}>
            Доступность
          </span>
          <span className="flex items-center gap-1.5">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: host.availability === "online" ? "#22c55e" : "var(--risk-crit)",
              }}
            />
            <span className="mono" style={{ fontSize: 11, color: host.availability === "online" ? "#22c55e" : "var(--risk-crit)" }}>
              {host.availability === "online" ? "Доступен" : "Недоступен"}
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between" style={{ padding: "4px 0", marginBottom: 12 }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)", letterSpacing: "0.1em" }}>
            Последнее сканирование
          </span>
          <span className="mono" style={{ fontSize: 11, color: "var(--fg-muted)" }}>
            {host.lastScan}
          </span>
        </div>

        {/* Services */}
        <SectionHead icon={<Shield size={13} />} label="СЕРВИСЫ" count={host.services.length} />
        <div className="flex flex-wrap gap-1.5" style={{ marginBottom: 16 }}>
          {host.services.map((s) => (
            <span
              key={s}
              className="mono"
              style={{
                fontSize: 10,
                padding: "3px 8px",
                background: "var(--bg-3)",
                border: "1px solid var(--border)",
                borderRadius: 3,
                color: "var(--fg-muted)",
              }}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Vulnerabilities */}
        <SectionHead icon={<Shield size={13} />} label="УЯЗВИМОСТИ" count={host.vulns.length} />
        {host.vulns.length > 0 ? (
          <div className="flex flex-col gap-2" style={{ marginBottom: 16 }}>
            {host.vulns.map((v, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: VULN_COLORS[v.severity], flexShrink: 0 }} />
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {v.name}
                  </span>
                </div>
                <span
                  className="mono"
                  style={{
                    fontSize: 8.5,
                    fontWeight: 700,
                    padding: "1px 5px",
                    borderRadius: 2,
                    color: VULN_COLORS[v.severity],
                    letterSpacing: "0.06em",
                    flexShrink: 0,
                  }}
                >
                  {v.severity}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)", marginBottom: 16 }}>—</div>
        )}

        {/* Credentials */}
        <SectionHead icon={<Key size={13} />} label="УЧЕТНЫЕ ДАННЫЕ" count={host.creds.length} />
        {host.creds.length > 0 ? (
          <div className="flex flex-col gap-1.5" style={{ marginBottom: 16 }}>
            {host.creds.map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={11} style={{ color: "var(--fg-subtle)" }} />
                  <span className="mono" style={{ fontSize: 11, color: "var(--fg)" }}>{c.username}</span>
                </div>
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-subtle)", letterSpacing: 1.5 }}>
                  ••••••••
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)", marginBottom: 16 }}>—</div>
        )}

        {/* Notes */}
        {host.notes && (
          <>
            <SectionHead icon={null} label="ЗАМЕТКИ" />
            <div
              style={{
                fontSize: 11,
                color: "var(--fg-muted)",
                lineHeight: 1.5,
                marginBottom: 16,
                fontStyle: "italic",
              }}
            >
              {host.notes}
            </div>
          </>
        )}

        {/* Open in Terminal */}
        <button
          className="mono w-full flex items-center justify-center gap-2"
          style={{
            padding: "10px 0",
            background: "transparent",
            border: "1px solid var(--accent)",
            borderRadius: 4,
            color: "var(--accent)",
            fontSize: 10.5,
            letterSpacing: "0.12em",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <Terminal size={13} />
          ОТКРЫТЬ В ТЕРМИНАЛЕ
        </button>
      </div>
    </div>
  );
}

function PropRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: "4px 0" }}>
      <span className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)", letterSpacing: "0.1em" }}>
        {label}
      </span>
      <span className="mono" style={{ fontSize: 11, color: "var(--fg)" }}>{value}</span>
    </div>
  );
}

function SectionHead({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <div
      className="mono flex items-center gap-1.5"
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: "0.12em",
        color: "var(--fg)",
        marginBottom: 8,
        paddingBottom: 4,
        borderBottom: "1px solid var(--border)",
      }}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}> ({count})</span>
      )}
    </div>
  );
}
