import { useCallback, useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../lib/storage';

export type ThemeChoice = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'sheet-cutting.theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function readChoice(): ThemeChoice {
  const stored = readStorage(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : 'auto';
}

function systemPrefersDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(readChoice);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const listener = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const resolved: 'light' | 'dark' = choice === 'auto' ? (systemDark ? 'dark' : 'light') : choice;

  useEffect(() => {
    const root = document.documentElement;
    const applyResolved = () => root.setAttribute('data-bs-theme', resolved);
    const applyPrint = () => root.setAttribute('data-bs-theme', 'light');

    applyResolved();
    window.addEventListener('beforeprint', applyPrint);
    window.addEventListener('afterprint', applyResolved);
    return () => {
      window.removeEventListener('beforeprint', applyPrint);
      window.removeEventListener('afterprint', applyResolved);
    };
  }, [resolved]);

  const update = useCallback((next: ThemeChoice) => {
    writeStorage(STORAGE_KEY, next);
    setChoice(next);
  }, []);

  return { choice, setChoice: update };
}
