/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#0b0f19',
          subtle: '#111827',
          card: '#161f30',
          hover: '#1e293b',
          border: '#1f2d42',
        },
        brand: {
          emerald: '#10b981',
          emeraldDark: '#059669',
          crimson: '#f43f5e',
          amber: '#f59e0b',
          blue: '#3b82f6',
          slate: '#94a3b8',
          text: '#f8fafc',
          textMuted: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
