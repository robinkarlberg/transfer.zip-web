"use client"

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";
import { getLandingLanguage, LANDING_PATHS } from "@/lib/landing/routes";
import { englishLandingText } from "@/lib/landing/en";
import { swedishLandingText } from "@/lib/landing/sv";

export default function ({ children }) {
  const pathname = usePathname();
  const language = getLandingLanguage(pathname);
  const text = language === "sv" ? swedishLandingText : englishLandingText;
  const homeHref = LANDING_PATHS[language];

  return (
    <div>
      <Header scrollAware homeHref={homeHref} pricingHref={language === "sv" ? "/sv#pricing" : "/pricing"} text={text.header} />
      {children}
      <Footer homeHref={homeHref} text={text.footer} showLanguageSwitch />
    </div>
  )
}
