import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Wild Dixie Escapes — deep Red Sea navy + Egyptian gold.
        brand: {
          DEFAULT: "#0B2E3C", // navy (primary: nav, headers, dark bands)
          dark: "#071F29",
          light: "#E7EDEF", // soft navy tint for chips/surfaces
        },
        gold: {
          DEFAULT: "#C9A24B", // CTAs, price pills, accents (the signature)
          dark: "#A8842F",
          light: "#F6EFD9",
        },
        aqua: "#2E8B9E", // links / secondary icons
        coral: {
          DEFAULT: "#E2725B", // urgency / cancellation only
          dark: "#993C1D",
          light: "#FBEDE7",
        },
        sand: "#F4EDE1", // warm page background
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
