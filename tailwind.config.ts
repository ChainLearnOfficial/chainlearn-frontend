import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        accent: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        stellar: {
          purple: "#7b3fe4",
          blue: "#08b5e5",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      // Dialog enter/exit animations, driven by Radix's data-[state] attributes.
      // Defined here rather than pulling in tailwindcss-animate for two
      // keyframes.
      keyframes: {
        "dialog-overlay-show": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "dialog-content-show": {
          "0%": { opacity: "0", transform: "translate(-50%, -48%) scale(0.95)" },
          "100%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        "dialog-overlay-hide": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "dialog-content-hide": {
          "0%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
          "100%": { opacity: "0", transform: "translate(-50%, -48%) scale(0.95)" },
        },
        "overlay-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "overlay-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "content-in": {
          from: { opacity: "0", transform: "translate(-50%, -48%) scale(0.96)" },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        "content-out": {
          from: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
          to: { opacity: "0", transform: "translate(-50%, -48%) scale(0.96)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "dialog-overlay-show": "dialog-overlay-show 0.2s ease-out",
        "dialog-content-show": "dialog-content-show 0.2s ease-out",
        "dialog-overlay-hide": "dialog-overlay-hide 0.2s ease-in",
        "dialog-content-hide": "dialog-content-hide 0.2s ease-in",
        "overlay-in": "overlay-in 150ms ease-out",
        "overlay-out": "overlay-out 150ms ease-in",
        "content-in": "content-in 150ms ease-out",
        "content-out": "content-out 150ms ease-in",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
