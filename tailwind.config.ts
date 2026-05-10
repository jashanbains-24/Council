import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#f4f1ea",
          soft: "#c4c0b6",
          muted: "#9a978f",
          faint: "#6a6862",
          dim: "#48484c",
        },
        surface: {
          DEFAULT: "#0a0a0b",
          raised: "#111113",
          elevated: "#15151a",
          higher: "#1a1a20",
          line: "#222226",
          "line-strong": "#34343a",
        },
        accent: {
          DEFAULT: "#c9a449",
          muted: "#7d6730",
          dim: "#3d321a",
        },
        agent: {
          strategist: "#c9a449",
          skeptic: "#c97a6f",
          operator: "#7eb6c8",
          psychologist: "#9ab39a",
        },
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.045em",
        wider: "0.06em",
        widest: "0.18em",
        "ultra-wide": "0.28em",
      },
    },
  },
  plugins: [],
};

export default config;
