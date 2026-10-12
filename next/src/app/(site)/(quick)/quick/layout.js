import { getLanguage, getTranslations } from "@/lib/server/language"
import { QUICK_ALTERNATES, QUICK_PATHS } from "@/lib/landing/routes"
import DashboardProvider from "@/context/DashboardContext";
import SiteLayout from "../../(header-static)/layout"

export async function generateMetadata() {
  const t = await getTranslations()
  const language = await getLanguage()
  return {
    title: t("Quick Transfer"),
    description: t("Send files of any size with end-to-end encryption. Both devices stay online while the files transfer."),
    alternates: {
      canonical: QUICK_PATHS[language],
      languages: QUICK_ALTERNATES,
    },
    openGraph: {
      title: t("Quick Transfer | Transfer.zip"),
      description: t("Send files of any size with end-to-end encryption. Both devices stay online while the files transfer."),
      url: QUICK_PATHS[language],
      siteName: "Transfer.zip",
      images: [
        {
          url: "/img/og/quick-transfer.jpg",
          width: 1200,
          height: 630,
          alt: t("Transfer.zip Quick Transfer. Any size. End-to-end encrypted. A white paper airplane in flight."),
        },
      ],
      locale: language === "sv" ? "sv_SE" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("Quick Transfer | Transfer.zip"),
      description: t("Send files of any size with end-to-end encryption. Both devices stay online while the files transfer."),
      images: ["/img/og/quick-transfer.jpg"],
    },
  }
}

export default function ({ children }) {
  return (
    <SiteLayout>
      <DashboardProvider>
        <div className="relative isolate">
          <div aria-hidden="true" className="grain absolute inset-0 -z-10 flex flex-col">
            <div className="h-svh shrink-0 bg-linear-to-b from-primary-600 to-primary-300" />
            <div className="grow bg-primary-300" />
          </div>
          <main>{children}</main>
        </div>
      </DashboardProvider>
    </SiteLayout>
  )
}
