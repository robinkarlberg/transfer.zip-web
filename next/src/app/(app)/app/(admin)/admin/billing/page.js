
import { getTranslations } from "@/lib/server/language"
import { redirect } from "next/navigation";
import GenericPage from "@/components/dashboard/GenericPage";
import { ROLES } from "@/lib/roles";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import TeamInvite from "@/lib/server/mongoose/models/TeamInvite";
import BillingSection from "../sections/BillingSection";

export async function generateMetadata() {
  const t = await getTranslations()
  return { title: t("Billing") }
}

export default async function TeamBillingPage() {
  const t = await getTranslations()
  const { user, team } = await useServerAuth();

  // Layout admits Owner + Admin. Billing is Owner-only.
  if (user.role !== ROLES.OWNER) redirect("/app/admin");

  const pendingInvites = await TeamInvite.countDocuments({ team: team._id });

  return (
    <GenericPage title={t("Billing")}>
      <BillingSection
        team={team.toJsonAsClient()}
        memberCount={team.users.length}
        pendingInvites={pendingInvites}
      />
    </GenericPage>
  );
}
