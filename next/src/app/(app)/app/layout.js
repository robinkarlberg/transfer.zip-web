import DashboardProvider from "@/context/DashboardContext";
import { redirect } from "next/navigation";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import ApplicationProvider from "@/context/ApplicationContext";
import Sidebar from "./Sidebar";
import { FileProvider } from "@/context/FileProvider";

export const metadata = {
  title: "Dashboard"
};

export default async function DashboardLayout({ children }) {
  let auth;
  try {
    auth = await useServerAuth();
  } catch (error) {
    // console.error("Error during authentication:", error);
    return redirect("/signup");
  }

  const storage = await auth.user.getStorage()

  return (
    <div>
      <div className="flex flex-col lg:flex-row min-h-screen">
        <ApplicationProvider>
          <DashboardProvider>
            <Sidebar user={auth.user.friendlyObj()} storage={storage} />
            {children}
          </DashboardProvider>
        </ApplicationProvider>
      </div>
    </div>
  );
}
