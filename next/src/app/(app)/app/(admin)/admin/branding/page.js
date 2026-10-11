import { getTranslations } from "@/lib/server/language"
import BrandingPage from "@/components/dashboard/branding/BrandingPage";

export async function generateMetadata() {
  const t = await getTranslations()
  return { title: t("Branding") }
}

export default function () {
  return <BrandingPage />;
}
