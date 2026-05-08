export function messageFromApiPayload(
  payload: unknown,
  fallback: string
): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const m = (payload as { message: unknown }).message;
    if (typeof m === "string" && m.length > 0) return m;
  }
  return fallback;
}

