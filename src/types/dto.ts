import type { IsoDateTimeString } from "./common";

/** Resposta de `POST /api/auth/login` e `POST /api/auth/registro` */
export type AuthSessionResponse = {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  token: string;
};

export type AuthLoginBody = {
  email: string;
  senha: string;
};

/** `perfil` no body é ignorado pelo backend (sempre grava "Gerente"). */
export type AuthRegistroBody = {
  nome: string;
  email: string;
  senha: string;
};

/** Corpo de erro comum na API (`400`, `404`, `500`) */
export type ApiMessageBody = {
  message?: string;
};

export type PousadaCreateBody = {
  nome: string;
  descricao?: string | null;
  endereco: string;
  telefone: string;
  email: string;
};

export type PousadaUpdateBody = {
  id: number;
  nome: string;
  descricao?: string | null;
  endereco: string;
  telefone: string;
  email: string;
};

export type QuartoCreateBody = {
  pousadaId: number;
  numeroOuNome: string;
  capacidade: number;
  valorDiaria: number;
};

export type QuartoUpdateBody = {
  id: number;
  numeroOuNome: string;
  capacidade: number;
  valorDiaria: number;
  status: string;
};

export type HospedeCreateBody = {
  pousadaId: number;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  documento?: string | null;
};

export type HospedeUpdateBody = {
  id: number;
} & HospedeCreateBody;

export type ReservaCreateBody = {
  quartoId: number;
  hospedeId: number;
  dataEntrada: IsoDateTimeString;
  dataSaida: IsoDateTimeString;
  observacoes?: string | null;
};

export type ReservaUpdateBody = {
  id: number;
  quartoId: number;
  hospedeId: number;
  dataEntrada: IsoDateTimeString;
  dataSaida: IsoDateTimeString;
  observacoes?: string | null;
  status?: string;
};

