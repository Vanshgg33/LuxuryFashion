import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
        "2xl": "1280px",
      },
    },
    extend: {
      /* ═══════════════════════════════════════════════════════════════════
         KOLKATA KITCHEN — FONT STACK
         Friendly, readable fonts for menu & ordering
      ═══════════════════════════════════════════════════════════════════ */
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },

      /* ═══════════════════════════════════════════════════════════════════
         KOLKATA KITCHEN — COLOR SYSTEM
         Warm, earthy, Bengali-inspired
      ═══════════════════════════════════════════════════════════════════ */
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
        // Kolkata Kitchen Custom Colors
        terracotta: {
          DEFAULT: "hsl(var(--terracotta))",
          light: "hsl(var(--terracotta-light))",
          dark: "hsl(var(--terracotta-dark))",
        },
        mustard: {
          DEFAULT: "hsl(var(--mustard))",
          light: "hsl(var(--mustard-light))",
        },
        bengali: {
          green: "hsl(var(--bengali-green))",
          "green-light": "hsl(var(--bengali-green-light))",
        },
        cream: {
          DEFAULT: "hsl(var(--cream))",
          dark: "hsl(var(--cream-dark))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        veg: "hsl(var(--veg))",
        "non-veg": "hsl(var(--non-veg))",
        gold: {
          DEFAULT: "hsl(var(--mustard))",
          muted: "hsl(var(--mustard-light))",
        },
      },

      /* ═══════════════════════════════════════════════════════════════════
         BORDER RADIUS — Friendly, rounded
      ═══════════════════════════════════════════════════════════════════ */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },

      /* ═══════════════════════════════════════════════════════════════════
         SHADOWS — Soft, warm shadows
      ═══════════════════════════════════════════════════════════════════ */
      boxShadow: {
        soft: "0 2px 8px -2px rgba(60, 40, 30, 0.08), 0 4px 12px -4px rgba(60, 40, 30, 0.12)",
        card: "0 1px 3px rgba(60, 40, 30, 0.06), 0 4px 12px rgba(60, 40, 30, 0.08)",
        elevated: "0 4px 16px -4px rgba(60, 40, 30, 0.1), 0 8px 24px -8px rgba(60, 40, 30, 0.15)",
        medium: "0 4px 12px -2px rgba(60, 40, 30, 0.08), 0 8px 24px -4px rgba(60, 40, 30, 0.12)",
        large: "0 8px 24px -4px rgba(60, 40, 30, 0.1), 0 16px 48px -8px rgba(60, 40, 30, 0.15)",
      },

      /* ═══════════════════════════════════════════════════════════════════
         SPACING — Comfortable
      ═══════════════════════════════════════════════════════════════════ */
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },

      /* ═══════════════════════════════════════════════════════════════════
         ANIMATIONS — Subtle & Natural
      ═══════════════════════════════════════════════════════════════════ */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(100%)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "fade-in-up": "fade-in-up 0.4s ease-out forwards",
        "scale-in": "scale-in 0.2s ease-out forwards",
        "slide-up": "slide-up 0.3s ease-out forwards",
        shimmer: "shimmer 1.5s infinite",
      },

      /* ═══════════════════════════════════════════════════════════════════
         TRANSITIONS — Smooth & Natural
      ═══════════════════════════════════════════════════════════════════ */
      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
