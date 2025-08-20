import { Playfair_Display, Roboto } from "next/font/google";
import "./globals.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FileProvider } from "@/context/FileProvider";
import Script from "next/script";
import Head from "next/head";
import { IS_SELFHOST } from "@/lib/isSelfHosted";
import GlobalProvider from "@/context/GlobalContext";

// const playfairDisplay = Playfair_Display({
//   weight: ['400', '500', '600', '700', '800', '900'],
//   subsets: ["latin"]
// })

const roboto = Roboto({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ["latin"]
})

export const metadata = {
  title: "Transfer.zip | Quick & Easy File Transfer",
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
      <Head>
        <script src="/lib/ponyfill.min.js"></script>
      </Head>
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
