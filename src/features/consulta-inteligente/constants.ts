import {
  BarChart3,
  CalendarRange,
  DollarSign,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ConsultaHistoricoItem } from "@/types/dto";

export const MAX_PERGUNTA_CHARS = 1000;
export const MAX_HISTORICO_ITEMS = 10;

export type LocalChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ConsultaSuggestionChip = {
  id: string;
  text: string;
  icon: LucideIcon;
  tone: string;
};

export const SUGGESTION_CHIPS: ConsultaSuggestionChip[] = [
  {
    id: "faturamento",
    text: "Faturamento deste mês",
    icon: DollarSign,
    tone: "bg-violet-50 text-violet-600",
  },
  {
    id: "ocupacao",
    text: "Taxa de ocupação",
    icon: BarChart3,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    id: "airbnb",
    text: "Quantas reservas do Airbnb?",
    icon: CalendarRange,
    tone: "bg-amber-50 text-amber-600",
  },
  {
    id: "hospedes",
    text: "Quantos hóspedes cadastrados?",
    icon: Users,
    tone: "bg-emerald-50 text-emerald-600",
  },
];

/**
 * Monta o histórico para a API a partir das mensagens já exibidas no chat.
 * Passe apenas trocas concluídas — a pergunta atual vai no campo `pergunta`.
 */
export function buildHistoricoParaApi(
  messages: LocalChatMessage[]
): ConsultaHistoricoItem[] {
  return messages
    .filter((message) => message.content.trim().length > 0)
    .slice(-MAX_HISTORICO_ITEMS)
    .map(({ role, content }) => ({
      role,
      conteudo: content.trim(),
    }));
}
