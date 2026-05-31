import { cn } from "@/lib/utils";

interface PipProps {
  children: React.ReactNode;
  accent?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Pip({ children, accent, className, style }: PipProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-[7px] rounded-full px-2.5 py-1 text-[10px]", className)}
      style={{
        background: "oklch(0.13 0.012 250 / 0.55)",
        border: `1px solid ${accent ?? "var(--os-line)"}`,
        backdropFilter: "blur(8px)",
        fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
        letterSpacing: "0.12em",
        color: accent ?? "var(--muted-foreground)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
