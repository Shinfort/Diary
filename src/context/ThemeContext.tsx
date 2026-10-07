"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppTheme = 'classic' | 'kuromi-miku';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  isKuromiMiku: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'classic',
  setTheme: () => {},
  toggleTheme: () => {},
  isKuromiMiku: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('classic');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read stored theme from localStorage
    try {
      const savedTheme = localStorage.getItem('diary_theme') as AppTheme;
      if (savedTheme === 'kuromi-miku' || savedTheme === 'classic') {
        setThemeState(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.body.setAttribute('data-theme', savedTheme);
      } else {
        document.documentElement.setAttribute('data-theme', 'classic');
        document.body.setAttribute('data-theme', 'classic');
      }
    } catch (e) {
      // Ignore if localStorage unavailable
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('diary_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      document.body.setAttribute('data-theme', newTheme);
    } catch (e) {
      // Ignore
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'kuromi-miku' ? 'classic' : 'kuromi-miku';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isKuromiMiku: theme === 'kuromi-miku',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
