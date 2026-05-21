import type { IsoDateString, IsoDateTimeString } from "./common";

/**
 * Entidades alinhadas ao modelo de dados da aplicação (diagrama de classes).
 * Nomes em camelCase para coincidir com JSON comum em ASP.NET Core.
 */

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  /** Hash da senha: normalmente ausente nas respostas da API para o front. */
  senhaHash?: string;
  perfil: string;
}

export interface Pousada {
  id: number;
  /** Usuário que gerencia esta pousada (cardinalidade 1 do lado Usuario). */
  usuarioId: number;
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  descricao: string | null;
  /** Presente nas respostas de leitura da API. */
  ativa?: boolean;
}

export interface Quarto {
  id: number;
  pousadaId: number;
  numeroOuNome: string;
  capacidade: number;
  /** Tarifa diária; decimal na API costuma vir como number. */
  valorDiaria: number;
  status: string;
  /** Token público para exportação `.ics` (sem JWT na URL). */
  tokenExportacao: string;
}

export interface Hospede {
  id: number;
  pousadaId: number;
  nome: string;
  telefone: string | null;
  email: string | null;
  documento: string | null;
}

export type ReservaOrigem = "Manual" | "Airbnb" | "Booking" | "Outro";

export interface Reserva {
  id: number;
  quartoId: number;
  hospedeId: number;
  /** ISO 8601 conforme API. */
  dataEntrada: IsoDateTimeString;
  dataSaida: IsoDateTimeString;
  status: string;
  valorTotal: number;
  observacoes: string | null;
  origem: ReservaOrigem;
  tituloExterno?: string | null;
}

export interface BloqueioAgenda {
  id: number;
  quartoId: number;
  dataInicio: IsoDateString;
  dataFim: IsoDateString;
  motivo: string;
}

export type CalendarioCanal = "Airbnb" | "Booking" | "Outro";

/** Feed iCal externo (importação Airbnb/Booking). */
export interface CalendarioExterno {
  id: number;
  quartoId: number;
  canal: CalendarioCanal | string;
  urlImportacao: string;
  ativo: boolean;
  ultimaSincronizacao?: IsoDateTimeString | null;
  ultimoErro?: string | null;
}

export interface CalendarioSyncResult {
  criados: number;
  atualizados: number;
  cancelados: number;
  ignorados: number;
}

/** Período de ocupação para grade de calendário (`GET /api/reservas/ocupacao`). */
export interface OcupacaoPeriodo {
  reservaId: number;
  quartoId: number;
  quartoNumeroOuNome: string;
  hospedeId: number;
  hospedeNome: string;
  dataEntrada: IsoDateTimeString;
  dataSaida: IsoDateTimeString;
  status: string;
  origem: ReservaOrigem;
}

export interface Metricas {
  pousadaId: number;
  de: IsoDateTimeString;
  ate: IsoDateTimeString;
  totalQuartos: number;
  totalReservas: number;
  taxaOcupacaoPercentual: number;
  faturamentoTotal: number;
  hospedesUnicos: number;
}

export interface VerificarDisponibilidadeResponse {
  disponivel: boolean;
}

/** @deprecated Use `CalendarioExterno`. */
export type IntegracaoICal = CalendarioExterno;

