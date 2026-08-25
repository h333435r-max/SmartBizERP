import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0fdf9",
          100: "#ccfbef",
          200: "#99f6df",
          300: "#5eedc9",
          400: "#2dd4ad",
          500: "#14b896",
          600: "#0d9278",
          700: "#0e7561",
          800: "#115d4f",
          900: "#124d41",
          950: "#042e28",
        },
        navy: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c0d3ff",
          300: "#91b2ff",
          400: "#5a87f8",
          500: "#3362ef",
          600: "#1d42e4",
          700: "#1832cf",
          800: "#1a2da8",
          900: "#1b2d85",
          950: "#141e52",
        },
        dark: {
          900: "#0a0f1e",
          800: "#0f1629",
          700: "#141f35",
          600: "#1a2844",
          500: "#1e3054",
        },
        sidebar: "#0B1628",
        "sidebar-hover": "#162033",
        "sidebar-active": "#1E3A5F",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.12)",
        glow: "0 0 20px rgba(20, 184, 150, 0.3)",
        "glow-blue": "0 0 20px rgba(51, 98, 239, 0.3)",
      },
      animation: {
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "count-up": "countUp 0.6s ease-out",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        countUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
