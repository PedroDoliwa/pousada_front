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
  descricao: string;
}

export interface Quarto {
  id: number;
  pousadaId: number;
  numeroOuNome: string;
  capacidade: number;
  /** Tarifa diária; decimal na API costuma vir como number. */
  valorDiaria: number;
  status: string;
}

export interface Hospede {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  documento: string;
}

export interface Reserva {
  id: number;
  quartoId: number;
  hospedeId: number;
  dataEntrada: IsoDateString;
  dataSaida: IsoDateString;
  status: string;
  origem: string;
  valorTotal: number;
  observacoes: string;
}

export interface BloqueioAgenda {
  id: number;
  quartoId: number;
  dataInicio: IsoDateString;
  dataFim: IsoDateString;
  motivo: string;
}

export interface IntegracaoICal {
  id: number;
  quartoId: number;
  urlCalendario: string;
  plataforma: string;
  ultimaSincronizacao: IsoDateTimeString | null;
}
