import { CalendarioView, loadCalendarioDataServer } from "@/features/calendario";

export default function CalendarioPage() {
  return <CalendarioView loadData={loadCalendarioDataServer} />;
}
