type ChatDividerProps = {
  label: string;
  hint?: string;
  variant?: "default" | "warm" | "cool";
};

const variantStyles = {
  default: {
    line: "via-slate-300/70",
    text: "text-slate-500",
  },
  warm: {
    line: "via-amber-300/60",
    text: "text-amber-700",
  },
  cool: {
    line: "via-cyan-300/60",
    text: "text-cyan-700",
  },
};

/**
 * Thin in-thread divider. Used to mark phase boundaries (council convened,
 * Round II begins, synthesis, verdict) without breaking the single-chat feel.
 */
export function ChatDivider({
  label,
  hint,
  variant = "default",
}: ChatDividerProps) {
  const style = variantStyles[variant];
  return (
    <div className="flex w-full items-center gap-3 py-2">
      <div className={`h-px flex-1 bg-gradient-to-r from-transparent ${style.line} to-transparent`} />
      <div className="flex flex-col items-center text-center">
        <span
          className={`font-mono text-[10px] font-semibold uppercase tracking-[0.24em] ${style.text}`}
        >
          {label}
        </span>
        {hint ? (
          <span className="mt-1 max-w-xs text-[11px] text-slate-400">
            {hint}
          </span>
        ) : null}
      </div>
      <div className={`h-px flex-1 bg-gradient-to-r from-transparent ${style.line} to-transparent`} />
    </div>
  );
}
