import DashboardProvider from "@/context/DashboardContext";
import { redirect } from "next/navigation";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import ApplicationProvider from "@/context/ApplicationContext";
import Sidebar from "./Sidebar";
import { FileProvider } from "@/context/FileProvider";
import { SelectedTransferProvider } from "@/context/SelectedTransferProvider";
import { IS_SELFHOST } from "@/lib/isSelfHosted";
import DismissibleBanner from "./DismissibleBanner";

export const metadata = {
  title: "Dashboard"
};

export default async function DashboardLayout({ children }) {
  let auth;
  try {
    auth = await useServerAuth();
  } catch (error) {
    // console.error("Error during authentication:", error);
    return redirect("/signin");
  }

  if (auth.user.getPlan() == "free") {
    return redirect("/onboarding")
  }

  const storage = await auth.user.getStorage()

  return (
    <div>
      {!IS_SELFHOST && <DismissibleBanner />}
      <div className="flex flex-col lg:flex-row min-h-screen">
        <ApplicationProvider>
          <DashboardProvider>
            <SelectedTransferProvider>
              <Sidebar user={auth.user.friendlyObj()} storage={storage} />
              {children}
            </SelectedTransferProvider>
          </DashboardProvider>
        </ApplicationProvider>
      </div>
    </div>
  );
}
