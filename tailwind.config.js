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
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Royal Blue EC SMEGA Primary
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        crimson: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626', // Crimson Merah Putih EC
          700: '#b91c1c',
          800: '#991b1b',
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
        'tactile-brand': '0 4px 0 0 #1e3a8a',
        'tactile-crimson': '0 4px 0 0 #991b1b',
        'tactile-amber': '0 4px 0 0 #b45309',
        'tactile-rose': '0 4px 0 0 #be123c',
        'tactile-blue': '0 4px 0 0 #1d4ed8',
        'tactile-dark': '0 4px 0 0 #0f172a',
      }
    },
  },
  plugins: [],
}
