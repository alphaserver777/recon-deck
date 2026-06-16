"use client";

/**
 * DefensesEditor (fork) — list + add/remove discovered security controls
 * (СЗИ / САВЗ). Reused at network level (hostId = null) in the operation brief
 * and at host level in the intel drawer. Persists via the map server actions.
 */

import { useState, useTransition } from "react";
import type { MapDefense } from "@/lib/tactical";
import {
  addDefenseAction,
  deleteDefenseAction,
} from "../../../app/(app)/engagements/[id]/map/actions";
import styles from "./TacticalMap.module.css";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "savz", label: "САВЗ" },
  { value: "edr", label: "EDR" },
  { value: "fw", label: "Firewall" },
  { value: "ips", label: "IPS/IDS" },
  { value: "siem", label: "SIEM" },
  { value: "dlp", label: "DLP" },
  { value: "waf", label: "WAF" },
  { value: "nac", label: "NAC" },
  { value: "other", label: "прочее СЗИ" },
];
const CAT_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

export function DefensesEditor({
  engagementId,
  hostId,
  defenses,
  compact,
}: {
  engagementId: number;
  hostId: number | null;
  defenses: MapDefense[];
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [cat, setCat] = useState("savz");
  const [product, setProduct] = useState("");
  const [detail, setDetail] = useState("");

  const add = () => {
    if (!product.trim()) return;
    startTransition(() =>
      addDefenseAction(engagementId, hostId, cat, product, detail),
    );
    setProduct("");
    setDetail("");
  };

  return (
    <div style={{ opacity: pending ? 0.7 : 1 }}>
      <div className={styles.defenses}>
        {defenses.length === 0 && (
          <span style={{ color: "var(--t-dim)", fontSize: 11 }}>
            средств защиты не отмечено
          </span>
        )}
        {defenses.map((d) => (
          <span key={d.id} className={styles.defChip}>
            <span className={styles.defCat}>{CAT_LABEL[d.category] ?? d.category}</span>
            <span className={styles.defProduct}>{d.product}</span>
            {d.detail && <span className={styles.defDetail}>{d.detail}</span>}
            <button
              type="button"
              className={styles.defDel}
              title="удалить"
              onClick={() =>
                startTransition(() => deleteDefenseAction(engagementId, d.id))
              }
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className={styles.controls} style={{ marginTop: 6 }}>
        <select
          className={styles.select}
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          className={styles.input}
          placeholder="продукт (Kaspersky, Defender…)"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        />
        {!compact && (
          <input
            className={styles.input}
            placeholder="версия / где замечен"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
          />
        )}
        <button type="button" className={styles.btn} onClick={add}>
          + СЗИ
        </button>
      </div>
    </div>
  );
}
