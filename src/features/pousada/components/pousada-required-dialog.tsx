"use client";

import { RequiredActionDialog } from "@/components/ui/required-action-dialog";
import {
  getPousadaGatePreset,
  type PousadaGateFeature,
  type PousadaGatePresetOptions,
  type PousadaGateReason,
} from "@/features/pousada/pousada-gate-presets";

type Props = {
  open: boolean;
  reason: PousadaGateReason;
  feature: PousadaGateFeature;
  options?: PousadaGatePresetOptions;
  onDismiss?: () => void;
};

export function PousadaRequiredDialog({
  open,
  reason,
  feature,
  options,
  onDismiss,
}: Props) {
  const preset = getPousadaGatePreset(reason, feature, options);

  return (
    <RequiredActionDialog
      open={open}
      overlayScope="dashboard-main"
      title={preset.title}
      description={preset.description}
      hint={preset.hint}
      dismissible={preset.dismissible}
      onClose={onDismiss}
      primaryAction={{
        label: preset.primaryLabel,
        href: preset.primaryHref,
        onClick: preset.dismissible ? onDismiss : undefined,
      }}
      secondaryAction={
        preset.secondaryLabel
          ? {
              label: preset.secondaryLabel,
              href: preset.secondaryHref,
            }
          : undefined
      }
    />
  );
}
