import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1F4E5A",
          dark: "#123039",
          light: "#EAF1F2",
        },
        accent: "#B8863B",
        muted: "#6B7280",
      },
      fontFamily: {
        sans: ["Cairo", "Tahoma", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
