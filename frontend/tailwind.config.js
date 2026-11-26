/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: 'var(--bg-page)',
          subtle: 'var(--bg-subtle)',
          hero: '#EAF2FF',
          card: 'var(--bg-card)',
          hover: 'var(--bg-hover)',
          border: 'var(--border-main)',
          dark: '#0B1120',
          darkCard: '#111A2E',
          darkBorder: '#1E293B',
        },
        brand: {
          blue: '#1456D1',
          blueDark: '#0F44A8',
          blueLight: '#EAF2FF',
          emerald: '#0D9488',
          emeraldDark: '#0F766E',
          crimson: '#E11D48',
          amber: '#D97706',
          pine: '#0D9488',
          pineDark: '#0F766E',
          ochre: '#D97706',
          cobalt: '#1456D1',
          navy: '#0E1B3D',
          slate: 'var(--text-muted)',
          muted: 'var(--text-muted)',
          text: 'var(--text-main)',
          textMuted: 'var(--text-muted)',
          inverse: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Hind Siliguri"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        serif: ['"Hind Siliguri"', '"Plus Jakarta Sans"', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        soft: '0 10px 35px -10px rgba(14, 27, 61, 0.08)',
        card: '0 4px 20px -2px rgba(20, 86, 209, 0.06)',
        float: '0 18px 45px -12px rgba(14, 27, 61, 0.14)',
      },
    },
  },
  plugins: [],
};
