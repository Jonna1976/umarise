import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
        playfair: ["Playfair Display", "Georgia", "serif"],
        garamond: ["EB Garamond", "Georgia", "serif"],
        mono: ["JetBrains Mono", "monospace"],
        handwritten: ["Reenie Beanie", "cursive"],
      },
      colors: {
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
        codex: {
          paper: "hsl(var(--codex-paper))",
          ink: "hsl(var(--codex-ink))",
          "ink-deep": "hsl(var(--codex-ink-deep))",
          sepia: "hsl(var(--codex-sepia))",
          gold: "hsl(var(--codex-gold))",
          "gold-muted": "hsl(var(--codex-gold-muted))",
          cream: "hsl(var(--codex-cream))",
          teal: "hsl(var(--codex-teal))",
          forest: "hsl(var(--codex-forest))",
        },
        tone: {
          focused: "hsl(var(--tone-focused))",
          hopeful: "hsl(var(--tone-hopeful))",
          frustrated: "hsl(var(--tone-frustrated))",
          playful: "hsl(var(--tone-playful))",
          overwhelmed: "hsl(var(--tone-overwhelmed))",
          reflective: "hsl(var(--tone-reflective))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Landing page (Infrastructure Signal) colors
        landing: {
          deep: "hsl(var(--landing-deep))",
          copper: "hsl(var(--landing-copper))",
          cream: "hsl(var(--landing-cream))",
          muted: "hsl(var(--landing-muted))",
        },
        // Ritual V6 colors
        ritual: {
          bg: "hsl(var(--ritual-bg))",
          surface: "hsl(var(--ritual-surface))",
          "surface-elevated": "hsl(var(--ritual-surface-elevated))",
          "border-subtle": "hsl(var(--ritual-border-subtle))",
          gold: "hsl(var(--ritual-gold))",
          "gold-glow": "hsl(var(--ritual-gold-glow))",
          "gold-muted": "hsl(var(--ritual-gold-muted))",
          cream: "hsl(var(--ritual-cream))",
          "cream-70": "hsl(var(--ritual-cream-70))",
          "cream-40": "hsl(var(--ritual-cream-40))",
          "cream-20": "hsl(var(--ritual-cream-20))",
          "red-accent": "hsl(var(--ritual-red-accent))",
          "red-soft": "hsl(var(--ritual-red-soft))",
          "yellow-accent": "hsl(var(--ritual-yellow-accent))",
          "blue-accent": "hsl(var(--ritual-blue-accent))",
          "green-accent": "hsl(var(--ritual-green-accent))",
          "green-muted": "hsl(var(--ritual-green-muted))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
