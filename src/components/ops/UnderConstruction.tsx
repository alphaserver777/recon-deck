/**
 * UnderConstruction — shared Step-1 placeholder for every section whose
 * real view hasn't been ported yet. Centered icon + section title +
 * "В разработке" message.
 */

import { Construction } from "lucide-react";

export function UnderConstruction({
  title,
  note,
}: {
  title: string;
  note?: string;
}) {
  return (
    <div className="grid h-full w-full place-items-center px-6 py-16">
      <div className="flex max-w-md flex-col items-center text-center">
        <div
          className="grid place-items-center"
          style={{
            width: 64,
            height: 64,
            borderRadius: 14,
            background: "var(--accent-soft)",
            border: "1px solid var(--border-cyan)",
            color: "var(--accent)",
          }}
        >
          <Construction size={30} />
        </div>

        <h1
          className="font-semibold"
          style={{
            fontSize: 20,
            color: "var(--fg)",
            marginTop: 20,
            letterSpacing: "0.01em",
          }}
        >
          {title}
        </h1>

        <div
          className="mono"
          style={{
            marginTop: 10,
            fontSize: 12,
            letterSpacing: "0.14em",
            color: "var(--accent)",
          }}
        >
          🚧 В РАЗРАБОТКЕ
        </div>

        <p
          style={{
            marginTop: 12,
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--fg-muted)",
          }}
        >
          {note ??
            "Этот раздел появится в следующих шагах. Пока готов только каркас и навигация."}
        </p>
      </div>
    </div>
  );
}
