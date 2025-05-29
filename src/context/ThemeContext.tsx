import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface ThemeContextType {
  theme: string;
  isDarkMode: boolean;
  systemPreference: string | null;
  toggleTheme: () => void;
  setTheme: (newTheme: "light" | "dark" | "system" | "high-contrast") => void;
  THEMES: typeof THEMES;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
  HIGH_CONTRAST: 'high-contrast'
} as const;

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<string>(() => {
    const savedTheme = localStorage.getItem('hms-theme');
    return savedTheme || THEMES.SYSTEM;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [systemPreference, setSystemPreference] = useState<string | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    setSystemPreference(mediaQuery.matches ? THEMES.DARK : THEMES.LIGHT);

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? THEMES.DARK : THEMES.LIGHT);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    let appliedTheme: string;

    if (theme === THEMES.SYSTEM) {
      appliedTheme = systemPreference || THEMES.LIGHT;
    } else {
      appliedTheme = theme;
    }

    const htmlElement = document.documentElement;
    htmlElement.classList.remove(THEMES.LIGHT, THEMES.DARK, THEMES.HIGH_CONTRAST);
    htmlElement.classList.add(appliedTheme);
    setIsDarkMode(appliedTheme === THEMES.DARK);

    localStorage.setItem('hms-theme', theme);
  }, [theme, systemPreference]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === THEMES.LIGHT) return THEMES.DARK;
      if (prevTheme === THEMES.DARK) return THEMES.LIGHT;
      return prevTheme;
    });
  };

  const setSpecificTheme = (newTheme: "light" | "dark" | "system" | "high-contrast") => {
    if (typeof newTheme !== 'string') {
      console.error(`Invalid theme: ${newTheme}`);
      return;
    }
    
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme);
    } else {
      console.error(`Invalid theme: ${newTheme}`);
    }
  };

  const contextValue: ThemeContextType = {
    theme,
    isDarkMode,
    systemPreference,
    toggleTheme,
    setTheme: setSpecificTheme,
    THEMES
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
