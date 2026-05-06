import { messageFromApiPayload } from "./parse-error";

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, payload: unknown, message?: string) {
    super(
      message ??
        messageFromApiPayload(payload, `Erro HTTP ${status}`)
    );
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}
