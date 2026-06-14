"use client";

import { userInitials } from "@/features/auth/session-user";

type Props = {
  nome: string;
  temFoto: boolean;
  size?: "sm" | "lg";
  cacheBust?: number;
  className?: string;
};

const sizeClasses = {
  sm: "size-10 text-sm",
  lg: "size-24 text-2xl",
} as const;

export function UsuarioAvatar({
  nome,
  temFoto,
  size = "sm",
  cacheBust = 0,
  className = "",
}: Props) {
  const sizeClass = sizeClasses[size];
  const fotoSrc = temFoto
    ? `/api/usuario/foto${cacheBust ? `?t=${cacheBust}` : ""}`
    : null;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-blue-600 ring-2 ring-slate-700/50 ${sizeClass} ${className}`}
    >
      {fotoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fotoSrc}
          alt={`Foto de ${nome}`}
          className="size-full object-cover"
        />
      ) : (
        <div className="grid size-full place-items-center font-semibold text-white">
          {userInitials(nome)}
        </div>
      )}
    </div>
  );
}
