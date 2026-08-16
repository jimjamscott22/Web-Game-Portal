/** @type {import('tailwindcss').Config} */

// Every colour resolves to a `--t-*` skin token defined in src/index.css, so
// swapping `data-skin` on <html> re-themes utilities without a rebuild.
const t = (name) => `var(--t-${name})`;

module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Organic tokens
        ground: t('bg'),
        panel: t('panel'),
        surface: t('card'),
        ink: t('ink'),
        line: t('line'),
        drop: t('drop'),
        board: t('board'),
        cell: t('cell'),
        scrim: t('scrim'),
        ok: t('ok'),
        err: t('err'),
        accent: {
          DEFAULT: t('accent'),
          soft: t('accent-soft'),
          deep: t('accent-deep'),
          hover: t('accent-hover'),
          foreground: t('on-accent'),
        },
        second: {
          DEFAULT: t('second'),
          soft: t('second-soft'),
        },
        // One hue per game, in GAMES order (src/types/index.ts)
        game: {
          1: t('s1'), 2: t('s2'), 3: t('s3'), 4: t('s4'), 5: t('s5'),
          6: t('s6'), 7: t('s7'), 8: t('s8'), 9: t('s9'), 10: t('s10'),
        },

        // shadcn/ui primitives
        border: t('line'),
        input: t('line'),
        ring: t('accent'),
        background: t('bg'),
        foreground: t('ink'),
        primary: {
          DEFAULT: t('accent'),
          hover: t('accent-hover'),
          foreground: t('on-accent'),
        },
        secondary: {
          DEFAULT: t('second'),
          hover: t('second-soft'),
          foreground: t('on-accent'),
        },
        muted: {
          DEFAULT: t('panel'),
          foreground: t('muted'),
        },
        destructive: {
          DEFAULT: t('err'),
          foreground: t('on-accent'),
        },
        popover: {
          DEFAULT: t('card'),
          foreground: t('ink'),
        },
        card: {
          DEFAULT: t('card'),
          foreground: t('ink'),
        },
      },
      fontFamily: {
        display: ['Caprasimo', 'Georgia', 'serif'],
        pixel: ['"Pixelify Sans"', 'monospace'],
        body: ['Figtree', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        // Radii: 999px controls, 16px cells, 28px containers
        card: "28px",
        pill: "999px",
        tile: "16px",
        xl: "28px",
        lg: "16px",
        md: "12px",
        sm: "8px",
        xs: "6px",
      },
      boxShadow: {
        // The pixel DNA survives as a chunky offset drop, never an ink border.
        card: "0 6px 0 var(--t-drop)",
        "card-hover": "0 10px 0 var(--t-drop)",
        "card-active": "0 2px 0 var(--t-drop)",
        button: "0 4px 0 var(--t-drop)",
        "button-active": "0 1px 0 var(--t-drop)",
        "game-tile": "0 4px 0 var(--t-drop)",
        soft: "0 3px 10px color-mix(in srgb, var(--t-drop) 60%, transparent)",
        lift: "0 12px 32px color-mix(in srgb, var(--t-drop) 70%, transparent)",
        glow: "0 0 30px color-mix(in srgb, var(--t-accent) 45%, transparent)",
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
          "70%": { transform: "scale(1.06)" },
          "100%": { transform: "scale(1)" },
        },
        "tile-merge": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.12)" },
          "100%": { transform: "scale(1)" },
        },
        "float-drift": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-22px) rotate(8deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 4px 0 var(--t-drop)" },
          "50%": { boxShadow: "0 6px 0 var(--t-drop)" },
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
        "tile-spawn": "tile-spawn 0.2s cubic-bezier(0.33, 1, 0.68, 1) forwards",
        "tile-merge": "tile-merge 0.15s cubic-bezier(0.33, 1, 0.68, 1)",
        "float-drift": "float-drift 9s ease-in-out infinite",
        "pulse-glow": "pulse-glow 1.5s ease-in-out infinite",
        "scroll-dot": "scroll-dot 2s ease-in-out infinite",
        "food-pulse": "food-pulse 1s ease-in-out infinite",
        "shake": "shake 0.4s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
