import { cn } from "@/lib/utils";

interface OSWindowProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function OSWindow({ title, subtitle, children, className, bodyClassName }: OSWindowProps) {
  return (
    <div
      className={cn("overflow-hidden rounded-[14px] border", className)}
      style={{
        background: "var(--os-pane)",
        borderColor: "var(--os-line)",
        boxShadow: "0 30px 60px -28px oklch(0 0 0 / 0.5)",
      }}
    >
      <div
        className="flex h-9 items-center gap-2 border-b px-3.5"
        style={{ background: "var(--os-raised)", borderColor: "var(--os-line)" }}
      >
        <div className="flex gap-1.5">
          <span className="block h-[11px] w-[11px] rounded-full" style={{ background: "#ff5f57" }} />
          <span className="block h-[11px] w-[11px] rounded-full" style={{ background: "#febc2e" }} />
          <span className="block h-[11px] w-[11px] rounded-full" style={{ background: "#28c840" }} />
        </div>
        <div
          className="flex-1 text-center text-[11px]"
          style={{
            fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
            color: "var(--muted-foreground)",
            letterSpacing: "0.04em",
          }}
        >
          {title}
          {subtitle ? (
            <span className="ml-2" style={{ color: "var(--dim)" }}>
              · {subtitle}
            </span>
          ) : null}
        </div>
        <div className="w-[49px]" />
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
