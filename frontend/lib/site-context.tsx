"use client";

import * as React from "react";

const STORAGE_KEY = "janalytics:selected-site";

interface SiteContextValue {
  siteId?: string;
  setSiteId: (siteId: string) => void;
}

const SiteContext = React.createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [siteId, setSiteIdState] = React.useState<string | undefined>();

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setSiteIdState(stored);
  }, []);

  const setSiteId = React.useCallback((nextSiteId: string) => {
    setSiteIdState(nextSiteId);
    window.localStorage.setItem(STORAGE_KEY, nextSiteId);
  }, []);

  const value = React.useMemo(
    () => ({ siteId, setSiteId }),
    [siteId, setSiteId],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = React.useContext(SiteContext);
  if (!context) throw new Error("useSite must be used within a SiteProvider");
  return context;
}
