/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': 'var(--bg-main)',
        'text-main': 'var(--text-main)',
        'border-main': 'var(--border-main)',
        'shadow-main': 'var(--shadow-main)',
        'shadow-hard': 'var(--shadow-hard)',
        'flash-pink': '#ff3366',
        accent: '#ff3366',
        fomo: '#FF2D55',
        available: '#00C27C',
      },
      fontFamily: {
        sans: ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
