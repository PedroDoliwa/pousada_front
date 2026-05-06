import { ApiError } from "./errors";

/** Token Bearer em memória (definir após login no cliente com `setAuthToken`). */
let bearerToken: string | null = null;

export function setAuthToken(token: string | null): void {
  bearerToken = token;
}

export function getAuthToken(): string | null {
  return bearerToken;
}

export function clearAuth(): void {
  bearerToken = null;
}

/**
 * URL base da API, sem barra final.
 * Usa `NEXT_PUBLIC_API_URL` (obrigatória para chamadas que passam por este cliente).
 */
export function getApiBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

function buildUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "Configure NEXT_PUBLIC_API_URL no .env.local (veja .env.local.example)."
    );
  }
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (typeof body === "string") return body;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function shouldSetJsonContentType(body: unknown): boolean {
  if (body === undefined || body === null) return false;
  if (typeof body === "string") return false;
  if (body instanceof FormData) return false;
  return true;
}

export async function apiRequest<T>(
  path: string,
  init: ApiRequestOptions = {}
): Promise<T> {
  const { body, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);

  if (shouldSetJsonContentType(body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(buildUrl(path), {
    ...rest,
    headers,
    body: serializeBody(body),
  });

  const payload = await parseBody(res);

  if (!res.ok) {
    throw new ApiError(res.status, payload, res.statusText);
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, init?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...init, method: "GET" }),

  post: <T>(path: string, body?: unknown, init?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...init, method: "POST", body }),

  put: <T>(path: string, body?: unknown, init?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...init, method: "PUT", body }),

  patch: <T>(path: string, body?: unknown, init?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...init, method: "PATCH", body }),

  delete: <T>(path: string, init?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...init, method: "DELETE" }),
};
