import { Plus } from "lucide-react";
import type { TimelineNoteEntry } from "@/lib/mock-data";

export function TimelineNotes({ notes }: { notes: TimelineNoteEntry[] }) {
  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 8,
      }}
    >
      <div
        className="mono flex items-center justify-between"
        style={{
          padding: "10px 14px",
          fontSize: 10.5,
          letterSpacing: "0.14em",
          color: "var(--fg-subtle)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span>NOTES</span>
        <button
          style={{
            width: 20,
            height: 20,
            display: "grid",
            placeItems: "center",
            background: "var(--bg-3)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            color: "var(--accent)",
            cursor: "pointer",
          }}
        >
          <Plus size={12} />
        </button>
      </div>
      <div className="flex flex-col gap-2" style={{ padding: "10px 14px" }}>
        {notes.map((n) => {
          const dt = new Date(n.ts);
          const time = dt.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div key={n.id} style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 3 }}>
                <span
                  className="mono"
                  style={{ fontSize: 9.5, color: "var(--accent)" }}
                >
                  {time}
                </span>
                <span
                  className="mono"
                  style={{ fontSize: 8.5, color: "var(--fg-subtle)", letterSpacing: "0.08em" }}
                >
                  {n.author.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: 11, color: "var(--fg-muted)", margin: 0, lineHeight: 1.4 }}>
                {n.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
