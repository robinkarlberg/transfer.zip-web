import LandingPage from "../LandingPage";
import { RECEIVE_ALTERNATES, RECEIVE_PATHS } from "@/lib/landing/routes";

export const metadata = {
  title: "Transfer.zip | Receive Files - Quick & Easy",
  description:
    "Free sharing of photos, videos and documents. Send large files instantly with a link or email. Simple, fast and secure file sharing with Transfer.zip.",
  alternates: {
    canonical: RECEIVE_PATHS.en,
    languages: RECEIVE_ALTERNATES,
  },
  openGraph: {
    title: "Receive Files | Transfer.zip",
    description:
      "Free sharing of photos, videos and documents. Send large files instantly with a link or email. Simple, fast and secure file sharing with Transfer.zip.",
    url: "https://transfer.zip/receive",
    siteName: "Transfer.zip",
    images: [
      {
        url: "/img/og/receive.jpg",
        width: 1200,
        height: 630,
        alt: "Transfer.zip. Receive files. With a link. Documents arriving in a white paper inbox.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Receive Files | Quick & Easy - Transfer.zip",
    description:
      "Receive large files instantly with a link or email. Simple, fast and secure file sharing with Transfer.zip.",
    images: ["/img/og/receive.jpg"],
  },
};

export default function ReceivePage() {
  return <LandingPage mode="receive" />
}
