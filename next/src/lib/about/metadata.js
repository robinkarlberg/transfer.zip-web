import { ABOUT_ALTERNATES, ABOUT_PATHS } from "@/lib/landing/routes"
import { englishAboutText } from "./en"
import { swedishAboutText } from "./sv"

export function getAboutMetadata(language) {
  const swedish = language === "sv"
  const { title, socialTitle, description } = (swedish ? swedishAboutText : englishAboutText).meta
  const images = [swedish ? "/sv/social-image" : "/img/og/home.jpg"]

  return {
    title,
    description,
    alternates: {
      canonical: ABOUT_PATHS[language],
      languages: ABOUT_ALTERNATES,
    },
    openGraph: {
      title: socialTitle,
      description,
      url: ABOUT_PATHS[language],
      siteName: "Transfer.zip",
      images,
      locale: swedish ? "sv_SE" : "en_US",
      alternateLocale: [swedish ? "en_US" : "sv_SE"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images,
    },
  }
}
