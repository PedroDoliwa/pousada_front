import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Sistema de Pousada
        </h1>
        <p className="mt-2 max-w-md text-slate-600">
          Front-end em construção. Use os links abaixo para navegar entre as
          áreas já preparadas.
        </p>
      </div>
      <nav className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Login
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          Dashboard
        </Link>
      </nav>
    </div>
  );
}

