import type { Metadata } from "next";
import { LandingPage } from "@/features/landing";

export const metadata: Metadata = {
  title: "Sistema de Pousada — Gestão de reservas e hospedagem",
  description:
    "Plataforma completa para gerenciar reservas, calendário, hóspedes e operação da sua pousada.",
};

export default function Home() {
  return <LandingPage />;
}
