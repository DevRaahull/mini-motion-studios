/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#08090d',
          dark: '#0c0e14',
          card: '#12151e',
          cardHover: '#181b26',
          border: '#1e2330',
          borderLight: '#2a3142',
          red: '#e52b2b',
          redLight: '#ff4444',
          redGlow: 'rgba(229, 43, 43, 0.35)',
          amber: '#f59e0b',
          green: '#10b981',
          muted: '#80899e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(229, 43, 43, 0.4)',
        'glow-red-lg': '0 0 35px rgba(229, 43, 43, 0.55)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.4)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.4)',
        'card-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'red-gradient': 'linear-gradient(135deg, #e52b2b 0%, #991b1b 100%)',
        'radial-glow': 'radial-gradient(circle at 50% 50%, rgba(229, 43, 43, 0.15) 0%, transparent 70%)',
      }
    },
  },
  plugins: [],
}
