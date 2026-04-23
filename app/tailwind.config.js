/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#4E6E71",
          hover: "#C8E6E1",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FDC846",
          hover: "#FEF1CD",
          foreground: "#151515",
        },
        accent: {
          DEFAULT: "#F76CA5",
          foreground: "#FFFFFF",
        },
        game: {
          yellow: "#FCB630",
          green: "#8CC298",
          blue: "#8ABAC5",
          pink: "#F76CA5",
          orange: "#E66A2C",
        },
        dark: "#151515",
        surface: "#FFFFFF",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        pixel: ['"Pixelify Sans"', 'monospace'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        card: "24px",
        pill: "50px",
        tile: "12px",
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: "0 8px 0 #151515",
        "card-hover": "0 16px 0 #151515",
        "card-active": "0 2px 0 #151515",
        button: "0 4px 0 #151515",
        "button-hover": "0 2px 0 #151515",
        "button-active": "0 0px 0 #151515",
        "game-tile": "0 4px 0 rgba(0,0,0,0.15)",
        glow: "0 0 30px rgba(247,108,165,0.5)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "tile-spawn": {
          "0%": { transform: "scale(0)" },
          "70%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        "tile-merge": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        "float-drift": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-30px) rotate(10deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 4px 0 #151515" },
          "50%": { boxShadow: "0 6px 0 #151515" },
        },
        "scroll-dot": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(16px)", opacity: "0" },
        },
        "food-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "tile-spawn": "tile-spawn 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
        "tile-merge": "tile-merge 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "float-drift": "float-drift 8s ease-in-out infinite",
        "pulse-glow": "pulse-glow 1.5s ease-in-out infinite",
        "scroll-dot": "scroll-dot 2s ease-in-out infinite",
        "food-pulse": "food-pulse 1s ease-in-out infinite",
        "shake": "shake 0.4s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
