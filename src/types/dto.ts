import type { IsoDateTimeString } from "./common";
import type { CalendarioCanal } from "./entities";

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

export type VerificarDisponibilidadeBody = {
  quartoId: number;
  dataEntrada: IsoDateTimeString;
  dataSaida: IsoDateTimeString;
  reservaIdIgnorar?: number | null;
};

export type CalendarioExternoCreateBody = {
  quartoId: number;
  canal: CalendarioCanal;
  urlImportacao: string;
};

export type CalendarioExternoUpdateBody = {
  id: number;
  canal: CalendarioCanal;
  urlImportacao: string;
  ativo: boolean;
};

/** Item do histórico de `POST /api/consulta` */
export type ConsultaHistoricoItem = {
  role: "user" | "assistant";
  conteudo: string;
};

/** Corpo de `POST /api/consulta` */
export type ConsultaRequestBody = {
  pousadaId: number;
  pergunta: string;
  historico?: ConsultaHistoricoItem[];
};

export type ConsultaPeriodo = {
  de: string;
  ate: string;
};

/** Resposta de `POST /api/consulta` */
export type ConsultaResponse = {
  resposta: string;
  ferramentasUsadas: string[];
  periodoConsultado?: ConsultaPeriodo | null;
};

