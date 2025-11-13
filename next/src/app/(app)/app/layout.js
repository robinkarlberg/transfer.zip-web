import DashboardProvider from "@/context/DashboardContext";
import { redirect } from "next/navigation";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import ApplicationProvider from "@/context/ApplicationContext";
import Sidebar from "./Sidebar";
import { FileProvider } from "@/context/FileProvider";
import { SelectedTransferProvider } from "@/context/SelectedTransferProvider";
import { IS_SELFHOST } from "@/lib/isSelfHosted";
import DismissibleBanner from "./DismissibleBanner";
import Link from "next/link";

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
      {/* {!IS_SELFHOST && <DismissibleBanner />} */}
      <div className="h-screen flex flex-col bg-primary-700/85 overflow-hidden">
        <ApplicationProvider>
          <DashboardProvider>
            <SelectedTransferProvider>
              <div className="h-10 flex-none w-full flex">
                <div className="flex-1 flex items-center justify-center">
                  {/* <Image alt="logo" src={logo} className="w-6" /> */}
                  <h1 className="text-white text-lg text-center font-bold"><Link href="/">{process.env.NEXT_PUBLIC_SITE_NAME}</Link></h1>
                  {/* <span className="ms-2 text-primary-50 text-sm">{process.env.NEXT_PUBLIC_VERSION || "v0.1"}</span> */}
                </div>
              </div>
              <div className="flex-1 flex overflow-hidden">
                <Sidebar user={auth.user.friendlyObj()} storage={storage} />
                <div className="flex-1 flex flex-col bg-white rounded-tl-xl w-full overflow-clip">
                  {children}
                </div>
              </div>
            </SelectedTransferProvider>
          </DashboardProvider>
        </ApplicationProvider>
      </div>
    </div>
  );
}
