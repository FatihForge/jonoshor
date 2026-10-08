/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,html}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#16a34a',
          600: '#059669',
          700: '#047857',
        },
        brand: {
          red: '#dc2626',
          dark: '#0f172a',
          canvas: '#f8fafc',
          surface: '#ffffff',
          card: '#ffffff',
          border: '#e2e8f0',
          muted: '#64748b',
        },
      },
    },
  },
  plugins: [],
};
