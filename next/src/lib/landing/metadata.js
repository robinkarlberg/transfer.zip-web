import { LANDING_ALTERNATES, LANDING_PATHS } from "./routes"

const titles = {
  en: "Transfer.zip | Quick & Easy File Transfer - Send Files",
  sv: "Skicka stora filer gratis | Transfer.zip",
}

const descriptions = {
  en: "Free sharing of photos, videos and documents. Send large files instantly with a link or email. Simple, fast and secure file sharing with Transfer.zip.",
  sv: "Skicka stora filer gratis med Transfer.zip. Dela bilder, videor och dokument utan storleksgräns med snabböverföringar. Lagra filer med ett abonnemang.",
}

export function getLandingMetadata(language) {
  const swedish = language === "sv"
  const image = {
    url: swedish ? "/sv/social-image" : "/img/og/home.jpg",
    width: 1200,
    height: 630,
    alt: swedish
      ? "Transfer.zip. Skicka stora filer. Enkelt."
      : "Transfer.zip. Send big files. Simply. A white paper airplane carrying files across a blue sky.",
  }

  return {
    title: { absolute: titles[language] },
    description: descriptions[language],
    alternates: {
      canonical: LANDING_PATHS[language],
      languages: LANDING_ALTERNATES,
    },
    openGraph: {
      title: swedish ? titles.sv : "Quick & Easy File Transfer | Transfer.zip",
      description: descriptions[language],
      url: LANDING_PATHS[language],
      siteName: "Transfer.zip",
      images: [image],
      locale: swedish ? "sv_SE" : "en_US",
      alternateLocale: [swedish ? "en_US" : "sv_SE"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: swedish ? titles.sv : "Quick & Easy File Sharing - Transfer.zip",
      description: swedish
        ? descriptions.sv
        : "Send large files instantly with a link or email. Simple, fast and secure file sharing with Transfer.zip.",
      images: [image],
    },
  }
}
