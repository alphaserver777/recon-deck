"use client";

/**
 * Intel drawer (fork) — editable per-target operator data.
 *
 * Read: findings/ports come from the tactical view-model. Edit: priority,
 * status, host notes, credentials, and command log persist via the map server
 * actions (DB-backed → survive re-imports). Uses useTransition for pending
 * state; the revalidatePath in each action refreshes the RSC tree, so the
 * `host` prop flows back down with fresh values.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import type { MapHost, Sev } from "@/lib/tactical";
import {
  setPriorityAction,
  setStatusAction,
  setNotesAction,
  addCredAction,
  updateCredAction,
  deleteCredAction,
  addCommandAction,
  deleteCommandAction,
} from "../../../app/(app)/engagements/[id]/map/actions";
import styles from "./TacticalMap.module.css";

const SEV_LABEL: Record<Sev, string> = {
  crit: "CRIT",
  high: "HIGH",
  med: "MED",
  low: "LOW",
  info: "INFO",
};
const FIND_CLASS: Record<Sev, string> = {
  crit: styles.findCrit,
  high: styles.findHigh,
  med: styles.findMed,
  low: styles.findLow,
  info: "",
};
const TAG_BG: Record<Sev, string> = {
  crit: "var(--t-crit)",
  high: "var(--t-high)",
  med: "var(--t-med)",
  low: "var(--t-low)",
  info: "var(--t-info)",
};
const STATUSES = ["recon", "active", "owned", "dismissed"] as const;

export function IntelPanel({
  engagementId,
  host,
}: {
  engagementId: number;
  host: MapHost | null;
}) {
  const [pending, startTransition] = useTransition();

  if (!host) {
    return (
      <aside className={styles.intel}>
        <div className={styles.intelEmpty}>
          ◎ Выбери цель на карте
          <br />
          <br />
          Сектора отсортированы по угрозе.
          <br />
          Красная рамка — crit, оранжевая — high.
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.intel} style={{ opacity: pending ? 0.7 : 1 }}>
      <div className={styles.intelHead}>
        <h2>
          <span>{host.icon}</span> {host.ip}
        </h2>
        <div className={styles.intelMeta}>
          {(host.hostname || "—")} · {host.roleLabel}
        </div>
        <div className={styles.intelOs}>{host.osName || ""}</div>
      </div>

      {/* priority + status */}
      <div className={styles.secT}>ОПЕРАЦИЯ</div>
      <div className={styles.controls}>
        <div className={styles.prioRow} title="Приоритет">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles.star} ${host.priority >= n ? styles.starOn : ""}`}
              onClick={() =>
                startTransition(() =>
                  setPriorityAction(engagementId, host.id, host.priority === n ? 0 : n),
                )
              }
            >
              ★
            </button>
          ))}
        </div>
        <select
          className={styles.select}
          value={host.opStatus}
          onChange={(e) =>
            startTransition(() => setStatusAction(engagementId, host.id, e.target.value))
          }
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* findings */}
      <div className={styles.secT}>НАХОДКИ ({host.findings.length})</div>
      {host.findings.length === 0 && (
        <div style={{ color: "var(--t-dim)", fontSize: 11 }}>находок нет</div>
      )}
      {host.findings.map((f, i) => (
        <div key={i} className={`${styles.find} ${FIND_CLASS[f.sev]}`}>
          <div>
            <span className={styles.tag} style={{ background: TAG_BG[f.sev] }}>
              {SEV_LABEL[f.sev]}
            </span>
            <span className={styles.ft}>{f.title}</span>
          </div>
          <div style={{ fontSize: 10, color: "#789" }}>{f.detail}</div>
          <div className={styles.nx}>▶ {f.next}</div>
        </div>
      ))}

      {/* credentials */}
      <CredsSection engagementId={engagementId} host={host} pendingWrap={startTransition} />

      {/* command log */}
      <CmdLogSection engagementId={engagementId} host={host} pendingWrap={startTransition} />

      {/* notes */}
      <NotesSection engagementId={engagementId} host={host} pendingWrap={startTransition} />

      {/* ports */}
      <div className={styles.secT}>ПОРТЫ ({host.ports.length})</div>
      <div className={styles.ports}>
        {host.ports.map((p) => (
          <span key={`${p.protocol}-${p.port}`} className={styles.port} title={p.product || ""}>
            {p.port} {p.service || ""}
          </span>
        ))}
      </div>
    </aside>
  );
}

type Wrap = (cb: () => void) => void;

function CredsSection({
  engagementId,
  host,
  pendingWrap,
}: {
  engagementId: number;
  host: MapHost;
  pendingWrap: Wrap;
}) {
  const [user, setUser] = useState("");
  const [secret, setSecret] = useState("");
  const [service, setService] = useState("");
  const [kind, setKind] = useState("pass");

  const add = () => {
    if (!user.trim() && !secret.trim()) return;
    pendingWrap(() =>
      addCredAction(engagementId, host.id, {
        username: user,
        secret,
        service: service || undefined,
        kind,
      }),
    );
    setUser("");
    setSecret("");
    setService("");
  };

  const vClass: Record<string, string> = {
    untested: styles.vUntested,
    valid: styles.vValid,
    invalid: styles.vInvalid,
  };
  const nextValidated = (v: string) =>
    v === "untested" ? "valid" : v === "valid" ? "invalid" : "untested";

  return (
    <>
      <div className={styles.secT}>КРЕДЫ ({host.creds.length})</div>
      {host.creds.map((c) => (
        <div key={c.id} className={styles.credRow}>
          <div className={styles.credMain}>
            {c.service && <span className={styles.credSvc}>{c.service} · </span>}
            <span className={styles.credUser}>{c.username || "—"}</span>{" "}
            <span className={styles.credSecret}>{c.secret}</span>{" "}
            <span style={{ color: "#456", fontSize: 9 }}>[{c.kind}]</span>
          </div>
          <button
            type="button"
            className={`${styles.vBadge} ${vClass[c.validated]}`}
            title="кликни — сменить статус проверки"
            onClick={() =>
              pendingWrap(() =>
                updateCredAction(engagementId, c.id, { validated: nextValidated(c.validated) }),
              )
            }
          >
            {c.validated}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={() => pendingWrap(() => deleteCredAction(engagementId, c.id))}
          >
            ✕
          </button>
        </div>
      ))}
      <div className={styles.controls} style={{ marginTop: 6 }}>
        <input className={styles.input} placeholder="сервис" value={service} onChange={(e) => setService(e.target.value)} />
        <select className={styles.select} value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="pass">pass</option>
          <option value="hash">hash</option>
          <option value="key">key</option>
        </select>
      </div>
      <div className={styles.controls}>
        <input className={styles.input} placeholder="логин" value={user} onChange={(e) => setUser(e.target.value)} />
        <input className={styles.input} placeholder="пароль/хеш" value={secret} onChange={(e) => setSecret(e.target.value)} />
        <button type="button" className={styles.btn} onClick={add}>
          + кред
        </button>
      </div>
    </>
  );
}

function CmdLogSection({
  engagementId,
  host,
  pendingWrap,
}: {
  engagementId: number;
  host: MapHost;
  pendingWrap: Wrap;
}) {
  const [cmd, setCmd] = useState("");
  const [res, setRes] = useState("");

  const add = () => {
    if (!cmd.trim()) return;
    pendingWrap(() => addCommandAction(engagementId, host.id, cmd, res));
    setCmd("");
    setRes("");
  };

  return (
    <>
      <div className={styles.secT}>ЛОГ КОМАНД ({host.commandLog.length})</div>
      {host.commandLog.map((c) => (
        <div key={c.id} className={styles.cmdRow}>
          <div className={styles.cmdCmd}>$ {c.command}</div>
          {c.result && <div className={styles.cmdRes}>{c.result}</div>}
          <div className={styles.cmdTs}>
            {new Date(c.ts).toLocaleString()}{" "}
            <button
              type="button"
              className={`${styles.btn} ${styles.btnDanger}`}
              style={{ padding: "0 6px", fontSize: 10 }}
              onClick={() => pendingWrap(() => deleteCommandAction(engagementId, c.id))}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      <div className={styles.controls} style={{ marginTop: 6 }}>
        <input
          className={styles.input}
          placeholder="команда (nxc smb ...)"
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add();
          }}
        />
      </div>
      <div className={styles.controls}>
        <input className={styles.input} placeholder="результат / вывод" value={res} onChange={(e) => setRes(e.target.value)} />
        <button type="button" className={styles.btn} onClick={add}>
          + запись
        </button>
      </div>
    </>
  );
}

function NotesSection({
  engagementId,
  host,
  pendingWrap,
}: {
  engagementId: number;
  host: MapHost;
  pendingWrap: Wrap;
}) {
  const [val, setVal] = useState(host.notes);
  const lastHostId = useRef(host.id);
  // reset local buffer when switching host
  useEffect(() => {
    if (lastHostId.current !== host.id) {
      lastHostId.current = host.id;
      setVal(host.notes);
    }
  }, [host.id, host.notes]);

  const save = () => {
    if (val !== host.notes) {
      pendingWrap(() => setNotesAction(engagementId, host.id, val));
    }
  };

  return (
    <>
      <div className={styles.secT}>ЗАМЕТКИ</div>
      <textarea
        className={styles.textarea}
        placeholder="наблюдения, гипотезы, ссылки…"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={save}
      />
    </>
  );
}
