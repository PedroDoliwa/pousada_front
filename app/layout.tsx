import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthHydrate } from "@/components/auth/AuthHydrate";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sistema de Pousada",
  description: "Gestão de reservas e ocupação para pousadas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthHydrate>{children}</AuthHydrate>
      </body>
    </html>
  );
}
