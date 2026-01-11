import DashboardProvider from "@/context/DashboardContext";
import { redirect } from "next/navigation";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import ApplicationProvider from "@/context/ApplicationContext";
import FloatingBar from "./FloatingBar";
import { FileProvider } from "@/context/FileProvider";
import { SelectedTransferProvider } from "@/context/SelectedTransferProvider";
import { IS_SELFHOST } from "@/lib/isSelfHosted";
import DismissibleBanner from "./DismissibleBanner";
import Link from "next/link";
import Image from "next/image";

import logo from "@/img/icon.png"

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

  // const storage = await auth.user.getStorage()

  return (
    <div>
      {/* {!IS_SELFHOST && <DismissibleBanner />} */}
      <div className="w-full h-screen absolute grain bg-linear-to-b from-primary-600 to-primary-300" />
      <div className="h-screen flex flex-col overflow-auto relative">
        <ApplicationProvider>
          <DashboardProvider>
            {children}
            <FloatingBar user={auth.user.friendlyObj()} />
          </DashboardProvider>
        </ApplicationProvider>
      </div>
    </div>
  );
}
