import { Plus } from "lucide-react";
import { WidgetCard } from "./WidgetCard";
import { MOCK_NOTES } from "@/lib/mock-data";

export function NotesWidget() {
  return (
    <WidgetCard
      title="NOTES"
      gridArea="notes"
      actions={
        <span
          className="grid place-items-center"
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            background: "var(--bg-3)",
            border: "1px solid var(--border)",
            color: "var(--fg-subtle)",
            cursor: "pointer",
          }}
        >
          <Plus size={11} />
        </span>
      }
    >
      <div className="flex flex-col gap-3">
        {MOCK_NOTES.map((n, i) => (
          <div key={i}>
            <div className="mono" style={{ fontSize: 10, color: "var(--fg-subtle)", marginBottom: 3 }}>
              {n.time}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.5 }}>
              {n.text}
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
