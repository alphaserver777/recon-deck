import type { MockHost, TimelineStatus, TimelineCategory } from "@/lib/mock-data";

type Props = {
  hosts: MockHost[];
  filterHost: string;
  filterStatus: string;
  filterCategory: string;
  dateFrom: string;
  dateTo: string;
  onFilterHost: (v: string) => void;
  onFilterStatus: (v: string) => void;
  onFilterCategory: (v: string) => void;
  onDateFrom: (v: string) => void;
  onDateTo: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
  hasFilters: boolean;
  categories: TimelineCategory[];
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 8px",
  background: "var(--bg-3)",
  border: "1px solid var(--border)",
  borderRadius: 4,
  color: "var(--fg)",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  outline: "none",
  appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2356697a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 8px center",
  paddingRight: 28,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 8px",
  background: "var(--bg-3)",
  border: "1px solid var(--border)",
  borderRadius: 4,
  color: "var(--fg)",
  fontFamily: "var(--font-mono)",
  fontSize: 10.5,
  outline: "none",
  colorScheme: "dark",
};

export function TimelineFilters({
  hosts,
  filterHost,
  filterStatus,
  filterCategory,
  dateFrom,
  dateTo,
  onFilterHost,
  onFilterStatus,
  onFilterCategory,
  onDateFrom,
  onDateTo,
  onApply,
  onClear,
  hasFilters,
  categories,
}: Props) {
  const statuses: TimelineStatus[] = ["SUCCESS", "CREDENTIALS", "INFO", "ERROR"];

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
        <span>FILTERS</span>
        {hasFilters && (
          <button
            onClick={onClear}
            className="mono"
            style={{
              background: "none",
              border: "none",
              color: "var(--accent)",
              fontSize: 9.5,
              letterSpacing: "0.1em",
              cursor: "pointer",
              padding: 0,
            }}
          >
            CLEAR ALL
          </button>
        )}
      </div>
      <div className="flex flex-col gap-3" style={{ padding: "12px 14px" }}>
        <div>
          <label
            className="mono block"
            style={{ fontSize: 9.5, color: "var(--fg-subtle)", marginBottom: 4, letterSpacing: "0.1em" }}
          >
            HOST
          </label>
          <select
            value={filterHost}
            onChange={(e) => onFilterHost(e.target.value)}
            style={selectStyle}
          >
            <option value="">All Hosts</option>
            {hosts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.hostname} ({h.ip})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="mono block"
            style={{ fontSize: 9.5, color: "var(--fg-subtle)", marginBottom: 4, letterSpacing: "0.1em" }}
          >
            TYPE
          </label>
          <select
            value={filterCategory}
            onChange={(e) => onFilterCategory(e.target.value)}
            style={selectStyle}
          >
            <option value="">All Types</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="mono block"
            style={{ fontSize: 9.5, color: "var(--fg-subtle)", marginBottom: 4, letterSpacing: "0.1em" }}
          >
            RESULT
          </label>
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatus(e.target.value)}
            style={selectStyle}
          >
            <option value="">All Results</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="mono block"
            style={{ fontSize: 9.5, color: "var(--fg-subtle)", marginBottom: 4, letterSpacing: "0.1em" }}
          >
            TIME RANGE
          </label>
          <div
            className="mono"
            style={{
              padding: "7px 8px",
              background: "var(--bg-3)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              color: "var(--fg-muted)",
              fontSize: 10.5,
              marginBottom: 6,
            }}
          >
            Custom Range
          </div>
          <div className="flex items-center gap-1">
            <input
              type="datetime-local"
              value={dateFrom}
              onChange={(e) => onDateFrom(e.target.value)}
              style={inputStyle}
            />
            <span className="mono" style={{ color: "var(--fg-subtle)", fontSize: 10, flexShrink: 0 }}>~</span>
            <input
              type="datetime-local"
              value={dateTo}
              onChange={(e) => onDateTo(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <button
          onClick={onApply}
          className="mono w-full"
          style={{
            padding: "8px 12px",
            background: "var(--accent-dim)",
            border: "1px solid var(--accent)",
            borderRadius: 4,
            color: "var(--accent)",
            fontSize: 10.5,
            letterSpacing: "0.12em",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          APPLY FILTERS
        </button>
      </div>
    </div>
  );
}
