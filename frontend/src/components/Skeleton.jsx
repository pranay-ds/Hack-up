export function Skeleton({ width = "100%", height = 16, count = 1, style = {} }) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <>
      {items.map(i => (
        <div
          key={i}
          style={{
            width,
            height,
            background: "linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%)",
            backgroundSize: "200% 100%",
            animation: "skeleton 1.5s ease-in-out infinite",
            borderRadius: 3,
            ...style,
          }}
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 4, padding: "16px 20px" }}>
      <Skeleton width={80} height={10} style={{ marginBottom: 8 }} />
      <Skeleton width={120} height={20} />
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 8 }) {
  const headerWidth = (index) => 60 + ((index * 17) % 40);
  const cellWidth = (row, col) => 50 + (((row * cols) + col) * 19) % 60;

  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: "1px solid #1a1a1a" }}>
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} width={headerWidth(i)} height={10} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} style={{ display: "flex", gap: 12, padding: "10px 16px", borderBottom: "1px solid #1a1a1a" }}>
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton key={c} width={cellWidth(r, c)} height={12} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 4, padding: "16px 20px" }}>
      <Skeleton width={140} height={12} style={{ marginBottom: 12 }} />
      <Skeleton width="100%" height={200} />
    </div>
  );
}
