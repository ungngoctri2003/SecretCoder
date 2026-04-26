/* eslint-disable react-refresh/only-export-components -- context + hook live together */
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { createAppTheme } from '../theme';

const STORAGE_KEY = 'edustart-color-mode';

function readInitialMode() {
  if (typeof window === 'undefined') return 'light';
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === 'light' || s === 'dark') return s;
  } catch {
    // ignore
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const ColorModeContext = createContext({
  mode: 'light',
  setMode: () => {},
  toggleColorMode: () => {},
  theme: createAppTheme('light'),
});

export function ColorModeProvider({ children }) {
  const [mode, setModeState] = useState(readInitialMode);

  useLayoutEffect(() => {
    const el = document.documentElement;
    el.classList.toggle('dark', mode === 'dark');
    el.style.colorScheme = mode === 'dark' ? 'dark' : 'light';
  }, [mode]);

  const setMode = useCallback((next) => {
    setModeState((prev) => {
      const v = typeof next === 'function' ? next(prev) : next;
      if (v === 'light' || v === 'dark') {
        try {
          localStorage.setItem(STORAGE_KEY, v);
        } catch {
          // ignore
        }
        return v;
      }
      return prev;
    });
  }, []);

  const toggleColorMode = useCallback(() => {
    setModeState((m) => {
      const v = m === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, v);
      } catch {
        // ignore
      }
      return v;
    });
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const value = useMemo(
    () => ({ mode, setMode, toggleColorMode, theme }),
    [mode, setMode, toggleColorMode, theme],
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}

export function useColorMode() {
  return useContext(ColorModeContext);
}
