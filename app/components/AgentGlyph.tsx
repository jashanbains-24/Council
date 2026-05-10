import type { AgentName } from "@/lib/types";

type AgentGlyphProps = {
  name: AgentName;
  className?: string;
};

/** Abstract vector sigil per advisor — reads as “instrument panel”, not avatar art */
export function AgentGlyph({ name, className = "" }: AgentGlyphProps) {
  const common = `block h-full w-full ${className}`;
  switch (name) {
    case "Strategist":
      return (
        <svg
          className={common}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M12 48 L32 14 L52 48"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="miter"
          />
          <path
            d="M18 38 H46"
            stroke="currentColor"
            strokeWidth="1.25"
            opacity="0.55"
          />
          <path
            d="M22 30 H42"
            stroke="currentColor"
            strokeWidth="1.25"
            opacity="0.35"
          />
          <circle cx="32" cy="44" r="2.5" fill="currentColor" opacity="0.9" />
        </svg>
      );
    case "Skeptic":
      return (
        <svg
          className={common}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M32 10 L54 48 H10 Z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="miter"
          />
          <path
            d="M32 22 V38"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
          <path
            d="M32 42 H32.01"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "Operator":
      return (
        <svg
          className={common}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M32 8 L54 20 V44 L32 56 L10 44 V20 Z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="miter"
          />
          <rect
            x="22"
            y="24"
            width="20"
            height="20"
            stroke="currentColor"
            strokeWidth="1.1"
            opacity="0.65"
          />
          <path
            d="M32 28 V36 M28 32 H36"
            stroke="currentColor"
            strokeWidth="0.9"
            opacity="0.45"
          />
        </svg>
      );
    case "Psychologist":
      return (
        <svg
          className={common}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <circle
            cx="32"
            cy="32"
            r="22"
            stroke="currentColor"
            strokeWidth="1.1"
            opacity="0.35"
          />
          <circle
            cx="32"
            cy="32"
            r="14"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.55"
          />
          <circle cx="32" cy="32" r="5" stroke="currentColor" strokeWidth="1.3" />
          <path
            d="M32 10 V18 M32 46 V54 M10 32 H18 M46 32 H54"
            stroke="currentColor"
            strokeWidth="0.9"
            opacity="0.4"
          />
        </svg>
      );
  }
}
