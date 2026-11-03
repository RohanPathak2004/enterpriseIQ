/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0B1626",
          900: "#0F1D33",
          800: "#16233A",
          700: "#20304C",
          600: "#2C4064",
        },
        paper: "#F3F5F8",
        ink: {
          DEFAULT: "#10182B",
          muted: "#5B6472",
          faint: "#8A93A3",
        },
        border: "#DCE1E8",
        brass: {
          DEFAULT: "#B3822F",
          light: "#D9A85A",
          dark: "#8C6624",
        },
        signal: {
          success: "#1B8A5A",
          warning: "#B3822F",
          danger: "#C4423A",
          info: "#3A6EA5",
        },
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(11, 22, 38, 0.06)",
      },
    },
  },
  plugins: [],
};
