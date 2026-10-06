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
          600: '#15803d',
          700: '#166534',
        },
        brand: {
          red: '#dc2626',
          dark: '#0f172a',
          surface: '#1e293b',
          muted: '#64748b',
        },
      },
    },
  },
  plugins: [],
};
