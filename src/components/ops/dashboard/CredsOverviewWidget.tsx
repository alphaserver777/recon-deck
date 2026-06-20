import { KeyRound, Lock, Hash, ShieldCheck } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { CREDS_OVERVIEW } from "@/lib/mock-data";

const ICONS: Record<string, React.ReactNode> = {
  key: <KeyRound size={22} />,
  lock: <Lock size={22} />,
  hash: <Hash size={22} />,
  shield: <ShieldCheck size={22} />,
};

export function CredsOverviewWidget() {
  return (
    <WidgetCard title="CREDENTIALS OVERVIEW" gridArea="creds">
      <div className="grid grid-cols-4 gap-3 h-full">
        {CREDS_OVERVIEW.map((c) => (
          <div
            key={c.label}
            className="flex flex-col items-center justify-center gap-2"
            style={{
              background: "var(--bg-3)",
              borderRadius: 8,
              border: "1px solid var(--border)",
              padding: "12px 8px",
            }}
          >
            <span style={{ color: "var(--fg-subtle)" }}>{ICONS[c.icon]}</span>
            <span
              className="mono font-bold"
              style={{ fontSize: 22, color: "var(--accent)" }}
            >
              {c.value}
            </span>
            <span
              className="mono text-center"
              style={{ fontSize: 8.5, color: "var(--fg-subtle)", letterSpacing: "0.1em", lineHeight: 1.3 }}
            >
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
