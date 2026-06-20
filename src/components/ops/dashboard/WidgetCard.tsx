export function WidgetCard({
  title,
  gridArea,
  actions,
  noPad,
  children,
}: {
  title: string;
  gridArea: string;
  actions?: React.ReactNode;
  noPad?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        gridArea,
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minWidth: 0,
        minHeight: 0,
      }}
    >
      <div
        className="mono flex items-center justify-between shrink-0"
        style={{
          padding: "10px 14px",
          fontSize: 10.5,
          letterSpacing: "0.14em",
          color: "var(--fg-subtle)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span>{title}</span>
        {actions}
      </div>
      <div
        className="flex-1 overflow-auto"
        style={noPad ? undefined : { padding: 14 }}
      >
        {children}
      </div>
    </section>
  );
}
