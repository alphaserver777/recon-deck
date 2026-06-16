"use client";

/**
 * NetworkBrief (fork) — the engagement "operation brief" that replaces the
 * minimap: editable network-wide intel (organisation, AD domain, in-scope
 * routes, budget, free notes) + network-level discovered defenses (СЗИ/САВЗ).
 * Each field saves on blur via saveNetworkIntelAction.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import type { MapDefense } from "@/lib/tactical";
import type { NetworkIntelView } from "./TacticalMap";
import { saveNetworkIntelAction } from "../../../app/(app)/engagements/[id]/map/actions";
import { DefensesEditor } from "./DefensesEditor";
import styles from "./TacticalMap.module.css";

type Field = keyof NetworkIntelView;

export function NetworkBrief({
  engagementId,
  intel,
  defenses,
  hostCount,
}: {
  engagementId: number;
  intel: NetworkIntelView;
  defenses: MapDefense[];
  hostCount: number;
}) {
  const [pending, startTransition] = useTransition();
  const [val, setVal] = useState<NetworkIntelView>(intel);
  // keep local buffer in sync if server data changes underneath
  const serialized = JSON.stringify(intel);
  const lastSerialized = useRef(serialized);
  useEffect(() => {
    if (lastSerialized.current !== serialized) {
      lastSerialized.current = serialized;
      setVal(intel);
    }
  }, [serialized, intel]);

  const saveField = (field: Field) => {
    if (val[field] !== intel[field]) {
      startTransition(() => saveNetworkIntelAction(engagementId, { [field]: val[field] }));
    }
  };

  const text = (field: Field, label: string, placeholder: string, wide = false) => (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ""}`}>
      <label className={styles.fieldLabel}>{label}</label>
      <input
        className={styles.fieldInput}
        placeholder={placeholder}
        value={val[field]}
        onChange={(e) => setVal((v) => ({ ...v, [field]: e.target.value }))}
        onBlur={() => saveField(field)}
      />
    </div>
  );

  return (
    <div className={styles.brief} style={{ opacity: pending ? 0.85 : 1 }}>
      <div className={styles.briefHead}>
        <b>СВОДКА ОПЕРАЦИИ</b>
        <span>{hostCount} целей в периметре</span>
      </div>
      <div className={styles.briefGrid}>
        {text("organization", "Организация", "ООО «Цель»")}
        {text("domain", "Домен", "CHSB.local")}
        {text("budget", "Объём / бюджет $", "$ / охват")}
        {text("scope", "Маршруты / scope", "192.168.16.0/24, VPN…")}
        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label className={styles.fieldLabel}>Заметки по сети</label>
          <textarea
            className={`${styles.fieldInput} ${styles.fieldArea}`}
            placeholder="топология, доверия, точки входа, прочее…"
            value={val.notes}
            onChange={(e) => setVal((v) => ({ ...v, notes: e.target.value }))}
            onBlur={() => saveField("notes")}
          />
        </div>
        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label className={styles.fieldLabel}>Средства защиты сети (СЗИ / САВЗ)</label>
          <DefensesEditor engagementId={engagementId} hostId={null} defenses={defenses} />
        </div>
      </div>
    </div>
  );
}
