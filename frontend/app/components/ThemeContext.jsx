'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('jonoshor_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && prefersDark);
    const activeTheme = isDark ? 'dark' : 'light';

    setTheme(activeTheme);
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = activeTheme;

    // Listen for system/device theme changes when user has no manual override
    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    if (mediaQuery && mediaQuery.addEventListener) {
      const handleSystemChange = (e) => {
        const userSaved = localStorage.getItem('jonoshor_theme');
        if (!userSaved) {
          const sysTheme = e.matches ? 'dark' : 'light';
          setTheme(sysTheme);
          document.documentElement.classList.toggle('dark', e.matches);
          document.documentElement.style.colorScheme = sysTheme;
        }
      };
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }
  }, []);

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const nextTheme = isCurrentlyDark ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('jonoshor_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.documentElement.style.colorScheme = nextTheme;
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { theme: 'light', toggleTheme: () => {}, mounted: false };
  }
  return ctx;
}
