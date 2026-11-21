import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "var(--color-forest)",
          deep: "var(--color-deep-green)",
          olive: "var(--color-olive-green)",
          sage: "var(--color-sage-green)",
        },
        cream: {
          DEFAULT: "var(--color-cream)",
          warm: "var(--color-warm-beige)",
        },
        surface: {
          white: "var(--color-soft-white)",
          cream: "var(--color-cream)",
          beige: "var(--color-warm-beige)",
        },
        natural: {
          forest: "#263D18",
          deep: "#1D3214",
          olive: "#536B35",
          sage: "#A8B88A",
          cream: "#FBF7EE",
          beige: "#E9DCC5",
          white: "#FFFFFF",
          dark: "#28321F",
          muted: "#777968",
        },
        brand: {
          forest: "#263D18",
          deep: "#1D3214",
          olive: "#536B35",
          sage: "#A8B88A",
          cream: "#FBF7EE",
          beige: "#E9DCC5",
          white: "#FFFFFF",
          text: "#28321F",
          muted: "#777968",
        },
        text: {
          dark: "var(--color-dark-text)",
          muted: "var(--color-muted-text)",
        },
      },
      fontFamily: {
        sans: ["'DM Sans'", "var(--font-dm-sans)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["'Cormorant Garamond'", "var(--font-cormorant)", "Georgia", "serif"],
        heading: ["'Cormorant Garamond'", "var(--font-cormorant)", "Georgia", "serif"],
        body: ["'DM Sans'", "var(--font-dm-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(38, 61, 24, 0.05), 0 4px 6px -2px rgba(38, 61, 24, 0.02)",
        card: "0 4px 20px -2px rgba(38, 61, 24, 0.06), 0 2px 6px -1px rgba(38, 61, 24, 0.03)",
        elevated: "0 10px 30px -4px rgba(38, 61, 24, 0.08), 0 4px 10px -2px rgba(38, 61, 24, 0.04)",
      },
      borderRadius: {
        brand: "0.75rem",
        card: "1rem",
        button: "9999px",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          lg: "2rem",
          xl: "2.5rem",
          "2xl": "3rem",
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1360px",         
        },
      },
    },
  },
  plugins: [],
};

export default config;
