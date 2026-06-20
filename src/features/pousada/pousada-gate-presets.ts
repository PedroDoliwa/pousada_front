export type PousadaGateFeature =
  | "dashboard"
  | "hospedes"
  | "quartos"
  | "reservas"
  | "calendario"
  | "relatorios"
  | "integracoes"
  | "consulta-ia";

export type PousadaGateReason = "no-pousada" | "no-selection";

type PousadaGateVerb = "visualizar" | "gerenciar" | "criar" | "configurar" | "usar";

const FEATURE_LABELS: Record<PousadaGateFeature, string> = {
  dashboard: "o painel",
  hospedes: "hóspedes",
  quartos: "quartos",
  reservas: "reservas",
  calendario: "o calendário",
  relatorios: "relatórios",
  integracoes: "integrações",
  "consulta-ia": "a consulta inteligente",
};

const DEFAULT_VERBS: Record<PousadaGateFeature, PousadaGateVerb> = {
  dashboard: "visualizar",
  hospedes: "gerenciar",
  quartos: "gerenciar",
  reservas: "gerenciar",
  calendario: "visualizar",
  relatorios: "visualizar",
  integracoes: "configurar",
  "consulta-ia": "usar",
};

export type PousadaGatePresetOptions = {
  verb?: PousadaGateVerb;
};

export type PousadaGatePreset = {
  title: string;
  description: string;
  hint?: string;
  primaryLabel: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  dismissible: boolean;
};

function verbForFeature(
  feature: PousadaGateFeature,
  options?: PousadaGatePresetOptions
): PousadaGateVerb {
  return options?.verb ?? DEFAULT_VERBS[feature];
}

export function getPousadaGatePreset(
  reason: PousadaGateReason,
  feature: PousadaGateFeature,
  options?: PousadaGatePresetOptions
): PousadaGatePreset {
  const label = FEATURE_LABELS[feature];
  const verb = verbForFeature(feature, options);

  if (reason === "no-pousada") {
    return {
      title: "Cadastre sua primeira pousada",
      description: `Você precisa cadastrar uma pousada antes de ${verb} ${label}.`,
      primaryLabel: "Cadastrar pousada",
      primaryHref: "/pousadas",
      dismissible: false,
    };
  }

  return {
    title: "Selecione uma pousada",
    description: `Escolha uma pousada ativa antes de ${verb} ${label}.`,
    hint: "Use o seletor no topo da página.",
    primaryLabel: "Entendi",
    dismissible: true,
  };
}
