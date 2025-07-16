const flattenColorPalette = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "color-1": "hsl(var(--color-1))",
        "color-2": "hsl(var(--color-2))",
        "color-3": "hsl(var(--color-3))",
        "color-4": "hsl(var(--color-4))",
        "color-5": "hsl(var(--color-5))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      animation: {
        aurora: "aurora 60s linear infinite",
        "shiny-text": "shiny-text 3s linear infinite",
        "blink": "blink 1.5s infinite ease-in-out",
        rainbow: "rainbow 5s infinite linear",
        "pop-blob": "pop-blob 5s infinite",
        "orb-flow": "orb-flow 20s infinite ease-in-out",
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
        "shiny-text": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "blink": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0 },
        },
        rainbow: {
          "0%": { "background-position": "0%" },
          "100%": { "background-position": "200%" },
        },
        "pop-blob": {
          "0%": { transform: "scale(1)" },
          "33%": { transform: "scale(1.2)" },
          "66%": { transform: "scale(0.8)" },
          "100%": { transform: "scale(1)" },
        },
        "orb-flow": {
          "0%, 100%": { transform: "scale(1) rotate(0deg)", filter: "hue-rotate(0deg) saturate(100%)" },
          "25%": { transform: "scale(1.03) rotate(45deg)", filter: "hue-rotate(45deg) saturate(150%)" },
          "50%": { transform: "scale(0.97) rotate(90deg)", filter: "hue-rotate(90deg) saturate(100%)" },
          "75%": { transform: "scale(1.03) rotate(135deg)", filter: "hue-rotate(135deg) saturate(150%)" },
        },
      },
    },
  },
  plugins: [
    function addVariablesForColors({ addBase, theme }) {
      let allColors = flattenColorPalette(theme("colors"));
      let newVars = Object.fromEntries(
        Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
      );
    
      addBase({
        ":root": newVars,
      });
    }
  ],
}; 