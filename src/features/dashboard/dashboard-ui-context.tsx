"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DashboardUiContextValue = {
  pendingIcalCount: number;
  setPendingIcalCount: (count: number) => void;
};

const DashboardUiContext = createContext<DashboardUiContextValue | null>(null);

export function DashboardUiProvider({ children }: { children: ReactNode }) {
  const [pendingIcalCount, setPendingIcalCount] = useState(0);
  const value = useMemo(
    () => ({ pendingIcalCount, setPendingIcalCount }),
    [pendingIcalCount]
  );
  return (
    <DashboardUiContext.Provider value={value}>
      {children}
    </DashboardUiContext.Provider>
  );
}

export function useDashboardUi(): DashboardUiContextValue {
  const ctx = useContext(DashboardUiContext);
  if (!ctx) {
    throw new Error(
      "useDashboardUi deve ser usado dentro de DashboardUiProvider"
    );
  }
  return ctx;
}

export function useDashboardUiOptional(): DashboardUiContextValue | null {
  return useContext(DashboardUiContext);
}
