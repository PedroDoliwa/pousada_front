import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/features/auth";

const DASHBOARD_PREFIXES = [
  "/dashboard",
  "/pousadas",
  "/quartos",
  "/hospedes",
  "/reservas",
  "/calendario",
  "/integracoes-ical",
  "/consulta-inteligente",
  "/relatorios",
  "/configuracoes",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth = DASHBOARD_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (token) return NextResponse.next();

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pousadas/:path*",
    "/quartos/:path*",
    "/hospedes/:path*",
    "/reservas/:path*",
    "/calendario/:path*",
    "/integracoes-ical/:path*",
    "/consulta-inteligente/:path*",
    "/relatorios/:path*",
    "/configuracoes/:path*",
  ],
};

