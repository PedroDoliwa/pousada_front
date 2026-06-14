import { NextResponse } from "next/server";
import { getAuthTokenFromCookie } from "@/features/auth/server/session";

function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) {
    throw new Error(
      "Configure NEXT_PUBLIC_API_URL no .env.local (veja .env.local.example)."
    );
  }
  return raw.replace(/\/$/, "");
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const token = await getAuthTokenFromCookie();
  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const pousadaId = Number(id);
  if (!Number.isFinite(pousadaId)) {
    return NextResponse.json({ message: "Pousada inválida." }, { status: 400 });
  }

  const res = await fetch(`${getApiBaseUrl()}/api/pousadas/${pousadaId}/foto`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    let message = "Foto da pousada não encontrada.";
    try {
      const json = JSON.parse(text) as { message?: string };
      if (json.message) message = json.message;
    } catch {
      // mantém mensagem padrão
    }
    return NextResponse.json({ message }, { status: res.status });
  }

  const bytes = await res.arrayBuffer();
  const contentType = res.headers.get("Content-Type") ?? "image/jpeg";

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    },
  });
}
