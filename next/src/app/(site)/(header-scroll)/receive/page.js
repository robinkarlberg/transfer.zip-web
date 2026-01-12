import Features1 from "@/components/Features1";
import LandingNew from "../LandingNew";
import TestimonialCloud from "@/components/TestimonialCloud";
import Features2 from "@/components/Features2";
import Features3 from "@/components/Features3";
import IndieStatement from "@/components/IndieStatement";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";

export const metadata = {
  title: "Transfer.zip | Receive Files - Quick & Easy",
  description:
    "Free sharing of photos, videos and documents. Send large files instantly with a link or email. Simple, fast and secure file sharing with Transfer.zip.",
  openGraph: {
    title: "Quick & Easy File Transfer | Transfer.zip",
    description:
      "Free sharing of photos, videos and documents. Send large files instantly with a link or email. Simple, fast and secure file sharing with Transfer.zip.",
    url: "https://transfer.zip",
    siteName: "Transfer.zip",
    images: [
      {
        url: "https://cdn.transfer.zip/og.png",
        width: 1200,
        height: 630,
        alt: "Transfer.zip tagline \"Send Big Files Without Limits\".",
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
    images: ["https://cdn.transfer.zip/og.png"],
  },
};

export default function () {
  return (
    <div>
      {/* <HashInterceptor /> */}
      <LandingNew mode={"receive"} />
      <Features1 />
      <TestimonialCloud />
      <Features2 />
      <Features3 />
      <div className="relative">
        <div className="w-full h-screen overflow-hidden absolute grain bg-linear-to-b from-primary-600 to-primary-300" />
        <div className="py-24 px-2 sm:px-8 relative">
          <p className="text-center mt-2 text-pretty text-3xl font-bold tracking-tight text-white sm:text-3xl lg:text-balance text-shadow-md">
            A quick message from the founder.
          </p>
          <IndieStatement compact />
        </div>
      </div>
      <Pricing />
      <FAQ />
      <CTA />
    </div>
  )
}