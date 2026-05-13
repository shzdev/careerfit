import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050609",
        panel: "#0b0f14",
        line: "rgba(255,255,255,0.12)",
        cyanGlow: "#1bd8c4"
      },
      fontFamily: {
        display: ["Space Grotesk", "Aptos Display", "Segoe UI", "sans-serif"],
        body: ["Aptos", "Segoe UI", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 80px rgba(27, 216, 196, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;

