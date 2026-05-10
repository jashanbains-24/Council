import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        council: {
          canvas: "#f1f5f9",
          surface: "#ffffff",
          elevated: "#f8fafc",
          reasoning: "#f0f4f8",
          deliberation: "#fffdfb",
          json: "#f1f5f9",
          border: "#e2e8f0",
          ink: "#0f172a",
        },
      },
      boxShadow: {
        council: "0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.04)",
        "council-md":
          "0 4px 6px rgba(15, 23, 42, 0.05), 0 12px 28px rgba(15, 23, 42, 0.08)",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-plex-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
