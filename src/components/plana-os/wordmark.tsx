export function Wordmark({
  size = 11,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: size * 0.55, color: "currentColor" }}
    >
      <span style={{ position: "relative", width: size * 1.2, height: size * 1.2 }}>
        <span style={{ position: "absolute", inset: 0, background: "currentColor", borderRadius: 2 }} />
        <span
          style={{
            position: "absolute",
            top: -size * 0.25,
            left: "50%",
            transform: "translateX(-50%)",
            width: size * 0.7,
            height: size * 0.18,
            border: "1.5px solid var(--halo)",
            borderRadius: "50%",
          }}
        />
      </span>
      <span
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontWeight: 700,
          letterSpacing: "0.02em",
          fontSize: size * 1.1,
        }}
      >
        PLANA
      </span>
    </span>
  );
}
