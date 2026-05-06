/**
 * Tipos utilitários compartilhados por entidades e pela camada de API.
 */

/** Valor de data-only serializado em JSON (ex.: "2026-05-06"). */
export type IsoDateString = string;

/** Valor de data/hora em ISO 8601 (ex.: "2026-05-06T14:00:00Z"). */
export type IsoDateTimeString = string;

/** Resposta paginada típica de APIs REST (ajuste nomes se o backend usar outros). */
export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
