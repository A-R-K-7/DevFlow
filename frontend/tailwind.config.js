/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          space: '#000000',
          card: '#0a0a0a',
          surface: 'rgba(255, 255, 255, 0.03)',
        },
        border: {
          glass: 'rgba(255, 255, 255, 0.12)',
          glow: 'rgba(255, 255, 255, 0.05)',
        },
        accent: {
          primary: '#ffffff',
          secondary: '#d4d4d8',
          coral: '#e58a8a',
          yellow: '#d4b245',
          teal: '#6cb5a3',
          lightblue: '#8ab8c7',
          emerald: '#10b981',
          rose: '#f43f5e',
          cyan: '#38bdf8',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a1a1aa',
          muted: '#52525b',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        branding: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        premium: '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
        primary: '0 0 20px rgba(255, 255, 255, 0.15)',
        emerald: '0 0 20px rgba(16, 185, 129, 0.15)',
        rose: '0 0 20px rgba(244, 63, 94, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
