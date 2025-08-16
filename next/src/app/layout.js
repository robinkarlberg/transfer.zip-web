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
  title: "Transfer.zip - Send Large Files | 100GB+",
  description: "Ultrafast, Reliable and Secure file transfers. No throttling. No size limits. Open source.",
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
