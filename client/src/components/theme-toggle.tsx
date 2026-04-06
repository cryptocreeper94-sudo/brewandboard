import { useState, useEffect } from "react";

type Theme = "dark" | "light" | "system";

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem("dwtl-theme");
    if (stored === "dark" || stored === "light" || stored === "system") return stored;
  } catch {}
  return "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  if (theme === "system") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.add(isDark ? "dark" : "light");
  } else {
    root.classList.add(theme);
  }
}

/** Floating theme toggle — renders as a small pill in the bottom-left corner.
 *  Drop into any app's root component: `<FloatingThemeToggle />` */
export function FloatingThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("dwtl-theme", t);
    applyTheme(t);
  };

  useEffect(() => {
    applyTheme(theme);
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  const icons: Record<Theme, string> = { dark: "🌙", light: "☀️", system: "🖥️" };
  const labels: Record<Theme, string> = { dark: "Dark", light: "Light", system: "Auto" };
  const next: Record<Theme, Theme> = { dark: "light", light: "system", system: "dark" };

  return (
    <button
      onClick={() => setTheme(next[theme])}
      className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 shadow-lg"
      style={{
        background: 'var(--glass-bg, rgba(16,16,26,0.72))',
        border: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
        backdropFilter: 'blur(12px)',
        color: 'var(--text-primary, #fff)',
      }}
      title={`Theme: ${theme} — click to switch`}
      data-testid="button-theme-toggle"
    >
      <span>{icons[theme]}</span>
      <span style={{ color: 'var(--text-muted, rgba(255,255,255,0.5))' }}>{labels[theme]}</span>
    </button>
  );
}

/** Inline theme toggle — for embedding in navbars/headers */
export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("dwtl-theme", t);
    applyTheme(t);
  };

  useEffect(() => {
    applyTheme(theme);
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  const icons: Record<Theme, string> = { dark: "🌙", light: "☀️", system: "🖥️" };
  const next: Record<Theme, Theme> = { dark: "light", light: "system", system: "dark" };

  return (
    <button
      onClick={() => setTheme(next[theme])}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all duration-200 hover:scale-110"
      style={{ background: 'var(--glass-bg, rgba(255,255,255,0.1))', border: '1px solid var(--glass-border, rgba(255,255,255,0.1))' }}
      title={`Theme: ${theme}`}
      data-testid="button-theme-toggle"
    >
      {icons[theme]}
    </button>
  );
}
