import { getTranslations } from "@/lib/server/language"
import { redirect } from "next/navigation";
import DefaultLayout from "@/components/dashboard/DefaultLayout";
import { ROLES } from "@/lib/roles";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import CapacityBanner from "./admin/CapacityBanner";

export async function generateMetadata() {
  const t = await getTranslations()
  return {
  title: {
    template: t("%s | Transfer.zip Admin"),
    default: t("Transfer.zip Admin"),
  },
}
}

export default async function AdminLayout({ children }) {
  const auth = await useServerAuth();
  if (!auth) redirect("/signin");

  const { user, team } = auth;
  if (!user.hasTeam || (user.role !== ROLES.OWNER && user.role !== ROLES.ADMIN)) {
    redirect("/app");
  }

  if (user.role === ROLES.OWNER && !team.onboarded) {
    redirect("/onboarding-team");
  }

  return (
    <>
      {/* <div
        aria-hidden
        className="grain fixed inset-0 -z-10 pointer-events-none bg-linear-to-b from-primary-700 to-primary-400"
      /> */}
      <div
        aria-hidden
        className="grain fixed inset-0 -z-10 pointer-events-none bg-linear-to-b from-primary-600 to-primary-300"
      />
      <DefaultLayout>
        <CapacityBanner
          memberCount={team.users.length}
          seats={team.seats || 0}
          isOwner={user.role === ROLES.OWNER}
        />
        {children}
      </DefaultLayout>
    </>
  );
}
