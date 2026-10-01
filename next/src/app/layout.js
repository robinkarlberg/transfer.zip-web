import { FileProvider } from "@/context/FileProvider";
import GlobalProvider from "@/context/GlobalContext";
import { IS_SELFHOST } from "@/lib/isSelfHosted";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Fraunces, Inter } from "next/font/google";
import { headers } from "next/headers";
import Head from "next/head";
import Script from "next/script";
import "./globals.css";
import { IS_DEV } from "@/lib/server/serverUtils";
import { Toaster } from "sonner";
import DocumentLanguage from "@/components/DocumentLanguage";
import { LANDING_LANGUAGE_HEADER } from "@/lib/landing/routes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-fraunces",
})

export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://transfer.zip"),
  title: {
    template: "%s | Transfer.zip",
    default: "Transfer.zip | Quick & Easy File Transfer - Send Files",
  },
  description:
    "Free sharing of photos, videos and documents. Send large files instantly with a link or email. Simple, fast and secure file sharing with Transfer.zip.",
  openGraph: {
    title: "Quick & Easy File Transfer | Transfer.zip",
    description:
      "Free sharing of photos, videos and documents. Send large files instantly with a link or email. Simple, fast and secure file sharing with Transfer.zip.",
    url: "https://transfer.zip",
    siteName: "Transfer.zip",
    images: [
      {
        url: "/img/og/home.jpg",
        width: 1200,
        height: 630,
        alt: "Transfer.zip. Send big files. Simply. A white paper airplane carrying files across a blue sky.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quick & Easy File Sharing - Transfer.zip",
    description:
      "Send large files instantly with a link or email. Simple, fast and secure file sharing with Transfer.zip.",
    images: ["/img/og/home.jpg"],
  },
};

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const language = headersList.get(LANDING_LANGUAGE_HEADER) === "sv" ? "sv" : "en";
  const ua = headersList.get("user-agent") || "";
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

  return (
    <html lang={language} data-scroll-behavior="smooth" className={`${inter.variable} ${fraunces.variable}`}>
      {/* <Head> */}
      <Script src="/lib/ponyfill.min.js"></Script>
      {/* </Head> */}
      {/* {!IS_SELFHOST && !IS_DEV && process.env.MEGADESK_PUB && <Script defer src="https://getmegadesk.com/embed.js" data-pub={process.env.MEGADESK_PUB}></Script>} */}
      {!IS_SELFHOST && process.env.UMAMI_ANALYTICS_WEBSITE_ID && process.env.UMAMI_ANALYTICS_WEBSITE_ID.length == "36" ? <Script defer src="https://umami.rkt.dev/script.js" data-website-id={process.env.UMAMI_ANALYTICS_WEBSITE_ID} data-exclude-hash="true"></Script> : <></>}
      {!IS_SELFHOST && !IS_DEV && process.env.SIGMA_SEO_SITE_ID && <Script defer src="https://unhidden.so/seo.js" data-website-id={process.env.SIGMA_SEO_SITE_ID}></Script>}
      <body className="font-sans antialiased">
        <DocumentLanguage />
        <GlobalProvider isSafari={isSafari}>
          <FileProvider>
            {children}
          </FileProvider>
        </GlobalProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
