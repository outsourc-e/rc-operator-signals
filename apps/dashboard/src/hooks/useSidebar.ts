import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'rc-dashboard-sidebar';

function getInitial(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'collapsed';
}

export function useSidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(() => getInitial());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? 'collapsed' : 'expanded');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const toggle = useCallback(() => setCollapsed((v) => !v), []);

  return { collapsed, toggle, setCollapsed } as const;
}
