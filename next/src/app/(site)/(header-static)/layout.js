import { getLandingText, getLanguage } from "@/lib/server/language"
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { IS_SELFHOST } from "@/lib/isSelfHosted";

export default async function ({ children }) {
  const text = await getLandingText()
  const language = await getLanguage()
  const homeHref = language === "sv" ? "/sv" : "/"
  return (
    <div>
      <Header text={text.header} homeHref={homeHref} pricingHref={language === "sv" ? "/sv#pricing" : "/pricing"} />
      {children}
      {!IS_SELFHOST && <Footer text={text.footer} homeHref={homeHref} />}
    </div>
  )
}