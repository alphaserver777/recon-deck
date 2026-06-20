"use client";

import { useState } from "react";
import { Building2, Eye, EyeOff, Shield, ShieldCheck } from "lucide-react";
import type { Company } from "@/lib/ops-views/types";

const RISK_COLORS: Record<string, string> = {
  CRITICAL: "var(--risk-crit)",
  HIGH: "var(--risk-high)",
  MEDIUM: "var(--risk-med)",
  LOW: "var(--risk-low)",
};
const STATUS_COLORS: Record<string, string> = {
  recon: "var(--risk-low)",
  active: "var(--accent)",
  compromised: "var(--risk-high)",
  completed: "#22c55e",
};
const STATUS_LABELS: Record<string, string> = {
  recon: "РАЗВЕДКА",
  active: "АКТИВНА",
  compromised: "КОМПРОМЕТАЦИЯ",
  completed: "ЗАВЕРШЕНА",
};

export function CompanyClient({ company }: { company: Company }) {
  const [showPass, setShowPass] = useState(false);
  const riskColor = RISK_COLORS[company.riskLevel] || "var(--fg-subtle)";
  const statusColor = STATUS_COLORS[company.status] || "var(--fg-subtle)";

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
        <div
          style={{
            width: 56, height: 56,
            display: "flex", alignItems: "center", justifyContent: "center",
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            background: riskColor, color: "#fff", flexShrink: 0,
          }}
        >
          <Building2 size={28} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{company.name}</div>
          <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--fg-muted)" }}>{company.domain}</span>
            <Badge color={riskColor}>{company.riskLevel}</Badge>
            <Badge color={statusColor}>{STATUS_LABELS[company.status]}</Badge>
          </div>
        </div>
      </div>

      <Card>
        <PropRow label="Белый IP" value={company.whiteIp || "—"} accent />
        <PropRow label="Отрасль" value={company.industry || "—"} />
        <PropRow label="Сотрудники" value={company.employeeCount ? String(company.employeeCount) : "—"} />
        <PropRow label="Бюджет" value={company.budget ? `${company.budget.toLocaleString("ru-RU")} ₽` : "—"} />
      </Card>

      <Card title="VPN ДОСТУП" icon={<Shield size={13} />}>
        <PropRow label="Логин" value={company.vpnLogin || "—"} accent />
        <div className="flex items-center justify-between" style={{ padding: "4px 0" }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)", letterSpacing: "0.1em" }}>Пароль</span>
          <span className="flex items-center gap-2">
            <span className="mono" style={{ fontSize: 11, color: "#22c55e", letterSpacing: showPass ? 0 : 1.5 }}>
              {company.vpnPassword ? (showPass ? company.vpnPassword : "••••••••••") : "—"}
            </span>
            {company.vpnPassword && (
              <button
                onClick={() => setShowPass(!showPass)}
                style={{ background: "none", border: "none", color: "var(--fg-subtle)", cursor: "pointer", padding: 0 }}
              >
                {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            )}
          </span>
        </div>
      </Card>

      <Card title="СЗИ" icon={<ShieldCheck size={13} />} count={company.szi.length}>
        <div className="flex flex-wrap gap-1.5">
          {company.szi.length > 0 ? company.szi.map((s) => <Tag key={s} text={s} />) : <Empty />}
        </div>
      </Card>

      <Card title="САВЗ" icon={<Shield size={13} />} count={company.savz.length}>
        <div className="flex flex-wrap gap-1.5">
          {company.savz.length > 0 ? company.savz.map((s) => <Tag key={s} text={s} color="var(--risk-high)" />) : <Empty />}
        </div>
      </Card>

      <Card title="ЗАМЕТКИ">
        <div style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.6, fontStyle: company.notes ? "italic" : "normal" }}>
          {company.notes || "Нет заметок"}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)", letterSpacing: "0.1em" }}>ПРОГРЕСС</span>
          <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: statusColor }}>{company.progress}%</span>
        </div>
        <div style={{ height: 5, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: `${company.progress}%`, height: "100%", background: statusColor, borderRadius: 99, transition: "width 0.3s" }} />
        </div>
      </Card>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8, marginTop: 16,
      }}>
        <MiniStat label="ХОСТЫ" value={company.hostsDiscovered} />
        <MiniStat label="КРЕДЫ" value={company.credsFound} />
        <MiniStat label="УЯЗВ." value={company.vulnsFound} />
        <MiniStat label="ВХОДЫ" value={company.entryPoints} />
        <MiniStat label="HVT" value={company.highValueTargets} />
        <MiniStat label="ПУТИ" value={company.attackPaths} />
      </div>
    </div>
  );
}

function Card({ title, icon, count, children }: { title?: string; icon?: React.ReactNode; count?: number; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, marginBottom: 12 }}>
      {title && (
        <div className="mono flex items-center gap-1.5" style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", color: "var(--fg)",
          marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--border)",
        }}>
          {icon}
          {title}
          {count !== undefined && <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}> ({count})</span>}
        </div>
      )}
      {children}
    </div>
  );
}

function PropRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: "4px 0" }}>
      <span className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)", letterSpacing: "0.1em" }}>{label}</span>
      <span className="mono" style={{ fontSize: 11, color: accent ? "var(--accent)" : "var(--fg)", fontWeight: accent ? 600 : 400 }}>{value}</span>
    </div>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="mono" style={{
      fontSize: 8.5, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
      color, background: `${color}1a`, border: `1px solid ${color}33`,
      letterSpacing: "0.08em",
    }}>
      {children}
    </span>
  );
}

function Tag({ text, color }: { text: string; color?: string }) {
  return (
    <span className="mono" style={{
      fontSize: 10, padding: "3px 8px", background: "var(--bg-3)",
      border: `1px solid ${color ?? "var(--border)"}`,
      borderRadius: 3, color: color ?? "var(--fg-muted)",
    }}>
      {text}
    </span>
  );
}

function Empty() {
  return <span style={{ fontSize: 11, color: "var(--fg-subtle)" }}>Нет данных</span>;
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      padding: "8px 8px", background: "var(--bg-2)", border: "1px solid var(--border)",
      borderRadius: 6, textAlign: "center",
    }}>
      <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--fg)" }}>{value}</div>
      <div className="mono" style={{ fontSize: 7.5, letterSpacing: "0.1em", color: "var(--fg-subtle)", marginTop: 2 }}>{label}</div>
    </div>
  );
}
