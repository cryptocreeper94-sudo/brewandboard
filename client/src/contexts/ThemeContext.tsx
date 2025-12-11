import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { allThemes } from "@/data/themes";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  watermark?: string;
  category: ThemeCategory;
}

export type ThemeCategory = 
  | "classic" 
  | "coffee"
  | "nfl" | "mlb" | "nba" | "nhl" | "mls" 
  | "wsl" | "epl" | "laliga" | "bundesliga" | "seriea" | "ligue1" 
  | "college" | "golf" | "nature";

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "brewboard_theme_id";

function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement;
  
  root.setAttribute("data-theme", theme.id);
  root.setAttribute("data-theme-category", theme.category);
  
  root.style.setProperty("--theme-primary", theme.colors.primary);
  root.style.setProperty("--theme-secondary", theme.colors.secondary);
  root.style.setProperty("--theme-accent", theme.colors.accent);
  root.style.setProperty("--theme-background", theme.colors.background);
  root.style.setProperty("--theme-card-bg", theme.colors.cardBg);
  root.style.setProperty("--theme-text-primary", theme.colors.textPrimary);
  root.style.setProperty("--theme-text-secondary", theme.colors.textSecondary);
  
  if (theme.watermark) {
    root.style.setProperty("--theme-watermark", `url(${theme.watermark})`);
  } else {
    root.style.removeProperty("--theme-watermark");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId) {
        const found = allThemes.find(t => t.id === savedId);
        if (found) return found;
      }
    }
    return allThemes.find(t => t.id === "coffee-classic") || allThemes[0];
  });

  const setTheme = (themeId: string) => {
    const theme = allThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem(STORAGE_KEY, themeId);
      applyThemeToDOM(theme);
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currentTheme.id);
    applyThemeToDOM(currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes: allThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
