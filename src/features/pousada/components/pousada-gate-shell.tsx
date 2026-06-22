"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PousadaRequiredDialog } from "@/features/pousada/components/pousada-required-dialog";
import type {
  PousadaGateFeature,
  PousadaGatePresetOptions,
} from "@/features/pousada/pousada-gate-presets";
import { usePousadaGate } from "@/features/pousada/use-pousada-gate";

type Props = {
  feature: PousadaGateFeature;
  options?: PousadaGatePresetOptions;
  skeleton?: ReactNode;
  children: ReactNode;
};

export function PousadaGateShell({
  feature,
  options,
  skeleton,
  children,
}: Props) {
  const gate = usePousadaGate();
  const [selectionDismissed, setSelectionDismissed] = useState(false);

  useEffect(() => {
    setSelectionDismissed(false);
  }, [gate.blocked, gate.blocked ? gate.reason : null]);

  if (!gate.blocked) {
    return <>{children}</>;
  }

  if (gate.reason === "no-selection" && selectionDismissed) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className="min-h-[50vh] opacity-40 pointer-events-none select-none"
        aria-hidden
      >
        {skeleton ?? <div className="px-6 py-8" />}
      </div>
      <PousadaRequiredDialog
        open
        reason={gate.reason}
        feature={feature}
        options={options}
        onDismiss={
          gate.reason === "no-selection"
            ? () => setSelectionDismissed(true)
            : undefined
        }
      />
    </>
  );
}
