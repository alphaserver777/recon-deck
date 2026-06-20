"use client";

import { useState } from "react";
import { X, Building2, Eye, EyeOff, Shield, ShieldCheck, Check, Crosshair } from "lucide-react";
import type { Company } from "@/lib/company-data";
import { RISK_COLORS, COMPANY_STATUS_COLORS, COMPANY_STATUS_LABELS } from "@/lib/company-data";
import { useCompany } from "@/lib/company-context";

export function CompanyDossier({ company, onClose }: { company: Company; onClose: () => void }) {
  const [showPass, setShowPass] = useState(false);
  const { selected, select } = useCompany();
  const isTarget = selected?.id === company.id;
  const riskColor = RISK_COLORS[company.riskLevel];
  const statusColor = COMPANY_STATUS_COLORS[company.status];

  return (
    <div
      className="flex flex-col shrink-0 overflow-y-auto"
      style={{
        width: 380,
        background: "var(--bg-1)",
        borderLeft: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          borderTop: `2px solid ${riskColor}`,
        }}
      >
        <span className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--fg-subtle)" }}>
          ДОСЬЕ ЦЕЛИ
        </span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--fg-subtle)", cursor: "pointer", padding: 2 }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: 16 }}>
        {/* Identity */}
        <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
          <div
            style={{
              width: 52, height: 52,
              display: "flex", alignItems: "center", justifyContent: "center",
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              background: riskColor, color: "#fff", flexShrink: 0,
            }}
          >
            <Building2 size={26} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
              {company.name}
            </div>
            <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--fg-muted)" }}>{company.domain}</span>
              <span className="mono" style={{
                fontSize: 8.5, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
                color: riskColor, background: `${riskColor}1a`, border: `1px solid ${riskColor}33`,
                letterSpacing: "0.08em",
              }}>
                {company.riskLevel}
              </span>
              <span className="mono" style={{
                fontSize: 8.5, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
                color: statusColor, background: `${statusColor}1a`, border: `1px solid ${statusColor}33`,
                letterSpacing: "0.08em",
              }}>
                {COMPANY_STATUS_LABELS[company.status]}
              </span>
            </div>
          </div>
        </div>

        {/* Properties */}
        <div className="flex flex-col gap-2" style={{ marginBottom: 16 }}>
          <PropRow label="Белый IP" value={company.whiteIp} accent />
          <PropRow label="Отрасль" value={company.industry} />
          <PropRow label="Сотрудники" value={String(company.employeeCount)} />
          <PropRow label="Бюджет" value={`${company.budget.toLocaleString("ru-RU")} ₽`} />
        </div>

        {/* VPN Access */}
        <SectionHead icon={<Shield size={13} />} label="VPN ДОСТУП" />
        <div className="flex flex-col gap-1.5" style={{ marginBottom: 16 }}>
          <div className="flex items-center justify-between">
            <span className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)" }}>Логин</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--accent)" }}>{company.vpnLogin}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)" }}>Пароль</span>
            <span className="flex items-center gap-2">
              <span className="mono" style={{ fontSize: 11, color: "#22c55e", letterSpacing: showPass ? 0 : 1.5 }}>
                {showPass ? company.vpnPassword : "••••••••••"}
              </span>
              <button
                onClick={() => setShowPass(!showPass)}
                style={{ background: "none", border: "none", color: "var(--fg-subtle)", cursor: "pointer", padding: 0 }}
              >
                {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </span>
          </div>
        </div>

        {/* СЗИ */}
        <SectionHead icon={<ShieldCheck size={13} />} label="СЗИ" count={company.szi.length} />
        <div className="flex flex-wrap gap-1.5" style={{ marginBottom: 16 }}>
          {company.szi.map((s) => <Tag key={s} text={s} />)}
        </div>

        {/* САВЗ */}
        <SectionHead icon={<Shield size={13} />} label="САВЗ" count={company.savz.length} />
        <div className="flex flex-wrap gap-1.5" style={{ marginBottom: 16 }}>
          {company.savz.map((s) => <Tag key={s} text={s} color="var(--risk-high)" />)}
        </div>

        {/* Notes */}
        <SectionHead icon={null} label="ЗАМЕТКИ" />
        <div style={{ fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5, marginBottom: 16, fontStyle: "italic" }}>
          {company.notes}
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)", letterSpacing: "0.1em" }}>ПРОГРЕСС</span>
          <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: statusColor }}>{company.progress}%</span>
        </div>
        <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ width: `${company.progress}%`, height: "100%", background: statusColor, borderRadius: 99 }} />
        </div>

        {/* Stats grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 6, marginBottom: 18,
        }}>
          <MiniStat label="ХОСТЫ" value={company.hostsDiscovered} />
          <MiniStat label="КРЕДЫ" value={company.credsFound} />
          <MiniStat label="УЯЗВ." value={company.vulnsFound} />
          <MiniStat label="ВХОДЫ" value={company.entryPoints} />
          <MiniStat label="HVT" value={company.highValueTargets} />
          <MiniStat label="ПУТИ" value={company.attackPaths} />
        </div>

        {/* Select as target button */}
        <button
          onClick={() => select(company)}
          className="mono w-full flex items-center justify-center gap-2"
          style={{
            padding: "12px 0",
            background: isTarget ? "var(--accent)" : "transparent",
            border: `1px solid var(--accent)`,
            borderRadius: 6,
            color: isTarget ? "#0a0e14" : "var(--accent)",
            fontSize: 11,
            letterSpacing: "0.14em",
            cursor: "pointer",
            fontWeight: 700,
            boxShadow: isTarget ? "0 0 20px rgba(34,211,238,0.25)" : "none",
            transition: "all 0.2s",
          }}
        >
          {isTarget ? <Check size={14} /> : <Crosshair size={14} />}
          {isTarget ? "ЦЕЛЬ ВЫБРАНА" : "ВЫБРАТЬ ЦЕЛЬЮ"}
        </button>
      </div>
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

function SectionHead({ icon, label, count }: { icon: React.ReactNode; label: string; count?: number }) {
  return (
    <div className="mono flex items-center gap-1.5" style={{
      fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", color: "var(--fg)",
      marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid var(--border)",
    }}>
      {icon}
      {label}
      {count !== undefined && <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}> ({count})</span>}
    </div>
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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      padding: "6px 8px", background: "var(--bg-2)", border: "1px solid var(--border)",
      borderRadius: 4, textAlign: "center",
    }}>
      <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: "var(--fg)" }}>{value}</div>
      <div className="mono" style={{ fontSize: 7.5, letterSpacing: "0.1em", color: "var(--fg-subtle)", marginTop: 1 }}>{label}</div>
    </div>
  );
}
