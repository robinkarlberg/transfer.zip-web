import { getLanguage } from "@/lib/server/language"
import { LanguageSync } from "@/context/LanguageContext"
import ProductLanguageSwitch from "@/components/ProductLanguageSwitch"
import ApplicationProvider from "@/context/ApplicationContext";

export const metadata = { title: "Transfer.zip" }

export default async function FullscreenLayout({ children }) {
  return (
    <div className="min-h-screen">
      <LanguageSync language={await getLanguage()} />
      <div className="absolute right-4 top-4 z-30 rounded-full bg-white"><ProductLanguageSwitch /></div>
      <ApplicationProvider>
        {children}
      </ApplicationProvider>
    </div>
  );
}
