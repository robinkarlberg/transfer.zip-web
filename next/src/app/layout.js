import { FileProvider } from "@/context/FileProvider";
import GlobalProvider from "@/context/GlobalContext";
import { IS_SELFHOST } from "@/lib/isSelfHosted";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Bricolage_Grotesque, Roboto } from "next/font/google";
import Head from "next/head";
import Script from "next/script";
import "./globals.css";

const roboto = Bricolage_Grotesque({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ["latin"]
})

export const metadata = {
  title: "Transfer.zip | Quick & Easy File Transfer - Send Files",
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
        url: "https://cdn.transfer.zip/og.png",
        width: 1200,
        height: 630,
        alt: "Transfer.zip tagline \"Send Big Files Without Limits\".",
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
    images: ["https://cdn.transfer.zip/og.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* <Head> */}
      <Script src="/lib/ponyfill.min.js"></Script>
      {/* </Head> */}
      {!IS_SELFHOST && process.env.UMAMI_ANALYTICS_WEBSITE_ID && process.env.UMAMI_ANALYTICS_WEBSITE_ID.length == "36" ? <Script defer src="https://umami.w0bb.com/script.js" data-website-id={process.env.UMAMI_ANALYTICS_WEBSITE_ID}></Script> : <></>}
      <body
        className={`${roboto.className} antialiased`} // ${roboto.className} ${playfairDisplay.className} 
      >
        <GlobalProvider>
          <FileProvider>
            {children}
          </FileProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}
