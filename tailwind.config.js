/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#070C16',
          900: '#0B1220', // Main background
          850: '#0E1729',
          800: '#111B2E', // Panels, cards & Sidebar
          750: '#16233B', // Card hover / Active button
          700: '#1E2B45', // Borders
          600: '#2A3B5E', // Light border
          500: '#3D5380',
        },
        gold: {
          DEFAULT: '#D6B36A', // Champagne gold accent
          light: '#E6CA85',
          dark: '#B08E46',
          muted: '#8C7238',
          glow: 'rgba(214, 179, 106, 0.25)',
        },
        ink: {
          primary: '#F5F3EE',   // Primary text
          secondary: '#AAB4C5', // Secondary text
          muted: '#7A8699',     // Muted text
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(214, 179, 106, 0.2)',
        'gold-glow-lg': '0 0 35px rgba(214, 179, 106, 0.35)',
        'panel': '0 8px 30px rgba(0, 0, 0, 0.45)',
      }
    },
  },
  plugins: [],
}
