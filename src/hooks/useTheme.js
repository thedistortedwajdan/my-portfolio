import { useCallback, useEffect, useState } from 'react';

export const THEME_KEY = 'dossier-theme';

export function readStoredTheme() {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// An explicit choice (stored per browser) wins. Otherwise the page follows the system setting.
export function useTheme() {
  const [explicit, setExplicit] = useState(readStoredTheme);
  const [system, setSystem] = useState(systemTheme);

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!query) return undefined;
    const onChange = () => setSystem(query.matches ? 'dark' : 'light');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const theme = explicit ?? system;

  useEffect(() => {
    const root = document.documentElement;
    if (explicit) root.setAttribute('data-theme', explicit);
    else root.removeAttribute('data-theme');
  }, [explicit]);

  const toggle = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setExplicit(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage can be blocked. The choice still applies for this visit.
    }
  }, [theme]);

  return { theme, toggle };
}
