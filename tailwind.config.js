/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Emerald primary
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        tactile: {
          card: '#ffffff',
          bg: '#f8fafc',
          border: '#e2e8f0',
          dark: '#1e293b',
        },
      },
      boxShadow: {
        'tactile': '0 4px 0 0 rgba(0, 0, 0, 0.15)',
        'tactile-lg': '0 6px 0 0 rgba(0, 0, 0, 0.16)',
        'tactile-brand': '0 4px 0 0 #15803d',
        'tactile-amber': '0 4px 0 0 #b45309',
        'tactile-rose': '0 4px 0 0 #be123c',
        'tactile-blue': '0 4px 0 0 #1d4ed8',
        'tactile-dark': '0 4px 0 0 #0f172a',
      }
    },
  },
  plugins: [],
}
