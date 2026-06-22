"use client";

import { useActivePousada } from "./use-active-pousada";
import type { PousadaGateReason } from "./pousada-gate-presets";

export type PousadaGate =
  | { blocked: false; pousadaId: number }
  | {
      blocked: true;
      reason: PousadaGateReason;
      pousadaId: null;
    };

export function usePousadaGate(): PousadaGate {
  const { pousadas, selectedId, selected } = useActivePousada();

  if (pousadas.length === 0) {
    return { blocked: true, reason: "no-pousada", pousadaId: null };
  }

  if (selectedId == null || selected == null) {
    return { blocked: true, reason: "no-selection", pousadaId: null };
  }

  return { blocked: false, pousadaId: selectedId };
}
