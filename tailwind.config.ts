import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
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
        pink: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
          950: "#500724",
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
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'var(--tw-prose-body)',
            '[class~="lead"]': {
              color: 'var(--tw-prose-lead)',
            },
            a: {
              color: 'var(--tw-prose-links)',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            strong: {
              color: 'var(--tw-prose-bold)',
              fontWeight: '600',
            },
            ol: {
              listStyleType: 'decimal',
            },
            'ol[type="A"]': {
              listStyleType: 'upper-alpha',
            },
            'ol[type="a"]': {
              listStyleType: 'lower-alpha',
            },
            'ol[type="A" s]': {
              listStyleType: 'upper-alpha',
            },
            'ol[type="a" s]': {
              listStyleType: 'lower-alpha',
            },
            'ol[type="I"]': {
              listStyleType: 'upper-roman',
            },
            'ol[type="i"]': {
              listStyleType: 'lower-roman',
            },
            'ol[type="I" s]': {
              listStyleType: 'upper-roman',
            },
            'ol[type="i" s]': {
              listStyleType: 'lower-roman',
            },
            'ol[type="1"]': {
              listStyleType: 'decimal',
            },
            ul: {
              listStyleType: 'disc',
            },
            hr: {
              borderColor: 'var(--tw-prose-hr)',
              borderTopWidth: 1,
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'italic',
              color: 'var(--tw-prose-quotes)',
              borderLeftWidth: '0.25rem',
              borderLeftColor: 'var(--tw-prose-quote-borders)',
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
            },
            h1: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '800',
            },
            h2: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '700',
            },
            h3: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '600',
            },
            h4: {
              color: 'var(--tw-prose-headings)',
              fontWeight: '600',
            },
            'figure figcaption': {
              color: 'var(--tw-prose-captions)',
            },
            code: {
              color: 'var(--tw-prose-code)',
              fontWeight: '600',
            },
            'a code': {
              color: 'var(--tw-prose-links)',
            },
            pre: {
              color: 'var(--tw-prose-pre-code)',
              backgroundColor: 'var(--tw-prose-pre-bg)',
              overflowX: 'auto',
              fontWeight: '400',
            },
            table: {
              width: '100%',
              tableLayout: 'auto',
              textAlign: 'left',
              marginTop: '2em',
              marginBottom: '2em',
            },
            thead: {
              borderBottomWidth: '1px',
              borderBottomColor: 'var(--tw-prose-th-borders)',
            },
            'thead th': {
              color: 'var(--tw-prose-headings)',
              fontWeight: '600',
              verticalAlign: 'bottom',
              paddingRight: '0.5714286em',
              paddingBottom: '0.5714286em',
              paddingLeft: '0.5714286em',
            },
            'tbody tr': {
              borderBottomWidth: '1px',
              borderBottomColor: 'var(--tw-prose-td-borders)',
            },
            'tbody tr:last-child': {
              borderBottomWidth: '0',
            },
            'tbody td': {
              verticalAlign: 'baseline',
            },
            tfoot: {
              borderTopWidth: '1px',
              borderTopColor: 'var(--tw-prose-th-borders)',
            },
            'tfoot td': {
              verticalAlign: 'top',
            },
            'figure > *': {
              margin: '0',
            },
            figcaption: {
              color: 'var(--tw-prose-captions)',
              fontSize: '0.875em',
              lineHeight: '1.4285714',
              marginTop: '0.8571429em',
            },
          },
        },
        pink: {
          css: {
            '--tw-prose-body': 'var(--tw-prose-invert-body)',
            '--tw-prose-headings': 'var(--tw-prose-invert-headings)',
            '--tw-prose-links': 'var(--tw-prose-invert-links)',
            '--tw-prose-links-hover': 'var(--tw-prose-invert-links-hover)',
            '--tw-prose-underline': 'var(--tw-prose-invert-underline)',
            '--tw-prose-underline-hover': 'var(--tw-prose-invert-underline-hover)',
            '--tw-prose-bold': 'var(--tw-prose-invert-bold)',
            '--tw-prose-counters': 'var(--tw-prose-invert-counters)',
            '--tw-prose-bullets': 'var(--tw-prose-invert-bullets)',
            '--tw-prose-hr': 'var(--tw-prose-invert-hr)',
            '--tw-prose-quotes': 'var(--tw-prose-invert-quotes)',
            '--tw-prose-quote-borders': 'var(--tw-prose-invert-quote-borders)',
            '--tw-prose-captions': 'var(--tw-prose-invert-captions)',
            '--tw-prose-code': 'var(--tw-prose-invert-code)',
            '--tw-prose-pre-code': 'var(--tw-prose-invert-pre-code)',
            '--tw-prose-pre-bg': 'var(--tw-prose-invert-pre-bg)',
            '--tw-prose-th-borders': 'var(--tw-prose-invert-th-borders)',
            '--tw-prose-td-borders': 'var(--tw-prose-invert-td-borders)',
            '--tw-prose-invert-body': '#e5e7eb',
            '--tw-prose-invert-headings': '#f3f4f6',
            '--tw-prose-invert-links': '#f472b6',
            '--tw-prose-invert-links-hover': '#ec4899',
            '--tw-prose-invert-underline': '#f472b6',
            '--tw-prose-invert-underline-hover': '#ec4899',
            '--tw-prose-invert-bold': '#f9fafb',
            '--tw-prose-invert-counters': '#d1d5db',
            '--tw-prose-invert-bullets': '#d1d5db',
            '--tw-prose-invert-hr': '#374151',
            '--tw-prose-invert-quotes': '#f3f4f6',
            '--tw-prose-invert-quote-borders': '#4b5563',
            '--tw-prose-invert-captions': '#9ca3af',
            '--tw-prose-invert-code': '#f3f4f6',
            '--tw-prose-invert-pre-code': '#f3f4f6',
            '--tw-prose-invert-pre-bg': '#1f2937',
            '--tw-prose-invert-th-borders': '#4b5563',
            '--tw-prose-invert-td-borders': '#374151',
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

export default config

