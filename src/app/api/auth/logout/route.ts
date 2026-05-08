import { NextResponse } from "next/server";
import { clearAuthTokenCookie } from "@/features/auth/server/session";

export async function POST() {
  await clearAuthTokenCookie();
  return NextResponse.json({ ok: true });
}

