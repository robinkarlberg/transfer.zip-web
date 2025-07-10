import { Playfair_Display, Roboto } from "next/font/google";
import "./globals.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FileProvider } from "@/context/FileProvider";
import Script from "next/script";
import Head from "next/head";

const playfairDisplay = Playfair_Display({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ["latin"]
})

const roboto = Roboto({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ["latin"]
})

export const metadata = {
  title: "Transfer.zip - Send Large Files | 100GB+",
  description: "Quickly send large files! No signup, no size limit, with end-to-end encryption, all for free.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <script src="/lib/ponyfill.min.js"></script>
      </Head>
      <body
        className={`${roboto.className} antialiased`} // ${roboto.className} ${playfairDisplay.className} 
      >
        <FileProvider>
          {children}
        </FileProvider>
      </body>
    </html>
  );
}
