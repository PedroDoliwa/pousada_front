export { ApiError } from "./errors";
export { API_PREFIX, apiPath } from "./constants";
export { messageFromApiPayload } from "./parse-error";
export { withPousadaId } from "./query";
export {
  handleApiErrorForClient,
  redirectToLoginOnClient,
} from "./handle-unauthorized";
export { apiRequestServer } from "./server-client";
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
export * as usuarioApi from "./usuario";
export * as pousadasApi from "./pousadas";
export * as quartosApi from "./quartos";
export * as hospedesApi from "./hospedes";
export * as reservasApi from "./reservas";
export * as calendariosApi from "./calendarios";
export * as metricasApi from "./metricas";
export { login, registro, esqueciSenha, redefinirSenha } from "./auth";
export {
  getPerfil,
  updatePerfil,
  updateSenha,
  solicitarRedefinicaoSenha,
  uploadFoto,
  deleteFoto,
} from "./usuario";
export {
  createPousada,
  deletePousada,
  deletePousadaFoto,
  getPousada,
  listPousadas,
  updatePousada,
  uploadPousadaFoto,
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
  listOcupacao,
  updateReserva,
  verificarDisponibilidade,
} from "./reservas";
export {
  createCalendario,
  deleteCalendario,
  getCalendario,
  listCalendarios,
  sincronizarCalendario,
  updateCalendario,
} from "./calendarios";
export { getMetricas } from "./metricas";
export { urlExportacaoIcs } from "./quartos";

