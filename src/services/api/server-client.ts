"use server";

import { ApiError } from "./errors";
import { messageFromApiPayload } from "./parse-error";
import { getAuthTokenFromCookie } from "@/features/auth/server/session";

function getApiBaseUrlServer(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) {
    throw new Error(
      "Configure NEXT_PUBLIC_API_URL no .env.local (veja .env.local.example)."
    );
  }
  return raw.replace(/\/$/, "");
}

function buildUrl(path: string): string {
  const base = getApiBaseUrlServer();
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
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

export type ApiRequestServerInit = Omit<RequestInit, "body"> & {
  auth?: boolean;
  body?: unknown;
};

export async function apiRequestServer<T>(
  path: string,
  init: ApiRequestServerInit = {}
): Promise<T> {
  const { auth = true, body, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);

  const isFormData = body instanceof FormData;

  if (body !== undefined && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = await getAuthTokenFromCookie();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(buildUrl(path), {
    ...rest,
    headers,
    body:
      body === undefined
        ? undefined
        : isFormData
          ? body
          : JSON.stringify(body),
    cache: "no-store",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const payload = await parseBody(res);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      payload,
      messageFromApiPayload(payload, res.statusText)
    );
  }
  return payload as T;
}

