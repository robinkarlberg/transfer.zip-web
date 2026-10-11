import { LanguageSync } from "@/context/LanguageContext"
import { getLanguage, getTranslations } from "@/lib/server/language"
import DashboardProvider from "@/context/DashboardContext";
import { redirect } from "next/navigation";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import ApplicationProvider from "@/context/ApplicationContext";
import FloatingBar from "./FloatingBar";
import { ROLES } from "@/lib/roles";

export async function generateMetadata() {
  const t = await getTranslations()
  return {
  title: {
    template: t("%s | Dashboard"),
    default: t("Dashboard"),
  },
}
}

export default async function DashboardLayout({ children }) {
  const auth = await useServerAuth();
  if (!auth) {
    return redirect("/signin");
  }

  // Here we have some redirects based on user's / team's state before they enter the dashboard

  if (auth.user.hasTeam && !auth.user.team.isActive()) {
    return redirect("/team-paused")
  }

  if (auth.user.getPlan() == "free") {
    return redirect("/onboarding")
  }

  if (auth.user.hasTeam && auth.user.role === ROLES.OWNER && !auth.user.team.onboarded) {
    return redirect("/onboarding-team")
  }

  // Strict false - `undefined` means the user predates the onboarding
  // flow and shouldn't be pulled into it.
  if (!auth.user.hasTeam && auth.user.onboarded === false) {
    return redirect("/onboarding-pro")
  }

  // const storage = await auth.user.getStorage()

  return (
    <div className="h-screen flex flex-col overflow-auto relative">
      <LanguageSync language={await getLanguage()} />
      <ApplicationProvider>
        <DashboardProvider>
          {children}
          <FloatingBar user={auth.user.toJsonAsClient()} />
        </DashboardProvider>
      </ApplicationProvider>
    </div>
  );
}
