import { getTranslations } from "@/lib/server/language"
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { listTransferRequestsForTeam } from "@/lib/server/serverUtils";
import { enrichTransferRequests } from "@/lib/server/mongoose/helpers/transferRequests";
import RequestsSection from "../sections/RequestsSection";

export async function generateMetadata() {
  const t = await getTranslations()
  return { title: t("Requests") }
}

export default async function TeamRequestsPage() {
  const { user, team } = await useServerAuth();

  const requestDocs = await listTransferRequestsForTeam(team);
  const requests = await enrichTransferRequests(requestDocs, "toJsonAsTeamAdmin");

  return (
    <RequestsSection requests={requests} role={user.role} />
  );
}
