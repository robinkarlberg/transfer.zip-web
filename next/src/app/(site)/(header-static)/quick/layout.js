import DashboardProvider from "@/context/DashboardContext";

export const metadata = {
  title: "Quick Transfer",
  description: "Send files of any size with end-to-end encryption. Both devices stay online while the files transfer.",
  openGraph: {
    title: "Quick Transfer | Transfer.zip",
    description: "Send files of any size with end-to-end encryption. Both devices stay online while the files transfer.",
    url: "https://transfer.zip/quick",
    siteName: "Transfer.zip",
    images: [
      {
        url: "/img/og/quick-transfer.jpg",
        width: 1200,
        height: 630,
        alt: "Transfer.zip Quick Transfer. Any size. End-to-end encrypted. A white paper airplane in flight.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quick Transfer | Transfer.zip",
    description: "Send files of any size with end-to-end encryption. Both devices stay online while the files transfer.",
    images: ["/img/og/quick-transfer.jpg"],
  },
};

export default function ({ children }) {
  return (
    <DashboardProvider>
      <div className="relative isolate">
        <div aria-hidden="true" className="grain absolute inset-0 -z-10 flex flex-col">
          <div className="h-svh shrink-0 bg-linear-to-b from-primary-600 to-primary-300" />
          <div className="grow bg-primary-300" />
        </div>
        <main>{children}</main>
      </div>
    </DashboardProvider>
  )
}
