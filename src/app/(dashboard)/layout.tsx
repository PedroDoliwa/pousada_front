import { DashboardChrome } from "@/features/dashboard";

export default function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardChrome>{children}</DashboardChrome>;
}

