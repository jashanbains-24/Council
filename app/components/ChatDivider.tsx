type ChatDividerProps = {
  label: string;
  hint?: string;
  variant?: "default" | "warm" | "cool";
};

const variantConfig = {
  default: { text: "text-ink-muted", dot: "#9a978f" },
  warm: { text: "text-accent", dot: "#c9a449" },
  cool: { text: "text-agent-operator", dot: "#7eb6c8" },
};

/**
 * Bracketed phase rule. Used inside the transcript to mark phase boundaries
 * (council convened, Round II, verdict) without breaking the single-thread feel.
 */
export function ChatDivider({
  label,
  hint,
  variant = "default",
}: ChatDividerProps) {
  const cfg = variantConfig[variant];
  return (
    <div className="relative py-4 opacity-0 animate-[fadeIn_500ms_ease-out_forwards]">
      <div
        className="rule-draw mb-3 h-px origin-left"
        style={{ background: `${cfg.dot}30` }}
      />
      <div className="flex flex-wrap items-baseline gap-3">
        <span
          className={`flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-ultra-wide ${cfg.text}`}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: cfg.dot }}
          />
          {"// "}
          {label}
        </span>
        {hint ? (
          <span className="font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint">
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}
