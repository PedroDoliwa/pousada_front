export { ApiError } from "./errors";
export { API_PREFIX, apiPath } from "./constants";
export { messageFromApiPayload } from "./parse-error";
export {
  api,
  apiRequest,
  clearAuth,
  getApiBaseUrl,
  getAuthToken,
  setAuthToken,
  type ApiRequestOptions,
} from "./client";
export * as authApi from "./auth";
export * as pousadasApi from "./pousadas";
export * as quartosApi from "./quartos";
export * as hospedesApi from "./hospedes";
export * as reservasApi from "./reservas";
export { login, registro } from "./auth";
export {
  createPousada,
  deletePousada,
  getPousada,
  listPousadas,
  updatePousada,
} from "./pousadas";
export {
  createQuarto,
  deleteQuarto,
  getQuarto,
  listQuartos,
  updateQuarto,
} from "./quartos";
export {
  createHospede,
  deleteHospede,
  getHospede,
  listHospedes,
  updateHospede,
} from "./hospedes";
export {
  createReserva,
  deleteReserva,
  getReserva,
  listReservas,
  updateReserva,
} from "./reservas";
