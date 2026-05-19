"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Pousada } from "@/types/entities";
import {
  ACTIVE_POUSADA_STORAGE_KEY,
  readActivePousadaId,
  writeActivePousadaId,
} from "./active-pousada";

type ActivePousadaContextValue = {
  pousadas: Pousada[];
  selectedId: number | null;
  selected: Pousada | undefined;
  setSelectedId: (id: number) => void;
};

const ActivePousadaContext = createContext<ActivePousadaContextValue | null>(
  null
);

type ProviderProps = {
  pousadas: Pousada[];
  children: ReactNode;
};

export function ActivePousadaProvider({ pousadas, children }: ProviderProps) {
  const [selectedId, setSelectedIdState] = useState<number | null>(() =>
    readActivePousadaId(pousadas)
  );

  const setSelectedId = useCallback((id: number) => {
    writeActivePousadaId(id);
    setSelectedIdState(id);
  }, []);

  const selected = useMemo(
    () => pousadas.find((p) => p.id === selectedId),
    [pousadas, selectedId]
  );

  const value = useMemo(
    () => ({ pousadas, selectedId, selected, setSelectedId }),
    [pousadas, selectedId, selected, setSelectedId]
  );

  return (
    <ActivePousadaContext.Provider value={value}>
      {children}
    </ActivePousadaContext.Provider>
  );
}

export function useActivePousada(): ActivePousadaContextValue {
  const ctx = useContext(ActivePousadaContext);
  if (!ctx) {
    throw new Error(
      "useActivePousada deve ser usado dentro de ActivePousadaProvider"
    );
  }
  return ctx;
}

/** Hook opcional quando o provider ainda não está montado (ex.: carregamento inicial). */
export function useActivePousadaOptional(): ActivePousadaContextValue | null {
  return useContext(ActivePousadaContext);
}

export { ACTIVE_POUSADA_STORAGE_KEY };
