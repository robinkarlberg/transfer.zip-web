import { Playfair_Display, Roboto } from "next/font/google";
import "./globals.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FileProvider } from "@/context/FileProvider";

const playfairDisplay = Playfair_Display({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ["latin"]
})

const roboto = Roboto({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ["latin"]
})

export const metadata = {
  title: "Transfer.zip - Send Large Files for Free | 100GB+",
  description: "Quickly send large files! No signup, no size limit, with end-to-end encryption, all for free.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${roboto.className} antialiased`} // ${roboto.className} ${playfairDisplay.className} 
      >
        {/* <FileProvider> */}
          {children}
        {/* </FileProvider> */}
      </body>
    </html>
  );
}
